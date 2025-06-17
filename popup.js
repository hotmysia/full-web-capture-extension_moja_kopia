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
        
        // Use language system for completion text
        if (typeof Languages !== 'undefined') {
            progressText.textContent = Languages.getText('captureCompleted');
        } else {
            progressText.textContent = 'Capture completed!';
        }
        
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


// Enhanced progress update function with language support
function updateProgressUI(percent, phase) {
    const progressText = $('progress-text');
    const progressPercent = $('progress-percent');
    const bar = $('bar');
    
    if (progressPercent) {
        progressPercent.textContent = Math.round(percent) + '%';
    }
    
    if (bar) {
        bar.style.width = percent + '%';
    }
    
    if (progressText) {
        // Use language system if available
        if (typeof Languages !== 'undefined') {
            Languages.updateProgress(phase);
        } else {
            // Fallback to English
            let text = '';
            switch(phase) {
                case 'analyzing':
                    text = 'Analyzing page structure...';
                    break;
                case 'capturing':
                    text = 'Capturing page sections...';
                    break;
                case 'processing':
                    text = 'Processing screenshots...';
                    break;
                case 'finalizing':
                    text = 'Finalizing capture...';
                    break;
                case 'completed':
                    text = 'Capture completed!';
                    break;
                default:
                    text = 'Initializing capture...';
            }
            progressText.textContent = text;
        }
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
            // Show specific error for max retries with language support
            const errorDiv = $('uh-oh');
            if (errorDiv) {
                if (typeof Languages !== 'undefined') {
                    errorDiv.innerHTML = `
                        <h4>${Languages.getText('captureFailedTitle')}</h4>
                        <p>Maximum retry attempts exceeded. This might be due to:</p>
                        <ul>
                            <li>Very large page content</li>
                            <li>Page loading issues</li>
                            <li>Network connectivity problems</li>
                        </ul>
                        <button onclick="retryCapture()" style="margin-top: 10px; padding: 5px 10px;">${Languages.getText('tryAgainButton')}</button>
                    `;
                } else {
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
            }
            show('uh-oh');
            break;
            
        case 'script injection failed':
            const scriptErrorDiv = $('uh-oh');
            if (scriptErrorDiv) {
                if (typeof Languages !== 'undefined') {
                    scriptErrorDiv.innerHTML = `
                        <h4>${Languages.getText('captureFailedTitle')}</h4>
                        <p>Unable to inject capture script. This page might have:</p>
                        <ul>
                            <li>Content Security Policy restrictions</li>
                            <li>Special security settings</li>
                            <li>Protected content</li>
                        </ul>
                    `;
    } else {
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
            }
            show('uh-oh');
            break;
            
        default:
            // Generic error with more helpful information and language support
            const genericErrorDiv = $('uh-oh');
            if (genericErrorDiv && !genericErrorDiv.innerHTML.includes('Try Again')) {
                const originalContent = genericErrorDiv.innerHTML;
                const tryAgainText = typeof Languages !== 'undefined' ? 
                    Languages.getText('tryAgainButton') : 'Try Again';
                genericErrorDiv.innerHTML = originalContent + 
                    `<button onclick="retryCapture()" style="margin-top: 10px; padding: 5px 10px;">${tryAgainText}</button>`;
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
    show('loading');
    
    // Reset progress
    updateProgressUI(0, 'initializing');
    
    // Retry capture
    chrome.tabs.sendMessage(currentTab.id, {
        msg: 'scrollPage',
        config: ScreenshotConfig ? ScreenshotConfig.getConfig() : {}
    }, function(response) {
        console.log('Retry response:', response);
    });
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
        // Simplified progress calculation - use raw progress directly
        var percent = Math.floor(complete * 100);
        
        // Ensure reasonable bounds
        if (percent < 0) percent = 0;
        if (percent > 99) percent = 99; // Cap at 99% until truly complete
        
        $('bar').style.width = percent + '%';
        
        // Update percentage display
        var percentElement = $('progress-percent');
        if (percentElement) {
            percentElement.textContent = percent + '%';
        }
        
        // Update progress text based on simple thresholds
        var progressText = $('progress-text');
        if (progressText) {
            var phase = '';
            if (percent < 15) {
                phase = 'analyzing';
            } else if (percent < 40) {
                phase = 'capturing';
            } else if (percent < 80) {
                phase = 'processing';
            } else {
                phase = 'finalizing';
            }
            
            // Use the language-aware progress update function
            if (typeof Languages !== 'undefined') {
                Languages.updateProgress(phase);
            } else {
                // Fallback to English
                var text = '';
                switch(phase) {
                    case 'analyzing':
                        text = 'Analyzing page structure...';
                        break;
                    case 'capturing':
                        text = 'Capturing page sections...';
                        break;
                    case 'processing':
                        text = 'Processing screenshots...';
                        break;
                    case 'finalizing':
                        text = 'Finalizing capture...';
                        break;
                    default:
                        text = 'Processing...';
                }
                progressText.textContent = text;
            }
        }
        
        // Show loading animation for long pages if process takes time
        if (complete > 0 && complete < 0.2) {
            setTimeout(function() {
                var currentProgress = parseInt($('bar').style.width);
                if (currentProgress < 30) {
                    show('long-page');
                    
                    // Auto-hide after maximum time
                    setTimeout(function() {
                        hide('long-page');
                    }, 25000);
                }
            }, 2000);
        }
        
        // Hide loading animation when getting close to completion
        if (complete >= 0.95) {
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
