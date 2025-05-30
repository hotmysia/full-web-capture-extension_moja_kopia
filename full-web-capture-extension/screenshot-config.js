// screenshot-config.js - Advanced Screenshot Configuration
// Inspired by Playwright screenshot functionality patterns

window.ScreenshotConfig = (function() {
    'use strict';

    // Default configuration based on Playwright patterns
    const DEFAULT_CONFIG = {
        // Basic options
        format: 'png',              // 'png' or 'jpeg'
        quality: 90,                // JPEG quality 0-100
        
        // Capture options
        fullPage: true,             // Always capture full page like Playwright full_page=True
        omitBackground: false,      // Remove background (useful for transparent PNGs)
        timeout: 15000,            // Giảm xuống 15s cho tốc độ tối ưu
        
        // Error handling (inspired by Playwright error patterns)
        retryAttempts: 2,          // 2 lần thử là đủ
        errorScreenshot: true,      // Capture screenshot on error for debugging
        errorNaming: true,          // Use systematic error naming like Playwright
        
        // Advanced options
        devicePixelRatio: null,     // Use device default if null, or specify custom ratio
        clipRegion: null,           // Crop region {x, y, width, height}
        
        // File naming patterns (inspired by Playwright sanitize_filename)
        filenamePattern: 'screenshot-{timestamp}',
        errorFilenamePattern: 'error_screenshot_{timestamp}',
        sanitizeFilenames: true,
        
        // Performance options - Mặc định nhanh
        scrollDelay: 50,           // Nhanh nhất: 50ms
        captureDelay: 30,          // Nhanh nhất: 30ms  
        maxPageSize: 50000,        // Maximum page dimension to prevent memory issues
        
        // Debug options
        debugMode: false,          // Enable detailed logging
        savePageDump: false        // Save HTML dump on errors (like Playwright)
    };

    let currentConfig = Object.assign({}, DEFAULT_CONFIG);

    // Filename sanitization (inspired by Playwright patterns)
    function sanitizeFilename(filename) {
        // Remove illegal characters and spaces like Playwright does
        return filename
            .replace(/[<>:"/\\|?*\s]/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_+|_+$/g, '');
    }

    // Generate filename with timestamp (inspired by Playwright naming)
    function generateFilename(pattern, options = {}) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const url = options.url || 'unknown';
        const sanitizedUrl = sanitizeFilename(url.replace(/^https?:\/\//, '').substring(0, 50));
        
        return pattern
            .replace('{timestamp}', timestamp)
            .replace('{url}', sanitizedUrl)
            .replace('{date}', timestamp.split('T')[0])
            .replace('{time}', timestamp.split('T')[1]);
    }

    // Get configuration
    function getConfig() {
        return Object.assign({}, currentConfig);
    }

    // Update configuration
    function updateConfig(newConfig) {
        currentConfig = Object.assign(currentConfig, newConfig);
        
        // Save to storage for persistence
        if (typeof chrome !== 'undefined' && chrome.storage) {
            chrome.storage.local.set({ screenshotConfig: currentConfig });
        }
        
        if (currentConfig.debugMode) {
            console.log('Screenshot config updated:', currentConfig);
        }
    }

    // Reset to defaults
    function resetConfig() {
        currentConfig = Object.assign({}, DEFAULT_CONFIG);
        
        if (typeof chrome !== 'undefined' && chrome.storage) {
            chrome.storage.local.remove('screenshotConfig');
        }
    }

    // Load configuration from storage
    function loadConfig(callback) {
        if (typeof chrome !== 'undefined' && chrome.storage) {
            chrome.storage.local.get('screenshotConfig', function(result) {
                if (result.screenshotConfig) {
                    currentConfig = Object.assign(currentConfig, result.screenshotConfig);
                }
                if (callback) callback(currentConfig);
            });
        } else {
            if (callback) callback(currentConfig);
        }
    }

    // Get filename for successful capture
    function getSuccessFilename(options = {}) {
        return generateFilename(currentConfig.filenamePattern, options);
    }

    // Get filename for error capture (inspired by Playwright error naming)
    function getErrorFilename(errorType = 'general', options = {}) {
        const pattern = currentConfig.errorFilenamePattern.replace('{timestamp}', '{timestamp}_' + errorType);
        return generateFilename(pattern, options);
    }

    // Validate capture region (for crop functionality)
    function validateClipRegion(clip, pageWidth, pageHeight) {
        if (!clip) return true;
        
        return clip.x >= 0 && clip.y >= 0 && 
               clip.x + clip.width <= pageWidth && 
               clip.y + clip.height <= pageHeight &&
               clip.width > 0 && clip.height > 0;
    }

    // Convert configuration to Chrome extension capture options
    function toChromeOptions() {
        const options = {
            format: currentConfig.format
        };
        
        if (currentConfig.format === 'jpeg' && currentConfig.quality) {
            options.quality = currentConfig.quality;
        }
        
        return options;
    }

    // Create configuration UI (can be called from popup or options page)
    function createConfigUI(container) {
        const html = `
            <div class="screenshot-config">
                <h3>📸 Screenshot Configuration</h3>
                
                <div class="config-group">
                    <label>Format:</label>
                    <select id="config-format">
                        <option value="png">PNG (Lossless)</option>
                        <option value="jpeg">JPEG (Smaller size)</option>
                    </select>
                </div>
                
                <div class="config-group" id="quality-group">
                    <label>JPEG Quality:</label>
                    <input type="range" id="config-quality" min="10" max="100" step="10" value="${currentConfig.quality}">
                    <span id="quality-value">${currentConfig.quality}</span>
                </div>
                
                <div class="config-group">
                    <label>Timeout (seconds):</label>
                    <input type="number" id="config-timeout" min="5" max="120" value="${currentConfig.timeout / 1000}">
                </div>
                
                <div class="config-group">
                    <label>Retry Attempts:</label>
                    <input type="number" id="config-retries" min="1" max="10" value="${currentConfig.retryAttempts}">
                </div>
                
                <div class="config-group">
                    <label>
                        <input type="checkbox" id="config-error-screenshot" ${currentConfig.errorScreenshot ? 'checked' : ''}>
                        Capture error screenshots
                    </label>
                </div>
                
                <div class="config-group">
                    <label>
                        <input type="checkbox" id="config-debug" ${currentConfig.debugMode ? 'checked' : ''}>
                        Debug mode
                    </label>
                </div>
                
                <div class="config-actions">
                    <button id="save-config">Save Configuration</button>
                    <button id="reset-config">Reset to Defaults</button>
                </div>
            </div>
            
            <style>
                .screenshot-config { padding: 15px; font-family: Arial, sans-serif; }
                .config-group { margin: 10px 0; }
                .config-group label { display: block; margin-bottom: 5px; font-weight: bold; }
                .config-group input, .config-group select { width: 100%; padding: 5px; }
                .config-actions { margin-top: 20px; }
                .config-actions button { margin-right: 10px; padding: 8px 15px; }
                #quality-group { display: ${currentConfig.format === 'jpeg' ? 'block' : 'none'}; }
            </style>
        `;
        
        container.innerHTML = html;
        
        // Bind events
        bindConfigEvents();
    }

    // Bind configuration UI events
    function bindConfigEvents() {
        const formatSelect = document.getElementById('config-format');
        const qualityGroup = document.getElementById('quality-group');
        const qualityRange = document.getElementById('config-quality');
        const qualityValue = document.getElementById('quality-value');
        
        if (formatSelect) {
            formatSelect.value = currentConfig.format;
            formatSelect.addEventListener('change', function() {
                qualityGroup.style.display = this.value === 'jpeg' ? 'block' : 'none';
            });
        }
        
        if (qualityRange && qualityValue) {
            qualityRange.addEventListener('input', function() {
                qualityValue.textContent = this.value;
            });
        }
        
        const saveBtn = document.getElementById('save-config');
        if (saveBtn) {
            saveBtn.addEventListener('click', saveConfigFromUI);
        }
        
        const resetBtn = document.getElementById('reset-config');
        if (resetBtn) {
            resetBtn.addEventListener('click', function() {
                resetConfig();
                location.reload(); // Refresh to show default values
            });
        }
    }

    // Save configuration from UI
    function saveConfigFromUI() {
        const newConfig = {
            format: document.getElementById('config-format')?.value || currentConfig.format,
            quality: parseInt(document.getElementById('config-quality')?.value) || currentConfig.quality,
            timeout: (parseInt(document.getElementById('config-timeout')?.value) || 30) * 1000,
            retryAttempts: parseInt(document.getElementById('config-retries')?.value) || currentConfig.retryAttempts,
            errorScreenshot: document.getElementById('config-error-screenshot')?.checked || false,
            debugMode: document.getElementById('config-debug')?.checked || false
        };
        
        updateConfig(newConfig);
        alert('Configuration saved successfully!');
    }

    // Initialize configuration on load
    loadConfig();

    // Public API
    return {
        getConfig,
        updateConfig,
        resetConfig,
        loadConfig,
        sanitizeFilename,
        generateFilename,
        getSuccessFilename,
        getErrorFilename,
        validateClipRegion,
        toChromeOptions,
        createConfigUI,
        DEFAULT_CONFIG
    };

})(); 