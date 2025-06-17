var CAPTURE_DELAY = 50;    // Mặc định nhanh: 50ms
var MAX_RETRIES = 2;       // Giảm xuống 2 lần thử
var CLEANUP_TIMEOUT = 2000; // Nhanh: 2000ms
var SMOOTH_SCROLL = false; // Tùy chọn scroll mượt mà

function onMessage(data, sender, callback) {
    if (data.msg === 'scrollPage') {
        getPositions(callback);
        return true;
    } else if (data.msg == 'logMessage') {
        console.log('[POPUP LOG]', data.data);
    } else {
        console.error('Unknown message received from background: ' + data.msg);
    }
}

if (!window.hasScreenCapturePage) {
    window.hasScreenCapturePage = true;
    chrome.runtime.onMessage.addListener(onMessage);
}

function max(nums) {
    return Math.max.apply(Math, nums.filter(function(x) { return x; }));
}

function isPageLoading() {
    return document.readyState !== 'complete' || 
           window.performance.navigation.type === window.performance.navigation.TYPE_RELOAD;
}

function waitForPageReady(callback, timeout) {
    timeout = timeout || 3000;  // Giảm xuống 3s
    var startTime = Date.now();
    
    function checkReady() {
        if (!isPageLoading() || (Date.now() - startTime) > timeout) {
            callback();
        } else {
            setTimeout(checkReady, 25);  // Giảm xuống 25ms cho tốc độ tối đa
        }
    }
    
    checkReady();
}

function getPositions(callback) {
    // Send initial progress immediately
    chrome.runtime.sendMessage({
        msg: 'capture',
        x: 0,
        y: 0,
        complete: 0.05,
        windowWidth: window.innerWidth,
        totalWidth: 0,
        totalHeight: 0,
        devicePixelRatio: window.devicePixelRatio,
        initializing: true
    });
    
    waitForPageReady(function() {
        performCapture(callback);
    });
}

function performCapture(callback) {
    var body = document.body,
        originalBodyOverflowYStyle = body ? body.style.overflowY : '',
        originalX = window.scrollX,
        originalY = window.scrollY,
        originalOverflowStyle = document.documentElement.style.overflow;

    if (body) {
        body.style.overflowY = 'visible';
    }

    var widths = [
            document.documentElement.clientWidth,
            body ? body.scrollWidth : 0,
            document.documentElement.scrollWidth,
            body ? body.offsetWidth : 0,
            document.documentElement.offsetWidth
        ],
        heights = [
            document.documentElement.clientHeight,
            body ? body.scrollHeight : 0,
            document.documentElement.scrollHeight,
            body ? body.offsetHeight : 0,
            document.documentElement.offsetHeight
        ],
        fullWidth = max(widths),
        fullHeight = max(heights),
        windowWidth = window.innerWidth,
        windowHeight = window.innerHeight,
        arrangements = [],
        scrollPad = Math.min(300, windowHeight * 0.2),
        yDelta = windowHeight - (windowHeight > scrollPad ? scrollPad : 0),
        xDelta = windowWidth,
        yPos = fullHeight - windowHeight,
        xPos,
        numArrangements,
        startTime = Date.now();

    if (fullWidth <= xDelta + 1) {
        fullWidth = xDelta;
    }

    if (fullHeight > 50000 || fullWidth > 50000) {
        console.warn('Page size is very large:', fullWidth, 'x', fullHeight);
        fullHeight = Math.min(fullHeight, 50000);
        fullWidth = Math.min(fullWidth, 50000);
    }

    document.documentElement.style.overflow = 'hidden';

    while (yPos > -yDelta) {
        xPos = 0;
        while (xPos < fullWidth) {
            arrangements.push([xPos, yPos]);
            xPos += xDelta;
        }
        yPos -= yDelta;
    }

    console.log('fullHeight', fullHeight, 'fullWidth', fullWidth);
    console.log('windowWidth', windowWidth, 'windowHeight', windowHeight);
    console.log('xDelta', xDelta, 'yDelta', yDelta);
    console.log('Total arrangements:', arrangements.length);

    numArrangements = arrangements.length;

    function cleanUp() {
        try {
            document.documentElement.style.overflow = originalOverflowStyle;
            if (body) {
                body.style.overflowY = originalBodyOverflowYStyle;
            }
            window.scrollTo(originalX, originalY);
        } catch (e) {
            console.error('Error during cleanup:', e);
        }
    }

    var retryCount = 0;

    (function processArrangements() {
        if (!arrangements.length) {
            cleanUp();
            if (callback) {
                callback();
            }
            return;
        }

        var next = arrangements.shift(),
            x = next[0], y = next[1];

        // Calculate progress based on position in arrangements array
        var baseProgress = (numArrangements - arrangements.length) / numArrangements;
        
        // Smooth out progress to avoid jumping
        var smoothProgress = Math.min(baseProgress * 0.95, 0.95); // Cap at 95% during capture
        
        // Add small time-based component for more realistic feel
        var timeElapsed = Date.now() - startTime;
        var timeProgress = Math.min(timeElapsed / (numArrangements * 100), 0.05); // Max 5% from time
        
        var finalProgress = Math.min(smoothProgress + timeProgress, 0.98); // Never exceed 98% during capture

        try {
            smoothScrollTo(x, y, function() {
                var actualX = window.scrollX;
                var actualY = window.scrollY;
                
                if (Math.abs(actualX - x) > 10 || Math.abs(actualY - y) > 10) {
                    console.warn('Scroll position mismatch. Expected:', x, y, 'Actual:', actualX, actualY);
                }
                
                var data = {
                    msg: 'capture',
                    x: actualX,
                    y: actualY,
                    complete: finalProgress,
                    windowWidth: windowWidth,
                    totalWidth: fullWidth,
                    totalHeight: fullHeight,
                    devicePixelRatio: window.devicePixelRatio
                };

                window.setTimeout(function() {
                    var cleanUpTimeout = window.setTimeout(function() {
                        console.error('Capture timeout, moving to next position...');
                        processArrangements(); // Continue with next position instead of full cleanup
                    }, 1500); // Reduced timeout to 1.5s

                    chrome.runtime.sendMessage(data, function(captured) {
                        window.clearTimeout(cleanUpTimeout);

                        if (captured) {
                            retryCount = 0;
                            processArrangements();
                        } else {
                            if (retryCount < MAX_RETRIES) {
                                retryCount++;
                                console.log('Retrying capture, attempt:', retryCount);
                                arrangements.unshift(next); // Put back the failed position
                                processArrangements();
                            } else {
                                console.error('Max retries exceeded, skipping position');
                                retryCount = 0;
                                processArrangements(); // Continue with next position
                            }
                        }
                    });
                }, CAPTURE_DELAY);
            });
            
        } catch (e) {
            console.error('Error during scroll:', e);
            cleanUp();
        }
    })();
}

// Hàm scroll mượt mà
function smoothScrollTo(targetX, targetY, callback) {
    if (!SMOOTH_SCROLL) {
        window.scrollTo(targetX, targetY);
        callback();
        return;
    }
    
    var startX = window.scrollX;
    var startY = window.scrollY;
    var distanceX = targetX - startX;
    var distanceY = targetY - startY;
    var duration = 200; // 200ms cho scroll mượt
    var startTime = Date.now();
    
    function animateScroll() {
        var elapsed = Date.now() - startTime;
        var progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-out)
        var easeProgress = 1 - Math.pow(1 - progress, 3);
        
        var currentX = startX + (distanceX * easeProgress);
        var currentY = startY + (distanceY * easeProgress);
        
        window.scrollTo(currentX, currentY);
        
        if (progress < 1) {
            requestAnimationFrame(animateScroll);
        } else {
            callback();
        }
    }
    
    requestAnimationFrame(animateScroll);
}
