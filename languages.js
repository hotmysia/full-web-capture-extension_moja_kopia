// Language switching system for Full Web Capture extension
// Supports English and Vietnamese with dropdown and country flags

const Languages = {
    // Language data
    data: {
        en: {
            // Main UI
            configToggle: "⚙️ Config",
            languageToggle: "🌐 Language",
            
            // Language options for dropdown
            languageEnglish: "English",
            languageVietnamese: "Tiếng Việt",
            
            // Loading states
            initializingCapture: "Initializing capture...",
            analyzingPage: "Analyzing page structure...",
            capturingPage: "Capturing page sections...",
            processingScreenshots: "Processing screenshots...",
            finalizingCapture: "Finalizing capture...",
            captureCompleted: "Capture completed!",
            processingLargePage: "Processing large page...",
            pleaseWaitCapture: "Please wait while we capture all content",
            
            // Configuration panel
            configTitle: "📸 Screenshot Configuration",
            formatLabel: "Format:",
            formatPngOption: "PNG (Lossless, larger size)",
            formatJpegOption: "JPEG (Compressed, smaller size)",
            qualityLabel: "JPEG Quality:",
            timeoutLabel: "Timeout (seconds):",
            retryLabel: "Retry Attempts:",
            errorScreenshotLabel: "Capture error screenshots",
            debugModeLabel: "Debug mode (detailed logs)",
            saveButton: "💾 Save",
            resetButton: "🔄 Reset",
            closeButton: "✕ Close",
            configSaved: "✅ Configuration saved! Changes will apply to next capture.",
            
            // Success screen
            captureSuccessTitle: "✅ Capture Success!",
            customFilenameLabel: "File name:",
            filenamePlaceholder: "Enter custom file name",
            successNote: "Image has been opened in a new tab. You can also download with custom name.",
            downloadButton: "📥 Download",
            
            // Warnings and errors
            splitImageWarning: "Note: your page is too large for the Chrome browser to capture as one image. It will be split into",
            multipleImages: "multiple",
            images: "images.",
            
            // Invalid URL error
            invalidUrlTitle: "🚫 Invalid URL",
            invalidUrlMessage: "Full Page Screen Capture cannot run on this URL due to Chrome Web Store policies.",
            invalidUrlTips: [
                "Try another web page",
                "This restriction applies to chrome:// and extension pages",
                "Most regular websites work fine"
            ],
            
            // Capture failed error
            captureFailedTitle: "⚠️ Capture Failed",
            captureFailedMessage: "Something went wrong! Our enhanced error handling is working on it:",
            captureFailedTips: [
                "✅ Error screenshot automatically saved for debugging",
                "🔄 Auto-retry with smart delay enabled",
                "📊 Check console for detailed error information"
            ],
            tryAgainButton: "🔄 Try Again",
            advancedTroubleshooting: "🔧 Advanced Troubleshooting",
            longPageTips: [
                "For very long pages (>50,000px):",
                "• Scroll to specific section before capturing",
                "• Enable debug mode in settings",
                "• Check error screenshots in downloads"
            ],
            persistentProblemTips: [
                "If problem persists:",
                "• Report in Chrome webstore",
                "• Include URL and Chrome version",
                "• Attach error screenshot if available"
            ],

            // Result page
            pageTitle: "Screenshot Results",
            themeToggle: "Dark",
            themeToggleLight: "Light",
            infoLabel: "Information:",
            infoText: "Image has been successfully captured from the current webpage.",
            infoMultipleText: "Captured {count} images from: {url}",
            filenameLabel: "File name:",
            filenamePlaceholder: "Enter new filename",
            formatLabel: "File format:",
            formatPng: "PNG (High quality, transparent)",
            formatJpg: "JPG (Smaller size)",
            formatWebp: "WebP (Web optimized)",
            formatPdf: "PDF (Portable document)",
            locationLabel: "Save location:",
            locationPlaceholder: "Files will be saved to your default Downloads folder",
            chooseLocationButton: "Choose location",
            cropTitle: "Crop image",
            cropEnable: "Enable crop mode",
            cropDimensions: "Select area to crop on image",
            cropReset: "Reset",
            cropApply: "Apply",
            cropDisable: "Disable crop",
            dragToMove: "Drag to move",
            copyButton: "Copy",
            downloadButton: "Download",
            downloadAllButton: "Download all",
            imageInfo: "Image {index} / {total}",
            croppedStatus: " (Cropped)",
            croppedImageStatus: "Image cropped",
            noImageFoundTitle: "No image found",
            noImageFoundMessage: "No screenshot data appears to have been found.",
            willAskLocation: "Browser will ask where to save each file when downloading",
            autoSave: "Auto save",
            autoSaveTooltip: "Click to switch back to automatic saving in Downloads folder",
            chooseLocationTooltip: "Click to choose where files will be saved for each download",
            pdfCreationError: "Unable to create PDF. Please try again.",
            pdfLibraryError: "PDF library not loaded yet. Please try again in a few seconds.",
            cropTooSmallError: "Crop area too small! Please select a larger area.",
            cropSuccessMessage: "Crop applied successfully! ({format})",
            copySuccessMessage: "Image copied to clipboard successfully!",
            copyErrorMessage: "Failed to copy image. Your browser may not support this feature."
        },
        
        vi: {
            // Main UI
            configToggle: "⚙️ Cài đặt",
            languageToggle: "🌐 Ngôn ngữ",
            
            // Language options for dropdown
            languageEnglish: "English",
            languageVietnamese: "Tiếng Việt",
            
            // Loading states
            initializingCapture: "Đang khởi tạo chụp màn hình...",
            analyzingPage: "Đang phân tích cấu trúc trang...",
            capturingPage: "Đang chụp các phần của trang...",
            processingScreenshots: "Đang xử lý ảnh chụp màn hình...",
            finalizingCapture: "Đang hoàn thiện quá trình chụp...",
            captureCompleted: "Hoàn thành chụp màn hình!",
            processingLargePage: "Đang xử lý trang lớn...",
            pleaseWaitCapture: "Vui lòng đợi trong khi chúng tôi chụp toàn bộ nội dung",
            
            // Configuration panel
            configTitle: "📸 Cấu hình chụp màn hình",
            formatLabel: "Định dạng:",
            formatPngOption: "PNG (Không nén, kích thước lớn hơn)",
            formatJpegOption: "JPEG (Nén, kích thước nhỏ hơn)",
            qualityLabel: "Chất lượng JPEG:",
            timeoutLabel: "Thời gian chờ (giây):",
            retryLabel: "Số lần thử lại:",
            errorScreenshotLabel: "Chụp ảnh khi có lỗi",
            debugModeLabel: "Chế độ debug (nhật ký chi tiết)",
            saveButton: "💾 Lưu",
            resetButton: "🔄 Đặt lại",
            closeButton: "✕ Đóng",
            configSaved: "✅ Cấu hình đã được lưu! Thay đổi sẽ áp dụng cho lần chụp tiếp theo.",
            
            // Success screen
            captureSuccessTitle: "✅ Chụp thành công!",
            customFilenameLabel: "Tên file:",
            filenamePlaceholder: "Nhập tên file tùy chỉnh",
            successNote: "Hình ảnh đã được mở trong tab mới. Bạn cũng có thể tải xuống với tên tùy chỉnh.",
            copyButton: "Sao chép",
            downloadButton: "📥 Tải xuống",
            
            // Warnings and errors
            splitImageWarning: "Lưu ý: trang của bạn quá lớn để trình duyệt Chrome có thể chụp thành một hình ảnh. Nó sẽ được chia thành",
            multipleImages: "nhiều",
            images: "hình ảnh.",
            
            // Invalid URL error
            invalidUrlTitle: "🚫 URL không hợp lệ",
            invalidUrlMessage: "Full Page Screen Capture không thể chạy trên URL này do chính sách của Chrome Web Store.",
            invalidUrlTips: [
                "Thử một trang web khác",
                "Giới hạn này áp dụng cho các trang chrome:// và extension",
                "Hầu hết các trang web thông thường đều hoạt động tốt"
            ],
            
            // Capture failed error
            captureFailedTitle: "⚠️ Chụp thất bại",
            captureFailedMessage: "Đã xảy ra lỗi! Hệ thống xử lý lỗi nâng cao của chúng tôi đang xử lý:",
            captureFailedTips: [
                "✅ Ảnh chụp lỗi được tự động lưu để debug",
                "🔄 Tự động thử lại với độ trễ thông minh đã được bật",
                "📊 Kiểm tra console để biết thông tin lỗi chi tiết"
            ],
            tryAgainButton: "🔄 Thử lại",
            advancedTroubleshooting: "🔧 Khắc phục sự cố nâng cao",
            longPageTips: [
                "Đối với các trang rất dài (>50,000px):",
                "• Cuộn đến phần cụ thể trước khi chụp",
                "• Bật chế độ debug trong cài đặt",
                "• Kiểm tra ảnh chụp lỗi trong thư mục tải xuống"
            ],
            persistentProblemTips: [
                "Nếu vấn đề vẫn tiếp tục:",
                "• Báo cáo trong Chrome webstore",
                "• Bao gồm URL và phiên bản Chrome",
                "• Đính kèm ảnh chụp lỗi nếu có"
            ],

            // Result page
            pageTitle: "Kết quả chụp màn hình",
            themeToggle: "Tối",
            themeToggleLight: "Sáng",
            infoLabel: "Thông tin:",
            infoText: "Hình ảnh đã được chụp thành công từ trang web hiện tại.",
            infoMultipleText: "Chụp được {count} hình ảnh từ: {url}",
            filenameLabel: "Tên file:",
            filenamePlaceholder: "Nhập tên file mới",
            formatLabel: "Định dạng file:",
            formatPng: "PNG (Chất lượng cao, trong suốt)",
            formatJpg: "JPG (Kích thước nhỏ hơn)",
            formatWebp: "WebP (Tối ưu cho web)",
            formatPdf: "PDF (Tài liệu di động)",
            locationLabel: "Vị trí lưu file:",
            locationPlaceholder: "File sẽ được lưu vào thư mục Downloads mặc định của bạn",
            chooseLocationButton: "Chọn vị trí lưu",
            cropTitle: "Cắt ảnh",
            cropEnable: "Bật chế độ cắt",
            cropDimensions: "Chọn vùng cần cắt trên ảnh",
            cropReset: "Đặt lại",
            cropApply: "Áp dụng",
            cropDisable: "Tắt cắt",
            dragToMove: "Kéo để di chuyển",
            downloadButton: "Tải xuống",
            downloadAllButton: "Tải xuống tất cả",
            imageInfo: "Hình ảnh {index} / {total}",
            croppedStatus: " (Đã cắt)",
            croppedImageStatus: "Hình ảnh đã cắt",
            noImageFoundTitle: "Không tìm thấy hình ảnh",
            noImageFoundMessage: "Không có dữ liệu chụp màn hình nào được tìm thấy.",
            willAskLocation: "Trình duyệt sẽ hỏi nơi lưu từng file khi tải xuống",
            autoSave: "Tự động lưu",
            autoSaveTooltip: "Nhấp để chuyển về chế độ tự động lưu vào thư mục Downloads",
            chooseLocationTooltip: "Nhấp để chọn nơi lưu file cho mỗi lần tải xuống",
            pdfCreationError: "Không thể tạo được PDF. Vui lòng thử lại sau",
            pdfLibraryError: "PDF library chưa được tải lên. Vui lòng thử lại sau vài giây",
            cropTooSmallError: "Diện tích cắt quá nhỏ! Vui lòng chọn vùng lớn hơn",
            cropSuccessMessage: "Cắt áp dụng thành công! ({format})",
            copySuccessMessage: "Đã sao chép ảnh vào clipboard!",
            copyErrorMessage: "Không thể sao chép ảnh. Trình duyệt có thể không hỗ trợ tính năng này."
        }
    },
    
    // Current language
    currentLang: 'en',
    
    // Initialize language system
    init() {
        console.log('Languages.init() called');
        
        // Load saved language preference
        chrome.storage.local.get(['language'], (result) => {
            console.log('Language preference loaded:', result);
            
            if (result.language) {
                this.currentLang = result.language;
                console.log('Setting language to:', this.currentLang);
            } else {
                console.log('No saved language, using default:', this.currentLang);
            }
            
            // Update UI first, then add language toggle
            this.updateUI();
            
            // Add language toggle after a small delay to ensure DOM is ready
            setTimeout(() => {
                this.addLanguageToggle();
            }, 100);
        });
    },
    
    // Switch language
    switchLanguage() {
        this.currentLang = this.currentLang === 'en' ? 'vi' : 'en';
        
        // Save language preference
        chrome.storage.local.set({language: this.currentLang});
        
        // Update UI
        this.updateUI();
    },
    
    // Get text for current language
    getText(key) {
        return this.data[this.currentLang][key] || this.data.en[key] || key;
    },
    
    // Save language preference to storage
    saveLanguage() {
        chrome.storage.local.set({language: this.currentLang}, () => {
            console.log('Language saved:', this.currentLang);
        });
    },
    
    // Add language dropdown with country flags
    addLanguageToggle() {
        console.log('addLanguageToggle called');
        
        // Check if we're on popup page
        const wrap = document.getElementById('wrap');
        // Check if we're on result page
        const resultHeader = document.querySelector('.header');
        
        if (wrap) {
            // Popup page logic (existing code)
            console.log('Adding language toggle for popup page');
            
            // Remove existing toggle if present
            const existingToggle = document.getElementById('language-toggle');
            if (existingToggle) {
                console.log('Removing existing language toggle');
                existingToggle.remove();
            }
            
            // Create simple language toggle button
            const languageButton = document.createElement('button');
            languageButton.id = 'language-toggle';
            languageButton.type = 'button';
            languageButton.style.cssText = `
                position: absolute;
                bottom: 5px;
                left: 50%;
                transform: translateX(-50%);
                background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
                border: 2px solid #1976d2;
                border-radius: 8px;
                padding: 6px 12px;
                font-size: 11px;
                font-weight: bold;
                cursor: pointer;
                color: #1976d2;
                z-index: 1000;
                box-shadow: 0 2px 8px rgba(25, 118, 210, 0.2);
                transition: all 0.3s ease;
                min-width: 70px;
                text-align: center;
            `;
            
            // Set button text based on current language
            languageButton.innerHTML = this.currentLang === 'vi' ? '🇻🇳 VI' : '🇺🇸 EN';
            
            // Add click handler to toggle language
            languageButton.addEventListener('click', (e) => {
                console.log('Language button clicked, current lang:', this.currentLang);
                e.preventDefault();
                e.stopPropagation();
                
                // Toggle language
                this.currentLang = this.currentLang === 'en' ? 'vi' : 'en';
                console.log('Switching to:', this.currentLang);
                
                // Save and update
                this.saveLanguage();
                this.updateUI();
                
                // Update button text
                languageButton.innerHTML = this.currentLang === 'vi' ? '🇻🇳 VI' : '🇺🇸 EN';
            });
            
            // Add hover effect
            languageButton.addEventListener('mouseenter', () => {
                languageButton.style.background = 'linear-gradient(135deg, #bbdefb 0%, #90caf9 100%)';
                languageButton.style.transform = 'translateX(-50%) scale(1.05)';
                languageButton.style.boxShadow = '0 4px 12px rgba(25, 118, 210, 0.3)';
            });
            
            languageButton.addEventListener('mouseleave', () => {
                languageButton.style.background = 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)';
                languageButton.style.transform = 'translateX(-50%) scale(1)';
                languageButton.style.boxShadow = '0 2px 8px rgba(25, 118, 210, 0.2)';
            });
            
            // Insert into DOM - check if long-page is visible
            const longPageContainer = document.getElementById('long-page');
            if (longPageContainer && longPageContainer.style.display !== 'none') {
                // Add to long-page container if it's visible
                longPageContainer.appendChild(languageButton);
                console.log('Language button added to long-page container');
            } else {
                // Add to wrap container as fallback
                wrap.appendChild(languageButton);
                console.log('Language button added to wrap container');
            }
            
            // Watch for long-page visibility changes
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                        const longPage = document.getElementById('long-page');
                        const button = document.getElementById('language-toggle');
                        
                        if (longPage && button) {
                            if (longPage.style.display !== 'none' && longPage.offsetParent !== null) {
                                // Move button to long-page container
                                if (button.parentNode !== longPage) {
                                    longPage.appendChild(button);
                                }
                            } else {
                                // Move button back to wrap
                                if (button.parentNode !== wrap) {
                                    wrap.appendChild(button);
                                }
                            }
                        }
                    }
                });
            });
            
            // Observe long-page for style changes
            if (longPageContainer) {
                observer.observe(longPageContainer, { attributes: true, attributeFilter: ['style'] });
            }
            
            console.log('Simple language toggle added successfully');
            
        } else if (resultHeader) {
            // Result page logic - let result.js handle this
            console.log('Result page detected - language toggle will be handled by result.js');
            
            // Just update the button text based on current language
            const languageButton = document.getElementById('language-toggle-result');
            if (languageButton) {
                languageButton.innerHTML = this.currentLang === 'vi' ? '🇻🇳 VI' : '🇺🇸 EN';
                console.log('Updated result page language button text');
            }
        }
    },
    
    // Update language button display
    updateLanguageDropdown() {
        // Update popup language button
        const languageButton = document.getElementById('language-toggle');
        if (languageButton && languageButton.tagName === 'BUTTON') {
            languageButton.innerHTML = this.currentLang === 'vi' ? '🇻🇳 VI' : '🇺🇸 EN';
            console.log('Popup language button updated to:', this.currentLang);
        }
        
        // Update result page language button
        const resultButton = document.getElementById('language-toggle-result');
        if (resultButton) {
            resultButton.innerHTML = this.currentLang === 'vi' ? '🇻🇳 VI' : '🇺🇸 EN';
            console.log('Result page language button updated to:', this.currentLang);
        }
    },
    
    // Update all UI text elements
    updateUI() {
        // Update existing elements
        this.updateElement('.config-toggle', 'configToggle');
        this.updateElement('#progress-text', 'initializingCapture');
        this.updateElement('#config-panel h4', 'configTitle');
        
        // Configuration panel
        this.updateElement('label[for="config-format"]', 'formatLabel');
        this.updateElement('#config-format option[value="png"]', 'formatPngOption');
        this.updateElement('#config-format option[value="jpeg"]', 'formatJpegOption');
        this.updateElement('label[for="config-timeout"]', 'timeoutLabel');
        this.updateElement('label[for="config-retries"]', 'retryLabel');
        
        // Buttons
        this.updateElement('button[onclick="saveConfig()"]', 'saveButton');
        this.updateElement('button[onclick="resetConfig()"]', 'resetButton');
        this.updateElement('button[onclick="toggleConfig()"]', 'closeButton');
        
        // Success screen
        this.updateElement('#success h3', 'captureSuccessTitle');
        this.updateElement('label[for="custom-filename"]', 'customFilenameLabel');
        this.updateElement('#custom-filename', 'filenamePlaceholder', 'placeholder');
        this.updateElement('#success .note', 'successNote');
        this.updateElement('#download-btn', 'downloadButton');
        
        // Errors and warnings
        this.updateElement('#invalid h4', 'invalidUrlTitle');
        this.updateElement('#invalid p', 'invalidUrlMessage');
        this.updateElement('#uh-oh h4', 'captureFailedTitle');
        this.updateElement('.retry-btn', 'tryAgainButton');
        
        // Result page elements
        this.updateElement('#page-title', 'pageTitle');
        this.updateElement('#info-label', 'infoLabel');
        this.updateElement('#info-text', 'infoText');
        this.updateElement('#info-multiple-text', 'infoMultipleText');
        this.updateElement('#filename-label', 'filenameLabel');
        this.updateElement('#filename', 'filenamePlaceholder', 'placeholder');
        this.updateElement('#format-label', 'formatLabel');
        this.updateElement('#format-png', 'formatPng');
        this.updateElement('#format-jpg', 'formatJpg');
        this.updateElement('#format-webp', 'formatWebp');
        this.updateElement('#format-pdf', 'formatPdf');
        this.updateElement('#location-label', 'locationLabel');
        this.updateElement('#save-location', 'locationPlaceholder', 'placeholder');
        this.updateElement('#choose-location-btn', 'chooseLocationButton');
        this.updateElement('#crop-title', 'cropTitle');
        this.updateElement('#crop-enable', 'cropEnable');
        this.updateElement('#crop-dimensions-sidebar', 'cropDimensions');
        this.updateElement('#crop-reset-sidebar', 'cropReset');
        this.updateElement('#crop-apply-sidebar', 'cropApply');
        this.updateElement('#crop-disable', 'cropDisable');
        this.updateElement('#download-btn', 'downloadButton');
        this.updateElement('#download-all-btn', 'downloadAllButton');
        this.updateElement('#image-info', 'imageInfo');
        this.updateElement('#cropped-status', 'croppedStatus');
        this.updateElement('#cropped-image-status', 'croppedImageStatus');
        this.updateElement('#no-image-found-title', 'noImageFoundTitle');
        this.updateElement('#no-image-found-message', 'noImageFoundMessage');
        this.updateElement('#will-ask-location', 'willAskLocation');
        this.updateElement('#auto-save', 'autoSave');
        this.updateElement('#auto-save-tooltip', 'autoSaveTooltip');
        this.updateElement('#choose-location-tooltip', 'chooseLocationTooltip');
        this.updateElement('#pdf-creation-error', 'pdfCreationError');
        this.updateElement('#pdf-library-error', 'pdfLibraryError');
        this.updateElement('#crop-too-small-error', 'cropTooSmallError');
        this.updateElement('#crop-success-message', 'cropSuccessMessage');
        
        // Update theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            themeToggle.textContent = isDark ? this.getText('themeToggleLight') : this.getText('themeToggle');
        }
        
        // Update language dropdown display
        this.updateLanguageDropdown();
        
        // Update complex elements
        this.updateComplexElements();
    },
    
    // Helper function to update element text
    updateElement(selector, textKey, attribute = 'textContent') {
        const element = document.querySelector(selector);
        if (element) {
            if (attribute === 'placeholder') {
                element.placeholder = this.getText(textKey);
            } else {
                element[attribute] = this.getText(textKey);
            }
        }
    },
    
    // Update complex elements with multiple parts
    updateComplexElements() {
        // Update split image warning
        const splitImage = document.getElementById('split-image');
        if (splitImage) {
            splitImage.innerHTML = `
                ${this.getText('splitImageWarning')} 
                <span id="screenshot-count">${this.getText('multipleImages')}</span> 
                ${this.getText('images')}
            `;
        }
        
        // Update invalid URL error
        const invalid = document.getElementById('invalid');
        if (invalid) {
            const tips = this.getText('invalidUrlTips');
            invalid.innerHTML = `
                <h4>${this.getText('invalidUrlTitle')}</h4>
                <p>${this.getText('invalidUrlMessage')}</p>
                <ul>
                    ${tips.map(tip => `<li>${tip}</li>`).join('')}
                </ul>
            `;
        }
        
        // Update capture failed error
        const uhOh = document.getElementById('uh-oh');
        if (uhOh) {
            const failedTips = this.getText('captureFailedTips');
            const longPageTips = this.getText('longPageTips');
            const persistentTips = this.getText('persistentProblemTips');
            
            uhOh.innerHTML = `
                <h4>${this.getText('captureFailedTitle')}</h4>
                <p>${this.getText('captureFailedMessage')}</p>
                <ul>
                    ${failedTips.map(tip => `<li>${tip}</li>`).join('')}
                </ul>
                <button class="retry-btn" onclick="retryCapture()">${this.getText('tryAgainButton')}</button>
                <br><br>
                <details style="margin-top: 10px;">
                    <summary style="cursor: pointer; color: #007bff;">${this.getText('advancedTroubleshooting')}</summary>
                    <div style="margin-top: 8px; font-size: 10px; color: #666;">
                        <strong>${longPageTips[0]}</strong><br>
                        ${longPageTips.slice(1).join('<br>')}<br><br>
                        
                        <strong>${persistentTips[0]}</strong><br>
                        ${persistentTips.slice(1).join('<br>')}
                    </div>
                </details>
            `;
        }
        
        // Update long page processing
        const longPage = document.getElementById('long-page');
        if (longPage) {
            const textElement = longPage.querySelector('.loading-gif-text');
            const subtextElement = longPage.querySelector('.loading-gif-subtext');
            if (textElement) textElement.textContent = this.getText('processingLargePage');
            if (subtextElement) subtextElement.textContent = this.getText('pleaseWaitCapture');
        }
        
        // Update checkboxes labels
        const errorScreenshotLabel = document.querySelector('label[for="config-error-screenshot"]');
        if (errorScreenshotLabel) {
            const checkbox = errorScreenshotLabel.querySelector('input');
            errorScreenshotLabel.innerHTML = '';
            errorScreenshotLabel.appendChild(checkbox);
            errorScreenshotLabel.appendChild(document.createTextNode(' ' + this.getText('errorScreenshotLabel')));
        }
        
        const debugModeLabel = document.querySelector('label[for="config-debug"]');
        if (debugModeLabel) {
            const checkbox = debugModeLabel.querySelector('input');
            debugModeLabel.innerHTML = '';
            debugModeLabel.appendChild(checkbox);
            debugModeLabel.appendChild(document.createTextNode(' ' + this.getText('debugModeLabel')));
        }
        
        // Update JPEG quality label
        const qualityLabel = document.querySelector('label[for="config-quality"]');
        if (qualityLabel) {
            const qualityValue = qualityLabel.querySelector('#quality-value');
            if (qualityValue) {
                qualityLabel.innerHTML = `${this.getText('qualityLabel')} <span id="quality-value">${qualityValue.textContent}</span>%`;
            }
        }
    },
    
    // Function to update progress text during capture
    updateProgress(phase) {
        const progressText = document.getElementById('progress-text');
        if (progressText) {
            let text = '';
            switch(phase) {
                case 'analyzing':
                    text = this.getText('analyzingPage');
                    break;
                case 'capturing':
                    text = this.getText('capturingPage');
                    break;
                case 'processing':
                    text = this.getText('processingScreenshots');
                    break;
                case 'finalizing':
                    text = this.getText('finalizingCapture');
                    break;
                case 'completed':
                    text = this.getText('captureCompleted');
                    break;
                default:
                    text = this.getText('initializingCapture');
            }
            progressText.textContent = text;
        }
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Languages;
}

// Auto-initialize when DOM is ready
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            console.log('DOM loaded, initializing Languages...');
            Languages.init();
        });
    } else {
        // DOM is already ready
        console.log('DOM already ready, initializing Languages immediately...');
        setTimeout(() => Languages.init(), 50);
    }
} 