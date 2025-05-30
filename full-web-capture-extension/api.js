window.CaptureAPI = (function() {

    var MAX_PRIMARY_DIMENSION = 15000 * 2,
        MAX_SECONDARY_DIMENSION = 4000 * 2,
        MAX_AREA = MAX_PRIMARY_DIMENSION * MAX_SECONDARY_DIMENSION;

    // Lưu trữ các blob đã chụp để có thể tải xuống sau
    var capturedBlobs = [];

    //
    // URL Matching test - to verify we can talk to this URL
    //

    var matches = ['http://*/*', 'https://*/*', 'ftp://*/*', 'file://*/*'],
        noMatches = [/^https?:\/\/chrome.google.com\/.*$/];

    function isValidUrl(url) {
        // couldn't find a better way to tell if executeScript
        // wouldn't work -- so just testing against known urls
        // for now...
        var r, i;
        for (i = noMatches.length - 1; i >= 0; i--) {
            if (noMatches[i].test(url)) {
                return false;
            }
        }
        for (i = matches.length - 1; i >= 0; i--) {
            r = new RegExp('^' + matches[i].replace(/\*/g, '.*') + '$');
            if (r.test(url)) {
                return true;
            }
        }
        return false;
    }


    function initiateCapture(tab, callback) {
        chrome.tabs.sendMessage(tab.id, {msg: 'scrollPage'}, function() {
            // We're done taking snapshots of all parts of the window. Display
            // the resulting full screenshot images in a new browser tab.
            callback();
        });
    }


    function capture(data, screenshots, sendResponse, splitnotifier) {
        // Get current configuration options
        const captureOptions = typeof ScreenshotConfig !== 'undefined' ? 
            ScreenshotConfig.toChromeOptions() : {format: 'png'};
            
        if (SCREENSHOT_OPTIONS.format === 'jpeg' && !captureOptions.quality) {
            captureOptions.quality = SCREENSHOT_OPTIONS.quality;
        }
        
        if (typeof ScreenshotConfig !== 'undefined' && ScreenshotConfig.getConfig().debugMode) {
            console.log('Capturing with options:', captureOptions);
        }
        
        chrome.tabs.captureVisibleTab(
            null, captureOptions, function(dataURI) {
                if (dataURI) {
                    var image = new Image();
                    image.onload = function() {
                        data.image = {width: image.width, height: image.height};

                        // given device mode emulation or zooming, we may end up with
                        // a different sized image than expected, so let's adjust to
                        // match it!
                        if (data.windowWidth !== image.width) {
                            var scale = image.width / data.windowWidth;
                            data.x *= scale;
                            data.y *= scale;
                            data.totalWidth *= scale;
                            data.totalHeight *= scale;
                        }

                        // lazy initialization of screenshot canvases (since we need to wait
                        // for actual image size)
                        if (!screenshots.length) {
                            Array.prototype.push.apply(
                                screenshots,
                                _initScreenshots(data.totalWidth, data.totalHeight)
                            );
                            if (screenshots.length > 1) {
                                if (splitnotifier) {
                                    splitnotifier();
                                }
                                $('screenshot-count').innerText = screenshots.length;
                            }
                        }

                        // draw it on matching screenshot canvases
                        _filterScreenshots(
                            data.x, data.y, image.width, image.height, screenshots
                        ).forEach(function(screenshot) {
                            screenshot.ctx.drawImage(
                                image,
                                data.x - screenshot.left,
                                data.y - screenshot.top
                            );
                        });

                        // Enhanced success logging
                        if (typeof ScreenshotConfig !== 'undefined' && ScreenshotConfig.getConfig().debugMode) {
                            console.log('Capture successful:', data);
                        }

                        // send back log data for debugging (but keep it truthy to
                        // indicate success)
                        sendResponse(JSON.stringify(data, null, 4) || true);
                    };
                    image.src = dataURI;
                } else {
                    if (typeof ScreenshotConfig !== 'undefined' && ScreenshotConfig.getConfig().debugMode) {
                        console.error('No dataURI received from captureVisibleTab');
                    }
                }
            });
    }

    // Utility function for popup.js
    function $(id) { return document.getElementById(id); }

    function _initScreenshots(totalWidth, totalHeight) {
        // Create and return an array of screenshot objects based
        // on the `totalWidth` and `totalHeight` of the final image.
        // We have to account for multiple canvases if too large,
        // because Chrome won't generate an image otherwise.
        //
        var badSize = (totalHeight > MAX_PRIMARY_DIMENSION ||
                       totalWidth > MAX_PRIMARY_DIMENSION ||
                       totalHeight * totalWidth > MAX_AREA),
            biggerWidth = totalWidth > totalHeight,
            maxWidth = (!badSize ? totalWidth :
                        (biggerWidth ? MAX_PRIMARY_DIMENSION : MAX_SECONDARY_DIMENSION)),
            maxHeight = (!badSize ? totalHeight :
                         (biggerWidth ? MAX_SECONDARY_DIMENSION : MAX_PRIMARY_DIMENSION)),
            numCols = Math.ceil(totalWidth / maxWidth),
            numRows = Math.ceil(totalHeight / maxHeight),
            row, col, canvas, left, top;

        var canvasIndex = 0;
        var result = [];

        for (row = 0; row < numRows; row++) {
            for (col = 0; col < numCols; col++) {
                canvas = document.createElement('canvas');
                canvas.width = (col == numCols - 1 ? totalWidth % maxWidth || maxWidth :
                                maxWidth);
                canvas.height = (row == numRows - 1 ? totalHeight % maxHeight || maxHeight :
                                 maxHeight);

                left = col * maxWidth;
                top = row * maxHeight;

                result.push({
                    canvas: canvas,
                    ctx: canvas.getContext('2d'),
                    index: canvasIndex,
                    left: left,
                    right: left + canvas.width,
                    top: top,
                    bottom: top + canvas.height
                });

                canvasIndex++;
            }
        }

        return result;
    }


    function _filterScreenshots(imgLeft, imgTop, imgWidth, imgHeight, screenshots) {
        // Filter down the screenshots to ones that match the location
        // of the given image.
        //
        var imgRight = imgLeft + imgWidth,
            imgBottom = imgTop + imgHeight;
        return screenshots.filter(function(screenshot) {
            return (imgLeft < screenshot.right &&
                    imgRight > screenshot.left &&
                    imgTop < screenshot.bottom &&
                    imgBottom > screenshot.top);
        });
    }


    function getBlobs(screenshots) {
        var blobs = screenshots.map(function(screenshot) {
            var dataURI = screenshot.canvas.toDataURL();

            // convert base64 to raw binary data held in a string
            // doesn't handle URLEncoded DataURIs
            var byteString = atob(dataURI.split(',')[1]);

            // separate out the mime component
            var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

            // write the bytes of the string to an ArrayBuffer
            var ab = new ArrayBuffer(byteString.length);
            var ia = new Uint8Array(ab);
            for (var i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }

            // create a blob for writing to a file
            var blob = new Blob([ab], {type: mimeString});
            return blob;
        });
        
        // Lưu trữ các blob để sử dụng sau
        capturedBlobs = blobs;
        
        return blobs;
    }


    function saveBlob(blob, filename, index, callback, errback) {
        filename = _addFilenameSuffix(filename, index);

        function onwriteend() {
            // open the file that now contains the blob - calling
            // `openPage` again if we had to split up the image
            var urlName = ('filesystem:chrome-extension://' +
                           chrome.i18n.getMessage('@@extension_id') +
                           '/temporary/' + filename);

            callback(urlName);
        }

        // come up with file-system size with a little buffer
        var size = blob.size + (1024 / 2);

        // create a blob for writing to a file
        var reqFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
        reqFileSystem(window.TEMPORARY, size, function(fs){
            fs.root.getFile(filename, {create: true}, function(fileEntry) {
                fileEntry.createWriter(function(fileWriter) {
                    fileWriter.onwriteend = onwriteend;
                    fileWriter.write(blob);
                }, errback); // TODO - standardize error callbacks?
            }, errback);
        }, errback);
    }


    function _addFilenameSuffix(filename, index) {
        if (!index) {
            return filename;
        }
        var sp = filename.split('.');
        var ext = sp.pop();
        return sp.join('.') + '-' + (index + 1) + '.' + ext;
    }


    // Enhanced error handling and options based on Playwright patterns
    var SCREENSHOT_OPTIONS = {
        format: 'png',
        quality: 90,
        timeout: 15000,      // Nhanh: 15s
        retryAttempts: 2,    // Nhanh: 2 lần thử
        errorScreenshot: true
    };

    // Load configuration from ScreenshotConfig if available
    function loadEnhancedConfig() {
        if (typeof ScreenshotConfig !== 'undefined') {
            ScreenshotConfig.loadConfig(function(config) {
                SCREENSHOT_OPTIONS = Object.assign(SCREENSHOT_OPTIONS, {
                    format: config.format,
                    quality: config.quality,
                    timeout: config.timeout,
                    retryAttempts: config.retryAttempts,
                    errorScreenshot: config.errorScreenshot
                });
                
                if (config.debugMode) {
                    console.log('API using enhanced config:', SCREENSHOT_OPTIONS);
                }
            });
        }
    }

    // Initialize enhanced configuration
    loadEnhancedConfig();

    // Enhanced error handling with screenshot capture
    function handleCaptureError(error, tab, callback, errback) {
        console.error('Capture error:', error);
        
        // Capture error screenshot if possible
        if (SCREENSHOT_OPTIONS.errorScreenshot && tab) {
            try {
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
                const errorFilename = `error_screenshot_${timestamp}.png`;
                
                chrome.tabs.captureVisibleTab(null, {format: 'png'}, function(dataURI) {
                    if (dataURI) {
                        // Convert to blob and save error screenshot
                        const blob = dataURIToBlob(dataURI);
                        saveErrorScreenshot(blob, errorFilename);
                    }
                });
            } catch (screenshotError) {
                console.error('Failed to capture error screenshot:', screenshotError);
            }
        }
        
        if (errback) {
            errback(error);
        }
    }

    // Convert dataURI to blob for error screenshots
    function dataURIToBlob(dataURI) {
        const byteString = atob(dataURI.split(',')[1]);
        const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ab], {type: mimeString});
    }

    // Save error screenshot with timestamp naming
    function saveErrorScreenshot(blob, filename) {
        const size = blob.size + (1024 / 2);
        const reqFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
        
        reqFileSystem(window.TEMPORARY, size, function(fs) {
            fs.root.getFile(filename, {create: true}, function(fileEntry) {
                fileEntry.createWriter(function(fileWriter) {
                    fileWriter.onwriteend = function() {
                        console.log('Error screenshot saved:', filename);
                    };
                    fileWriter.write(blob);
                });
            });
        });
    }

    function captureToBlobs(tab, callback, errback, progress, splitnotifier) {
        var loaded = false,
            screenshots = [],
            timeout = SCREENSHOT_OPTIONS.timeout,
            timedOut = false,
            retryCount = 0,
            noop = function() {};

        callback = callback || noop;
        errback = errback || noop;
        progress = progress || noop;

        if (!isValidUrl(tab.url)) {
            handleCaptureError('invalid url', tab, callback, errback);
            return;
        }

        // Enhanced retry logic with exponential backoff
        function attemptCapture() {
            chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
                if (request.msg === 'capture') {
                    progress(request.complete);
                    
                    // Handle initial progress messages differently
                    if (request.initializing) {
                        sendResponse(true);
                        return true;
                    }
                    
                    capture(request, screenshots, sendResponse, splitnotifier);
                    return true;
                } else {
                    console.error('Unknown message received from content script: ' + request.msg);
                    if (retryCount < SCREENSHOT_OPTIONS.retryAttempts) {
                        retryCount++;
                        const retryDelay = Math.pow(2, retryCount) * 250; // Nhanh hơn: 250ms base
                        console.log(`Retrying capture in ${retryDelay}ms (attempt ${retryCount}/${SCREENSHOT_OPTIONS.retryAttempts})`);
                        setTimeout(attemptCapture, retryDelay);
                    } else {
                        handleCaptureError('max retries exceeded', tab, callback, errback);
                    }
                    return false;
                }
            });

            chrome.tabs.executeScript(tab.id, {file: 'page.js'}, function() {
                if (chrome.runtime.lastError) {
                    console.error('Script execution error:', chrome.runtime.lastError);
                    if (retryCount < SCREENSHOT_OPTIONS.retryAttempts) {
                        retryCount++;
                        setTimeout(attemptCapture, 500);  // Nhanh hơn: 500ms
                        return;
                    } else {
                        handleCaptureError(chrome.runtime.lastError.message, tab, callback, errback);
                        return;
                    }
                }

                if (timedOut) {
                    console.error('Timed out too early while waiting for chrome.tabs.executeScript');
                    handleCaptureError('execute timeout', tab, callback, errback);
                } else {
                    loaded = true;
                    progress(0);

                    initiateCapture(tab, function() {
                        callback(getBlobs(screenshots));
                    });
                }
            });
        }

        attemptCapture();

        window.setTimeout(function() {
            if (!loaded) {
                timedOut = true;
                handleCaptureError('execute timeout', tab, callback, errback);
            }
        }, timeout);
    }


    function captureToFiles(tab, filename, callback, errback, progress, splitnotifier) {
        progress = progress || function() {};
        
        captureToBlobs(tab, function(blobs) {
            var i = 0,
                len = blobs.length,
                filenames = [];

            // Send progress for blob processing phase (80-95%)
            progress(0.8);

            (function doNext() {
                saveBlob(blobs[i], filename, i, function(filename) {
                    i++;
                    filenames.push(filename);
                    
                    // Calculate file saving progress (80% to 95%)
                    var fileProgress = 0.8 + (i / len) * 0.15;
                    progress(fileProgress);
                    
                    if (i >= len) {
                        // Final progress update before completion
                        progress(0.98);
                        callback(filenames);
                    } else {
                        doNext();
                    }
                }, errback);
            })();
        }, errback, progress, splitnotifier);
    }
    
    // Cung cấp các blob đã chụp
    function getCapturedBlobs() {
        return capturedBlobs;
    }


    return {
        captureToBlobs: captureToBlobs,
        captureToFiles: captureToFiles,
        getCapturedBlobs: getCapturedBlobs
    };

})();
