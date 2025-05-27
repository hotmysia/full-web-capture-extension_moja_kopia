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
    
    // Hiển thị thông báo lỗi chi tiết hơn
    if (reason === 'execute timeout') {
        // Thử lại với timeout dài hơn
        console.log('Retrying with longer timeout...');
        setTimeout(function() {
            retryCapture();
        }, 2000);
    } else if (reason === 'invalid url') {
        show('invalid');
    } else {
        show('uh-oh');
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
    $('bar').style.width = '0%';
    
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
    }
    else {
        $('bar').style.width = parseInt(complete * 100, 10) + '%';
        
        // Hiển thị thông báo cho trang dài nếu quá trình mất nhiều thời gian
        if (complete > 0 && complete < 0.1) {
            // Nếu sau 5 giây vẫn chưa đạt 10%, có thể là trang dài
            setTimeout(function() {
                var currentProgress = parseInt($('bar').style.width);
                if (currentProgress < 20) {
                    show('long-page');
                }
            }, 5000);
        }
        
        // Ẩn thông báo trang dài khi gần hoàn thành
        if (complete > 0.8) {
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

chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var tab = tabs[0];
    currentTab = tab; // used in later calls to get tab info

    var filename = getFilename(tab.url);

    CaptureAPI.captureToFiles(tab, filename, displayCaptures,
                              errorHandler, progress, splitnotifier);
});
