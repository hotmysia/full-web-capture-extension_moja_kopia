// Copyright (c) 2012,2013 Peter Coles - http://mrcoles.com/ - All rights reserved.
// Use of this source code is governed by the MIT License found in LICENSE


//
// State fields
//

var currentTab, // result of chrome.tabs.query of current active tab
    resultWindowId; // window id for putting resulting images


//
// Utility methods
//

function $(id) { return document.getElementById(id); }
function show(id) { $(id).style.display = 'block'; }
function hide(id) { $(id).style.display = 'none'; }


function getFilename(contentURL) {
    var name = contentURL.split('?')[0].split('#')[0];
    if (name) {
        name = name
            .replace(/^https?:\/\//, '')
            .replace(/[^A-z0-9]+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^[_\-]+/, '')
            .replace(/[_\-]+$/, '');
        name = '-' + name;
    } else {
        name = '';
    }
    return 'screencapture' + name + '-' + Date.now() + '.png';
}


//
// Capture Handlers
//


function displayCaptures(filenames) {
    if (!filenames || !filenames.length) {
        show('uh-oh');
        return;
    }

    // Show completion before opening result
    var percentElement = $('progress-percent');
    var progressText = $('progress-text');
    var bar = $('bar');
    
    if (percentElement && progressText && bar) {
        percentElement.textContent = '100%';
        progressText.textContent = 'Capture completed!';
        bar.style.width = '100%';
        
        // Hide loading GIF when truly complete
        hide('long-page');
        
        // Brief delay to show completion
        setTimeout(function() {
            openResultPage(filenames);
        }, 500);
    } else {
        openResultPage(filenames);
    }
}

function openResultPage(filenames) {
    // Lưu dữ liệu vào localStorage để trang kết quả có thể truy cập
    const captureData = {
        images: filenames,
        url: currentTab.url,
        timestamp: Date.now()
    };
    localStorage.setItem('captureData', JSON.stringify(captureData));

    // Mở trang kết quả trong tab mới
    const resultUrl = chrome.runtime.getURL('result.html');
    chrome.tabs.create({
        url: resultUrl,
        active: true,
        openerTabId: currentTab.id,
        index: currentTab.index + 1
    });

    // Đóng popup sau khi mở trang kết quả
    window.close();
}


function _displayCapture(filenames, index) {
    index = index || 0;

    var filename = filenames[index];
    var last = index === filenames.length - 1;

    if (currentTab.incognito && index === 0) {
        // cannot access file system in incognito, so open in non-incognito
        // window and add any additional tabs to that window.
        //
        // we have to be careful with focused too, because that will close
        // the popup.
        chrome.windows.create({
            url: filename,
            incognito: false,
            focused: last
        }, function(win) {
            resultWindowId = win.id;
        });
    } else {
        chrome.tabs.create({
            url: filename,
            active: last,
            windowId: resultWindowId,
            openerTabId: currentTab.id,
            index: (currentTab.incognito ? 0 : currentTab.index) + 1 + index
        });
    }

    if (!last) {
        _displayCapture(filenames, index + 1);
    }
}


function errorHandler(reason) {
    console.error('Capture error:', reason);
    
    // Enhanced error handling with specific error types
    switch(reason) {
        case 'execute timeout':
            console.log('Retrying with longer timeout...');
            setTimeout(function() {
                retryCapture();
            }, 2000);
            break;
            
        case 'invalid url':
            show('invalid');
            break;
            
        case 'max retries exceeded':
            // Show specific error for max retries
            const errorDiv = $('uh-oh');
            if (errorDiv) {
                errorDiv.innerHTML = `
                    <h3>Capture Failed</h3>
                    <p>Maximum retry attempts exceeded. This might be due to:</p>
                    <ul>
                        <li>Very large page content</li>
                        <li>Page loading issues</li>
                        <li>Network connectivity problems</li>
                    </ul>
                    <button onclick="retryCapture()" style="margin-top: 10px; padding: 5px 10px;">Try Again</button>
                `;
            }
            show('uh-oh');
            break;
            
        case 'script injection failed':
            const scriptErrorDiv = $('uh-oh');
            if (scriptErrorDiv) {
                scriptErrorDiv.innerHTML = `
                    <h3>Script Error</h3>
                    <p>Unable to inject capture script. This page might have:</p>
                    <ul>
                        <li>Content Security Policy restrictions</li>
                        <li>Special security settings</li>
                        <li>Protected content</li>
                    </ul>
                `;
            }
            show('uh-oh');
            break;
            
        default:
            // Generic error with more helpful information
            const genericErrorDiv = $('uh-oh');
            if (genericErrorDiv && !genericErrorDiv.innerHTML.includes('Try Again')) {
                const originalContent = genericErrorDiv.innerHTML;
                genericErrorDiv.innerHTML = originalContent + 
                    `<button onclick="retryCapture()" style="margin-top: 10px; padding: 5px 10px;">Try Again</button>`;
            }
            show('uh-oh');
            break;
    }
}

// Hàm thử lại capture
function retryCapture() {
    if (!currentTab) return;
    
    console.log('Retrying capture for:', currentTab.url);
    var filename = getFilename(currentTab.url);
    
    // Reset UI
    hide('uh-oh');
    hide('invalid');
    hide('long-page'); // Ẩn loading GIF khi retry
    show('loading');
    $('bar').style.width = '0%';
    
    // Reset percentage display
    var percentElement = $('progress-percent');
    if (percentElement) {
        percentElement.textContent = '0%';
    }
    
    CaptureAPI.captureToFiles(currentTab, filename, displayCaptures,
                              function(reason) {
                                  console.error('Retry failed:', reason);
                                  show('uh-oh');
                              }, progress, splitnotifier);
}


function progress(complete) {
    if (complete === 0) {
        // Page capture has just been initiated.
        show('loading');
        hide('long-page');
        
        // Set initial progress
        var percentElement = $('progress-percent');
        if (percentElement) {
            percentElement.textContent = '0%';
        }
        $('bar').style.width = '0%';
    }
    else {
        // Calculate more accurate progress considering different phases
        var adjustedProgress = complete;
        
        // Phase 1: Script injection and page analysis (0-10%)
        if (complete < 0.1) {
            adjustedProgress = complete * 0.5; // Slower initial progress
        }
        // Phase 2: Active capturing (10-85%)
        else if (complete < 0.9) {
            adjustedProgress = 0.05 + (complete - 0.1) * 0.8;
        }
        // Phase 3: Final processing (85-100%)
        else {
            adjustedProgress = 0.85 + (complete - 0.9) * 1.5;
        }
        
        // Ensure we don't exceed 100%
        adjustedProgress = Math.min(adjustedProgress, 1.0);
        
        var percent = Math.floor(adjustedProgress * 100);
        $('bar').style.width = percent + '%';
        
        // Update percentage display with more realistic progression
        var percentElement = $('progress-percent');
        if (percentElement) {
            if (percent < 100) {
                percentElement.textContent = percent + '%';
            } else {
                percentElement.textContent = '99%'; // Never show 100% until truly complete
            }
        }
        
        // Update progress text based on phase
        var progressText = $('progress-text');
        if (progressText) {
            if (percent < 10) {
                progressText.textContent = 'Analyzing page structure...';
            } else if (percent < 25) {
                progressText.textContent = 'Capturing page sections...';
            } else if (percent < 75) {
                progressText.textContent = 'Processing screenshots...';
            } else if (percent < 95) {
                progressText.textContent = 'Finalizing capture...';
            } else {
                progressText.textContent = 'Almost complete...';
            }
        }
        
        // Hiển thị skeleton animation cho trang dài nếu quá trình mất nhiều thời gian
        if (complete > 0 && complete < 0.1) {
            setTimeout(function() {
                var currentProgress = parseInt($('bar').style.width);
                if (currentProgress < 20) {
                    show('long-page');
                    
                    // Backup: Auto-hide after maximum time (30 seconds)
                    setTimeout(function() {
                        hide('long-page');
                    }, 30000);
                }
            }, 3000); // Giảm xuống 3s để hiện skeleton sớm hơn
        }
        
        // Ẩn loading GIF khi adjustedProgress đạt gần hoàn thành (99.5%) hoặc raw progress > 98%
        if (adjustedProgress >= 0.995 || complete >= 0.98) {
            hide('long-page');
        }
    }
}


function splitnotifier() {
    show('split-image');
}


//
// start doing stuff immediately! - including error cases
//

// Load configuration on startup
if (typeof ScreenshotConfig !== 'undefined') {
    ScreenshotConfig.loadConfig(function(config) {
        if (config.debugMode) {
            console.log('Debug mode enabled - detailed logging active');
        }
    });
}

chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var tab = tabs[0];
    currentTab = tab; // used in later calls to get tab info

    // Use enhanced filename generation if available
    var filename;
    if (typeof ScreenshotConfig !== 'undefined') {
        filename = ScreenshotConfig.getSuccessFilename({ url: tab.url });
    } else {
        filename = getFilename(tab.url);
    }

    CaptureAPI.captureToFiles(tab, filename, displayCaptures,
                              errorHandler, progress, splitnotifier);
});
