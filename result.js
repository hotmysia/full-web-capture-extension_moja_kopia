// result.js - Xử lý trang kết quả chụp màn hình

let capturedImages = [];
let originalUrls = [];
let currentPageUrl = '';

// Biến cho chức năng crop
let cropMode = false;
let cropData = {};
let currentCropImageIndex = 0;
let croppedImages = {}; // Lưu trữ các hình ảnh đã crop
let cropSelection = null; // Element cho crop selection

// Biến cho theme
let currentTheme = 'light';

// Initialize language system
function initLanguageSystem() {
    if (typeof Languages !== 'undefined') {
        Languages.init();
        
        // Add language toggle event listener for result page
        const languageToggle = document.getElementById('language-toggle-result');
        if (languageToggle) {
            console.log('Result page language toggle found, adding event listener');
            languageToggle.addEventListener('click', function(e) {
                console.log('Result page language toggle clicked');
                e.preventDefault();
                e.stopPropagation();
                
                // Toggle language
                Languages.currentLang = Languages.currentLang === 'en' ? 'vi' : 'en';
                console.log('Switching to:', Languages.currentLang);
                
                // Save and update
                Languages.saveLanguage();
                Languages.updateUI();
                
                // Update button text
                languageToggle.innerHTML = Languages.currentLang === 'vi' ? '🇻🇳 VI' : '🇺🇸 EN';
                
                // Update theme toggle text after language change
                updateThemeToggleText();
                // Reload the display to apply language changes
                loadSavedDownloadPath();
                displayImages();
            });
        } else {
            console.log('Language toggle button not found');
        }
    }
}

// Khởi tạo theme
function initTheme() {
    // Lấy theme đã lưu hoặc mặc định là light
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
}

// Đặt theme
function setTheme(theme) {
    currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    updateThemeToggleText();
}
    
// Update theme toggle text with language support
function updateThemeToggleText() {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        if (typeof Languages !== 'undefined') {
            const isDark = currentTheme === 'dark';
            themeToggle.textContent = isDark ? Languages.getText('themeToggleLight') : Languages.getText('themeToggle');
        } else {
            themeToggle.textContent = currentTheme === 'dark' ? 'Light' : 'Dark';
        }
    }
}

// Toggle theme
function toggleTheme() {
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
}

// Lấy dữ liệu từ URL parameters hoặc localStorage
function loadCaptureData() {
    const urlParams = new URLSearchParams(window.location.search);
    const imageUrls = urlParams.get('images');
    const pageUrl = urlParams.get('url');
    
    if (imageUrls) {
        originalUrls = imageUrls.split(',');
        currentPageUrl = pageUrl || 'Unknown';
        displayImages();
    } else {
        // Thử lấy từ localStorage nếu không có trong URL
        const storedData = localStorage.getItem('captureData');
        if (storedData) {
            const data = JSON.parse(storedData);
            originalUrls = data.images || [];
            currentPageUrl = data.url || 'Unknown';
            displayImages();
        } else {
            showError();
        }
    }
    
    // Tải vị trí lưu đã chọn trước đó
    loadSavedDownloadPath();
}

// Tải vị trí lưu đã lưu trước đó
function loadSavedDownloadPath() {
    // Kiểm tra chế độ saveAs đã lưu
    const saveAsMode = localStorage.getItem('saveAsMode') === 'true';
    const saveLocationInput = document.getElementById('save-location');
    const chooseLocationBtn = document.getElementById('choose-location-btn');
    
    if (saveAsMode) {
        if (typeof Languages !== 'undefined') {
            saveLocationInput.value = Languages.getText('willAskLocation');
            chooseLocationBtn.textContent = Languages.getText('autoSave');
            chooseLocationBtn.title = Languages.getText('autoSaveTooltip');
    } else {
            saveLocationInput.value = 'Trình duyệt sẽ hỏi nơi lưu từng file khi tải xuống';
            chooseLocationBtn.textContent = 'Tự động lưu';
            chooseLocationBtn.title = 'Nhấp để chuyển về chế độ tự động lưu vào thư mục Downloads';
        }
    } else {
        if (typeof Languages !== 'undefined') {
            saveLocationInput.value = Languages.getText('locationPlaceholder');
            chooseLocationBtn.textContent = Languages.getText('chooseLocationButton');
            chooseLocationBtn.title = Languages.getText('chooseLocationTooltip');
        } else {
            saveLocationInput.value = 'File sẽ được lưu vào thư mục Downloads mặc định của bạn';
            chooseLocationBtn.textContent = 'Chọn vị trí lưu';
            chooseLocationBtn.title = 'Nhấp để chọn nơi lưu file cho mỗi lần tải xuống';
        }
    }
}

// Hiển thị hình ảnh đã chụp
function displayImages() {
    const container = document.getElementById('image-container');
    const downloadAllBtn = document.getElementById('download-all-btn');
    const filenameInput = document.getElementById('filename');
    
    // Cập nhật thông tin trang với hỗ trợ ngôn ngữ
    const infoSection = document.getElementById('info-section');
    if (typeof Languages !== 'undefined') {
        if (originalUrls.length > 1) {
            const infoText = Languages.getText('infoMultipleText')
                .replace('{count}', originalUrls.length)
                .replace('{url}', currentPageUrl);
            infoSection.innerHTML = `<strong>${Languages.getText('infoLabel')}</strong> ${infoText}`;
        } else {
            infoSection.innerHTML = `<strong>${Languages.getText('infoLabel')}</strong> ${Languages.getText('infoText')}`;
        }
    } else {
        // Fallback to Vietnamese
        infoSection.innerHTML = `<strong>Thông tin:</strong> Đã chụp ${originalUrls.length} hình ảnh từ: <em>${currentPageUrl}</em>`;
    }
    
    // Tạo tên file mặc định
    const defaultName = generateDefaultFilename();
    filenameInput.value = defaultName;
    
    if (originalUrls.length > 1) {
        // Hiển thị nhiều hình ảnh
        downloadAllBtn.style.display = 'inline-block';
        container.innerHTML = '<div class="multiple-images" id="images-grid"></div>';
        const grid = document.getElementById('images-grid');
        
        originalUrls.forEach((url, index) => {
            const imageItem = document.createElement('div');
            imageItem.className = 'image-item';
            
            // Sử dụng ảnh đã crop nếu có, nếu không thì dùng ảnh gốc
            const displayUrl = croppedImages[index] || url;
            let cropStatus = '';
            if (croppedImages[index]) {
                cropStatus = typeof Languages !== 'undefined' ? 
                    Languages.getText('croppedStatus') : ' (Đã cắt)';
            }
            
            let imageInfo = '';
            if (typeof Languages !== 'undefined') {
                imageInfo = Languages.getText('imageInfo')
                    .replace('{index}', index + 1)
                    .replace('{total}', originalUrls.length);
            } else {
                imageInfo = `Hình ${index + 1} / ${originalUrls.length}`;
            }
            
            imageItem.innerHTML = `
                <img src="${displayUrl}" alt="Screenshot ${index + 1}" class="screenshot">
                <div class="image-info">${imageInfo}${cropStatus}</div>
            `;
            grid.appendChild(imageItem);
        });
    } else {
        // Hiển thị một hình ảnh
        const displayUrl = croppedImages[0] || originalUrls[0];
        let cropStatus = '';
        if (croppedImages[0]) {
            const statusText = typeof Languages !== 'undefined' ? 
                Languages.getText('croppedImageStatus') : 'Đã cắt ảnh';
            cropStatus = `<br><small style="color: #4CAF50;">${statusText}</small>`;
        }
        container.innerHTML = `
            <img src="${displayUrl}" alt="Screenshot" class="screenshot">
            ${cropStatus}
        `;
    }
}

// Tạo tên file mặc định
function generateDefaultFilename() {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
    return `screenshot-${timestamp}`;
}

// Hiển thị lỗi khi không có dữ liệu
function showError() {
    const container = document.getElementById('image-container');
    let title, message;
    
    if (typeof Languages !== 'undefined') {
        title = Languages.getText('noImageFoundTitle');
        message = Languages.getText('noImageFoundMessage');
    } else {
        title = 'Không tìm thấy hình ảnh';
        message = 'Có vẻ như không có dữ liệu chụp màn hình nào được tìm thấy.';
    }
    
    container.innerHTML = `
        <div style="color: #f44336; text-align: center; padding: 40px;">
            <h3>${title}</h3>
            <p>${message}</p>
        </div>
    `;
}

// Chọn vị trí lưu file
function chooseDownloadLocation() {
    // Toggle giữa chế độ tự động lưu và chọn vị trí
    const currentSetting = localStorage.getItem('saveAsMode') === 'true';
    const newSetting = !currentSetting;
    
    localStorage.setItem('saveAsMode', newSetting.toString());
    
    const saveLocationInput = document.getElementById('save-location');
    const chooseLocationBtn = document.getElementById('choose-location-btn');
    
    if (newSetting) {
        if (typeof Languages !== 'undefined') {
            saveLocationInput.value = Languages.getText('willAskLocation');
            chooseLocationBtn.textContent = Languages.getText('autoSave');
            chooseLocationBtn.title = Languages.getText('autoSaveTooltip');
    } else {
            saveLocationInput.value = 'Trình duyệt sẽ hỏi nơi lưu từng file khi tải xuống';
            chooseLocationBtn.textContent = 'Tự động lưu';
            chooseLocationBtn.title = 'Nhấp để chuyển về chế độ tự động lưu vào thư mục Downloads';
        }
    } else {
        if (typeof Languages !== 'undefined') {
            saveLocationInput.value = Languages.getText('locationPlaceholder');
            chooseLocationBtn.textContent = Languages.getText('chooseLocationButton');
            chooseLocationBtn.title = Languages.getText('chooseLocationTooltip');
        } else {
            saveLocationInput.value = 'File sẽ được lưu vào thư mục Downloads mặc định của bạn';
            chooseLocationBtn.textContent = 'Chọn vị trí lưu';
            chooseLocationBtn.title = 'Nhấp để chọn nơi lưu file cho mỗi lần tải xuống';
        }
    }
}

// Tải xuống một hình ảnh sử dụng Chrome Downloads API
async function downloadImageWithChrome(url, filename, index = null) {
    const fileFormat = document.getElementById('file-format').value;
    const finalFilename = index !== null ? 
        `${filename}-${index + 1}.${fileFormat}` : 
        `${filename}.${fileFormat}`;
    
    // Sử dụng ảnh đã crop nếu có
    let downloadUrl = (index !== null && croppedImages[index]) ? croppedImages[index] : 
                     (index === null && croppedImages[0]) ? croppedImages[0] : url;
    
    // Xử lý đặc biệt cho PDF
    if (fileFormat === 'pdf') {
        const imageUrls = [downloadUrl];
        const pdfUrl = await createPDFFromImages(imageUrls, filename);
        if (pdfUrl) {
            downloadUrl = pdfUrl;
        } else {
            const errorMsg = typeof Languages !== 'undefined' ? 
                Languages.getText('pdfCreationError') : 'Không thể tạo PDF. Vui lòng thử lại.';
            alert(errorMsg);
            return;
        }
    } else {
        // Chuyển đổi định dạng nếu cần cho các định dạng ảnh khác
        if (fileFormat !== 'png' && (downloadUrl.startsWith('data:image/png') || downloadUrl.startsWith('filesystem:'))) {
            downloadUrl = await convertImageFormat(downloadUrl, fileFormat);
        }
    }
    
    // Kiểm tra chế độ saveAs
    const saveAsMode = localStorage.getItem('saveAsMode') === 'true';
    
    const downloadOptions = {
        url: downloadUrl,
        filename: finalFilename,
        saveAs: saveAsMode // Sử dụng dialog nếu người dùng đã chọn
    };
    
    chrome.downloads.download(downloadOptions, function(downloadId) {
        if (chrome.runtime.lastError) {
            console.error('Download error:', chrome.runtime.lastError);
            // Fallback về phương pháp cũ nếu có lỗi
            downloadImageFallback(downloadUrl, finalFilename);
        } else {
            console.log('Download started with ID:', downloadId);
        }
    });
}

// Chuyển đổi định dạng hình ảnh
function convertImageFormat(imageUrl, format) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = function() {
            canvas.width = img.width;
            canvas.height = img.height;
            
            // Nếu là JPG, thêm background trắng
            if (format === 'jpg') {
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
            
            ctx.drawImage(img, 0, 0);
            
            // Chuyển đổi sang định dạng mong muốn
            let mimeType = 'image/png';
            let quality = 1.0;
            
            switch(format) {
                case 'jpg':
                    mimeType = 'image/jpeg';
                    quality = 0.9; // Chất lượng JPG
                    break;
                case 'webp':
                    mimeType = 'image/webp';
                    quality = 0.9;
                    break;
                default:
                    mimeType = 'image/png';
            }
            
            const convertedUrl = canvas.toDataURL(mimeType, quality);
            resolve(convertedUrl);
        };
        
        img.src = imageUrl;
    });
}

// Tạo PDF từ hình ảnh
function createPDFFromImages(imageUrls, filename) {
    return new Promise((resolve, reject) => {
        console.log('Creating PDF from images:', imageUrls);
        
        // Kiểm tra jsPDF
        if (!window.jspdf || !window.jspdf.jsPDF) {
            console.error('jsPDF library not loaded');
            const errorMsg = typeof Languages !== 'undefined' ? 
                Languages.getText('pdfLibraryError') : 'Thư viện PDF chưa được tải. Vui lòng thử lại sau vài giây.';
            alert(errorMsg);
            resolve(null);
            return;
        }
        
        const { jsPDF } = window.jspdf;
        
        try {
            // Tạo PDF document
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 10;
            const maxWidth = pageWidth - 2 * margin;
            const maxHeight = pageHeight - 2 * margin;
            
            let processedImages = 0;
            let hasError = false;
            
            if (imageUrls.length === 0) {
                console.error('No images to process');
                resolve(null);
                return;
            }
            
            imageUrls.forEach((imageUrl, index) => {
                const img = new Image();
                
                // Thêm crossOrigin để tránh CORS issues
                if (!imageUrl.startsWith('data:')) {
                    img.crossOrigin = 'anonymous';
                }
                
                img.onload = function() {
                    try {
                        console.log(`Processing image ${index + 1}/${imageUrls.length}`);
                        
                        // Tính toán kích thước ảnh để fit vào trang
                        let imgWidth = img.width;
                        let imgHeight = img.height;
                        
                        // Chuyển đổi từ pixel sang mm (giả sử 96 DPI)
                        imgWidth = imgWidth * 25.4 / 96;
                        imgHeight = imgHeight * 25.4 / 96;
                        
                        // Scale để fit vào trang
                        const scaleX = maxWidth / imgWidth;
                        const scaleY = maxHeight / imgHeight;
                        const scale = Math.min(scaleX, scaleY, 1); // Không phóng to quá kích thước gốc
                        
                        const finalWidth = imgWidth * scale;
                        const finalHeight = imgHeight * scale;
                        
                        // Căn giữa ảnh
                        const x = (pageWidth - finalWidth) / 2;
                        const y = (pageHeight - finalHeight) / 2;
                        
                        // Thêm trang mới nếu không phải ảnh đầu tiên
                        if (index > 0) {
                            pdf.addPage();
                        }
                        
                        // Thêm ảnh vào PDF
                        pdf.addImage(imageUrl, 'PNG', x, y, finalWidth, finalHeight);
                        
                        processedImages++;
                        
                        // Nếu đã xử lý xong tất cả ảnh
                        if (processedImages === imageUrls.length) {
                            try {
                                console.log('Creating PDF blob...');
                                const pdfBlob = pdf.output('blob');
                                const pdfUrl = URL.createObjectURL(pdfBlob);
                                console.log('PDF created successfully:', pdfUrl);
                                resolve(pdfUrl);
                            } catch (error) {
                                console.error('Error creating PDF blob:', error);
                                resolve(null);
                            }
                        }
                    } catch (error) {
                        console.error('Error processing image:', error);
                        hasError = true;
                        processedImages++;
                        
                        if (processedImages === imageUrls.length) {
                            resolve(null);
                        }
                    }
                };
                
                img.onerror = function(error) {
                    console.error('Failed to load image for PDF:', imageUrl, error);
                    hasError = true;
                    processedImages++;
                    
                    if (processedImages === imageUrls.length) {
                        if (hasError) {
                            resolve(null);
                        } else {
                            try {
                                const pdfBlob = pdf.output('blob');
                                const pdfUrl = URL.createObjectURL(pdfBlob);
                                resolve(pdfUrl);
                            } catch (error) {
                                console.error('Error creating PDF blob after image error:', error);
                                resolve(null);
                            }
                        }
                    }
                };
                
                // Thêm timeout để tránh treo
                setTimeout(() => {
                    img.src = imageUrl;
                }, index * 100);
            });
            
        } catch (error) {
            console.error('Error initializing PDF:', error);
            resolve(null);
        }
    });
}

// Tải xuống tất cả hình ảnh
async function downloadAllImages() {
    const filename = document.getElementById('filename').value.trim() || 'screenshot';
    const fileFormat = document.getElementById('file-format').value;
    
    // Xử lý đặc biệt cho PDF
    if (fileFormat === 'pdf') {
        console.log('Starting PDF download process...');
        
        // Kiểm tra thư viện jsPDF (local)
        console.log('Checking local jsPDF for PDF download...');
        
        if (!window.jspdf || !window.jspdf.jsPDF) {
            console.log('jsPDF not immediately available, waiting...');
            const isLoaded = await ensureJsPDFLoaded();
            if (!isLoaded) {
                console.error('Local jsPDF library not available');
                alert('Lỗi thư viện PDF. Vui lòng tải lại trang và thử lại.');
                return;
            }
        }
        
        console.log('jsPDF is ready, proceeding with PDF creation');
        
        const imageUrls = [];
        
        // Chuẩn bị danh sách URL ảnh
        if (originalUrls.length === 1) {
            imageUrls.push(croppedImages[0] || originalUrls[0]);
        } else {
            for (let i = 0; i < originalUrls.length; i++) {
                imageUrls.push(croppedImages[i] || originalUrls[i]);
            }
        }
        
        console.log('Image URLs for PDF:', imageUrls);
        
        // Hiển thị thông báo đang xử lý
        showSuccessMessage('Đang tạo file PDF... Vui lòng đợi.');
        
        try {
            // Tạo PDF
            const pdfUrl = await createPDFFromImages(imageUrls, filename);
            if (pdfUrl) {
                console.log('PDF created, starting download...');
                downloadSingleImage(pdfUrl, `${filename}.pdf`);
                showSuccessMessage('Tạo PDF thành công! Đang tải xuống...');
            } else {
                console.error('PDF creation failed');
                alert('Không thể tạo PDF. Có thể do:\n1. Ảnh quá lớn\n2. Lỗi mạng\n3. Thư viện PDF chưa sẵn sàng\n\nVui lòng thử lại.');
            }
        } catch (error) {
            console.error('Error in PDF creation process:', error);
            alert('Lỗi khi tạo PDF: ' + error.message);
        }
        return;
    }
    
    // Xử lý các định dạng ảnh khác
    if (originalUrls.length === 1) {
        let downloadUrl = croppedImages[0] || originalUrls[0];
        
        // Chuyển đổi định dạng nếu cần
        if (fileFormat !== 'png' && (downloadUrl.startsWith('data:image/png') || downloadUrl.startsWith('filesystem:'))) {
            downloadUrl = await convertImageFormat(downloadUrl, fileFormat);
        }
        
        downloadSingleImage(downloadUrl, `${filename}.${fileFormat}`);
    } else {
        for (let i = 0; i < originalUrls.length; i++) {
            let downloadUrl = croppedImages[i] || originalUrls[i];
            
            // Chuyển đổi định dạng nếu cần
            if (fileFormat !== 'png' && (downloadUrl.startsWith('data:image/png') || downloadUrl.startsWith('filesystem:'))) {
                downloadUrl = await convertImageFormat(downloadUrl, fileFormat);
            }
            
            setTimeout(() => {
                downloadSingleImage(downloadUrl, `${filename}-${i + 1}.${fileFormat}`);
            }, i * 500); // Delay để tránh quá tải trình duyệt
        }
    }
}

// Hàm tải xuống một file đơn
function downloadSingleImage(url, filename) {
    const saveAsMode = localStorage.getItem('saveAsMode') === 'true';
    
    // Xử lý đặc biệt cho PDF
    if (filename.endsWith('.pdf')) {
        console.log('Downloading PDF file:', filename);
        
        // Thử sử dụng Chrome Downloads API trước
        if (chrome && chrome.downloads) {
            const downloadOptions = {
                url: url,
                filename: filename,
                saveAs: saveAsMode
            };
            
            chrome.downloads.download(downloadOptions, function(downloadId) {
                if (chrome.runtime.lastError) {
                    console.error('Chrome download error:', chrome.runtime.lastError);
                    // Fallback về phương pháp trực tiếp
                    downloadPDFFallback(url, filename);
                } else {
                    console.log('PDF download started with ID:', downloadId);
                }
            });
        } else {
            // Fallback nếu không có Chrome API
            downloadPDFFallback(url, filename);
        }
        return;
    }
    
    // Xử lý bình thường cho các file khác
    const downloadOptions = {
        url: url,
        filename: filename,
        saveAs: saveAsMode
    };
    
    chrome.downloads.download(downloadOptions, function(downloadId) {
        if (chrome.runtime.lastError) {
            console.error('Download error:', chrome.runtime.lastError);
            downloadImageFallback(url, filename);
        } else {
            console.log('Download started with ID:', downloadId);
        }
    });
}

// Phương pháp tải xuống PDF dự phòng
function downloadPDFFallback(url, filename) {
    console.log('Using PDF fallback download method');
    
    try {
        // Tạo link download
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        
        // Thêm vào DOM và click
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url); // Giải phóng memory
        }, 100);
        
        console.log('PDF download initiated via fallback method');
    } catch (error) {
        console.error('PDF fallback download failed:', error);
        alert('Không thể tải xuống PDF. Vui lòng thử lại.');
    }
}

// Phương pháp tải xuống dự phòng (fallback)
function downloadImageFallback(url, filename) {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Xem ảnh gốc trong tab mới
function viewOriginalImages() {
    originalUrls.forEach((url, index) => {
        setTimeout(() => {
            window.open(url, `_blank_${index}`);
        }, index * 200);
    });
}

// === CHỨC NĂNG CROP ===

// Bật chế độ crop
function enableCropMode() {
    cropMode = true;
    document.body.classList.add('crop-active');
    
    // Hiển thị crop tools
    document.getElementById('crop-enable').style.display = 'none';
    document.getElementById('crop-tools').style.display = 'block';
    
    // Tạo crop selection trên ảnh hiện tại
    createCropSelection();
    
    updateCropDimensions();
}

// Tắt chế độ crop
function disableCropMode() {
    cropMode = false;
    document.body.classList.remove('crop-active');
    
    // Ẩn crop tools
    document.getElementById('crop-enable').style.display = 'block';
    document.getElementById('crop-tools').style.display = 'none';
    
    // Xóa crop selection
    removeCropSelection();
}

// Tạo crop selection
function createCropSelection() {
    // Xóa selection cũ nếu có
    removeCropSelection();
    
    const imageContainer = document.getElementById('image-container');
    const img = imageContainer.querySelector('img.screenshot');
    
    if (!img) return;
    
    // Tạo wrapper cho ảnh nếu chưa có
    let wrapper = img.parentElement;
    if (!wrapper.classList.contains('crop-wrapper')) {
        wrapper = document.createElement('div');
        wrapper.className = 'crop-wrapper';
        wrapper.style.cssText = `
            position: relative;
            display: inline-block;
            max-width: 100%;
        `;
        img.parentNode.insertBefore(wrapper, img);
        wrapper.appendChild(img);
    }
    
    // Tạo crop selection
    cropSelection = document.createElement('div');
    cropSelection.className = 'crop-selection';
    cropSelection.innerHTML = `
        <div class="crop-handle crop-handle-nw" data-direction="nw"></div>
        <div class="crop-handle crop-handle-ne" data-direction="ne"></div>
        <div class="crop-handle crop-handle-sw" data-direction="sw"></div>
        <div class="crop-handle crop-handle-se" data-direction="se"></div>
        <div class="crop-handle crop-handle-n" data-direction="n"></div>
        <div class="crop-handle crop-handle-s" data-direction="s"></div>
        <div class="crop-handle crop-handle-w" data-direction="w"></div>
        <div class="crop-handle crop-handle-e" data-direction="e"></div>
        <div class="crop-move-handle"></div>
    `;
    
    wrapper.appendChild(cropSelection);
    
    // Setup events cho crop selection
    setupCropSelectionEvents();
}

// Xóa crop selection
function removeCropSelection() {
    if (cropSelection) {
        cropSelection.remove();
        cropSelection = null;
    }
}

// Setup events cho crop selection
function setupCropSelectionEvents() {
    if (!cropSelection) return;
    
    const handles = cropSelection.querySelectorAll('.crop-handle');
    const moveHandle = cropSelection.querySelector('.crop-move-handle');
    const wrapper = cropSelection.parentElement;
    const img = wrapper.querySelector('img');
    
    let isDragging = false;
    let dragType = '';
    let startX, startY;
    let startRect = {};
    let wrapperRect = {};
    
    // Xử lý kéo handles
    handles.forEach(handle => {
        handle.addEventListener('mousedown', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            isDragging = true;
            dragType = 'resize';
            const direction = handle.getAttribute('data-direction');
            
            startX = e.clientX;
            startY = e.clientY;
            
            const rect = cropSelection.getBoundingClientRect();
            const wRect = wrapper.getBoundingClientRect();
            
            startRect = {
                left: rect.left - wRect.left,
                top: rect.top - wRect.top,
                width: rect.width,
                height: rect.height
            };
            
            wrapperRect = {
                width: wRect.width,
                height: wRect.height
            };
            
            const mouseMoveHandler = function(e) {
                if (!isDragging) return;
                
                const deltaX = e.clientX - startX;
                const deltaY = e.clientY - startY;
                
                let newLeft = startRect.left;
                let newTop = startRect.top;
                let newWidth = startRect.width;
                let newHeight = startRect.height;
                
                // Xử lý resize theo hướng
                switch(direction) {
                    case 'nw':
                        newLeft = startRect.left + deltaX;
                        newTop = startRect.top + deltaY;
                        newWidth = startRect.width - deltaX;
                        newHeight = startRect.height - deltaY;
                        break;
                    case 'ne':
                        newTop = startRect.top + deltaY;
                        newWidth = startRect.width + deltaX;
                        newHeight = startRect.height - deltaY;
                        break;
                    case 'sw':
                        newLeft = startRect.left + deltaX;
                        newWidth = startRect.width - deltaX;
                        newHeight = startRect.height + deltaY;
                        break;
                    case 'se':
                        newWidth = startRect.width + deltaX;
                        newHeight = startRect.height + deltaY;
                        break;
                    case 'n':
                        newTop = startRect.top + deltaY;
                        newHeight = startRect.height - deltaY;
                        break;
                    case 's':
                        newHeight = startRect.height + deltaY;
                        break;
                    case 'w':
                        newLeft = startRect.left + deltaX;
                        newWidth = startRect.width - deltaX;
                        break;
                    case 'e':
                        newWidth = startRect.width + deltaX;
                        break;
                }
                
                // Giới hạn trong wrapper
                newLeft = Math.max(0, Math.min(newLeft, wrapperRect.width - 50));
                newTop = Math.max(0, Math.min(newTop, wrapperRect.height - 50));
                newWidth = Math.max(50, Math.min(newWidth, wrapperRect.width - newLeft));
                newHeight = Math.max(50, Math.min(newHeight, wrapperRect.height - newTop));
                
                // Áp dụng thay đổi
                cropSelection.style.left = (newLeft / wrapperRect.width * 100) + '%';
                cropSelection.style.top = (newTop / wrapperRect.height * 100) + '%';
                cropSelection.style.width = (newWidth / wrapperRect.width * 100) + '%';
                cropSelection.style.height = (newHeight / wrapperRect.height * 100) + '%';
                
                updateCropDimensions();
            };
            
            const mouseUpHandler = function() {
                isDragging = false;
                document.removeEventListener('mousemove', mouseMoveHandler);
                document.removeEventListener('mouseup', mouseUpHandler);
            };
            
            document.addEventListener('mousemove', mouseMoveHandler);
            document.addEventListener('mouseup', mouseUpHandler);
        });
    });
    
    // Xử lý di chuyển vùng chọn
    moveHandle.addEventListener('mousedown', function(e) {
        e.preventDefault();
        
        isDragging = true;
        dragType = 'move';
        
        startX = e.clientX;
        startY = e.clientY;
        
        const rect = cropSelection.getBoundingClientRect();
        const wRect = wrapper.getBoundingClientRect();
        
        startRect = {
            left: rect.left - wRect.left,
            top: rect.top - wRect.top,
            width: rect.width,
            height: rect.height
        };
        
        wrapperRect = {
            width: wRect.width,
            height: wRect.height
        };
        
        const mouseMoveHandler = function(e) {
            if (!isDragging) return;
            
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            
            let newLeft = startRect.left + deltaX;
            let newTop = startRect.top + deltaY;
            
            // Giới hạn trong wrapper
            newLeft = Math.max(0, Math.min(newLeft, wrapperRect.width - startRect.width));
            newTop = Math.max(0, Math.min(newTop, wrapperRect.height - startRect.height));
            
            cropSelection.style.left = (newLeft / wrapperRect.width * 100) + '%';
            cropSelection.style.top = (newTop / wrapperRect.height * 100) + '%';
            
            updateCropDimensions();
        };
        
        const mouseUpHandler = function() {
            isDragging = false;
            document.removeEventListener('mousemove', mouseMoveHandler);
            document.removeEventListener('mouseup', mouseUpHandler);
        };
        
        document.addEventListener('mousemove', mouseMoveHandler);
        document.addEventListener('mouseup', mouseUpHandler);
    });
}

// Cập nhật thông tin kích thước crop
function updateCropDimensions() {
    if (!cropSelection) return;
    
    const wrapper = cropSelection.parentElement;
    const img = wrapper.querySelector('img');
    const dimensionsDiv = document.getElementById('crop-dimensions-sidebar');
    
    if (!img || !dimensionsDiv) return;
    
    const selectionRect = cropSelection.getBoundingClientRect();
    const wrapperRect = wrapper.getBoundingClientRect();
    
    // Tính toán kích thước thực tế
    const scaleX = img.naturalWidth / wrapperRect.width;
    const scaleY = img.naturalHeight / wrapperRect.height;
    
    const realWidth = Math.round(selectionRect.width * scaleX);
    const realHeight = Math.round(selectionRect.height * scaleY);
    
    dimensionsDiv.innerHTML = `📏 Ảnh gốc: ${img.naturalWidth} × ${img.naturalHeight}<br>🎯 <span style="color: #FF5722; font-weight: bold;">Vùng chọn: ${realWidth} × ${realHeight} pixels</span>`;
}

// Reset crop selection
function resetCropSelection() {
    if (!cropSelection) return;
    
    cropSelection.style.left = '20%';
    cropSelection.style.top = '20%';
    cropSelection.style.width = '60%';
    cropSelection.style.height = '60%';
    
    updateCropDimensions();
}

// Áp dụng crop từ sidebar
function applyCropFromSidebar() {
    if (!cropSelection) {
        alert('Vui lòng bật chế độ cắt trước!');
        return;
    }
    
    const wrapper = cropSelection.parentElement;
    const img = wrapper.querySelector('img');
    const fileFormat = document.getElementById('file-format').value;
    
    if (!img) {
        alert('Không thể tìm thấy ảnh!');
        return;
    }
    
    // Lấy thông tin vùng chọn
    const selectionRect = cropSelection.getBoundingClientRect();
    const wrapperRect = wrapper.getBoundingClientRect();
    
    // Tính toán tỷ lệ
    const scaleX = img.naturalWidth / wrapperRect.width;
    const scaleY = img.naturalHeight / wrapperRect.height;
    
    // Tính toán vùng cắt thực tế
    const cropX = (selectionRect.left - wrapperRect.left) * scaleX;
    const cropY = (selectionRect.top - wrapperRect.top) * scaleY;
    const cropWidth = selectionRect.width * scaleX;
    const cropHeight = selectionRect.height * scaleY;
    
    // Kiểm tra kích thước hợp lệ
    if (cropWidth < 10 || cropHeight < 10) {
        const errorMsg = typeof Languages !== 'undefined' ? 
            Languages.getText('cropTooSmallError') : 'Vùng cắt quá nhỏ! Vui lòng chọn vùng lớn hơn.';
        alert(errorMsg);
        return;
    }
    
    // Tạo canvas để cắt ảnh
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = cropWidth;
    canvas.height = cropHeight;
    
    // Nếu là JPG, thêm background trắng
    if (fileFormat === 'jpg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, cropWidth, cropHeight);
    }
    
    // Vẽ ảnh đã cắt
    ctx.drawImage(
        img,
        cropX, cropY, cropWidth, cropHeight,
        0, 0, cropWidth, cropHeight
    );
    
    // Chuyển đổi sang định dạng mong muốn
    let mimeType = 'image/png';
    let quality = 1.0;
    
    switch(fileFormat) {
        case 'jpg':
            mimeType = 'image/jpeg';
            quality = 0.9;
            break;
        case 'webp':
            mimeType = 'image/webp';
            quality = 0.9;
            break;
        case 'pdf':
            // PDF sẽ được xử lý riêng khi tải xuống, giữ nguyên PNG cho crop
            mimeType = 'image/png';
            break;
        default:
            mimeType = 'image/png';
    }
    
    // Lưu ảnh đã crop
    croppedImages[0] = canvas.toDataURL(mimeType, quality);
    
    // Cập nhật hiển thị ảnh
    img.src = croppedImages[0];
    
    // Tắt chế độ crop
    disableCropMode();
    
    // Hiển thị thông báo thành công
    let successMsg = '';
    if (typeof Languages !== 'undefined') {
        successMsg = Languages.getText('cropSuccessMessage').replace('{format}', fileFormat.toUpperCase());
    } else {
        successMsg = `Đã áp dụng cắt ảnh thành công! (${fileFormat.toUpperCase()})`;
    }
    showSuccessMessage(successMsg);
}

// Hiển thị thông báo thành công
function showSuccessMessage(message) {
    // Tạo element thông báo
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #4CAF50;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 1000;
        font-weight: bold;
        animation: slideIn 0.3s ease-out;
    `;
    notification.innerHTML = `${message}`;
    
    // Thêm CSS animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Tự động ẩn sau 3 giây
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Kiểm tra thư viện jsPDF (đã tích hợp local)
function ensureJsPDFLoaded() {
    return new Promise((resolve) => {
        console.log('Checking local jsPDF availability...');
        
        // Kiểm tra xem thư viện đã có chưa
        if (window.jspdf && window.jspdf.jsPDF) {
            console.log('jsPDF is available');
            resolve(true);
            return;
        }
        
        // Nếu chưa có, đợi một chút (có thể script đang load)
        console.log('jsPDF not immediately available, waiting...');
        let attempts = 0;
        const checkInterval = setInterval(() => {
            attempts++;
            if (window.jspdf && window.jspdf.jsPDF) {
                console.log('jsPDF loaded successfully after waiting');
                clearInterval(checkInterval);
                resolve(true);
            } else if (attempts > 30) { // 3 giây
                console.error('Timeout waiting for local jsPDF');
                clearInterval(checkInterval);
                resolve(false);
            }
        }, 100);
    });
}

// Chức năng sao chép ảnh vào clipboard
async function copyImagesToClipboard() {
    const copyBtn = document.getElementById('copy-btn');
    const originalText = copyBtn.innerHTML;
    
    try {
        // Kiểm tra hỗ trợ clipboard API
        if (!navigator.clipboard || !navigator.clipboard.write) {
            throw new Error('Clipboard API not supported');
        }
        
        // Cập nhật nút để hiển thị trạng thái đang xử lý
        copyBtn.innerHTML = 'Copying...';
        copyBtn.disabled = true;
        
        // Lấy ảnh hiện tại (có thể là ảnh đã crop hoặc ảnh gốc)
        let imageUrl;
        if (originalUrls.length === 1) {
            // Ảnh đơn - kiểm tra xem có ảnh đã crop không
            imageUrl = croppedImages[0] || originalUrls[0];
        } else {
            // Nhiều ảnh - copy ảnh đầu tiên
            imageUrl = croppedImages[0] || originalUrls[0];
        }
        
        console.log('Copying image from URL:', imageUrl);
        
        let blob;
        
        // Xử lý khác nhau cho data URL và blob URL
        if (imageUrl.startsWith('data:')) {
            // Data URL - chuyển đổi trực tiếp
            const response = await fetch(imageUrl);
            blob = await response.blob();
        } else {
            // Blob URL hoặc HTTP URL - fetch và chuyển đổi
            try {
                const response = await fetch(imageUrl);
                if (!response.ok) {
                    throw new Error('Failed to fetch image');
                }
                blob = await response.blob();
            } catch (fetchError) {
                console.error('Fetch failed, trying canvas method:', fetchError);
                // Fallback: sử dụng canvas để chuyển đổi
                blob = await convertImageToBlob(imageUrl);
            }
        }
        
        // Đảm bảo blob có đúng MIME type
        if (!blob.type.startsWith('image/')) {
            blob = new Blob([blob], { type: 'image/png' });
        }
        
        console.log('Blob created:', blob.type, blob.size);
        
        // Tạo ClipboardItem
        const clipboardItem = new ClipboardItem({
            [blob.type]: blob
        });
        
        // Copy vào clipboard
        await navigator.clipboard.write([clipboardItem]);
        
        // Hiển thị thông báo thành công
        copyBtn.innerHTML = 'Copied!';
        copyBtn.style.backgroundColor = '#4CAF50';
        
        let successMsg = '';
        if (typeof Languages !== 'undefined') {
            successMsg = Languages.getText('copySuccessMessage') || 'Image copied to clipboard successfully!';
        } else {
            successMsg = 'Đã sao chép ảnh vào clipboard!';
        }
        showSuccessMessage(successMsg);
        
        // Khôi phục nút sau 2 giây
        setTimeout(() => {
            if (typeof Languages !== 'undefined') {
                copyBtn.innerHTML = Languages.getText('copyButton');
            } else {
                copyBtn.innerHTML = 'Copy';
            }
            copyBtn.style.backgroundColor = '';
            copyBtn.disabled = false;
        }, 2000);
        
    } catch (error) {
        console.error('Error copying image:', error);
        
        copyBtn.innerHTML = 'Failed';
        copyBtn.style.backgroundColor = '#f44336';
        
        let errorMsg = '';
        if (typeof Languages !== 'undefined') {
            errorMsg = Languages.getText('copyErrorMessage') || 'Failed to copy image. Your browser may not support this feature.';
        } else {
            errorMsg = 'Không thể sao chép ảnh. Trình duyệt có thể không hỗ trợ tính năng này.';
        }
        
        // Hiển thị lỗi chi tiết trong console
        console.error('Copy error details:', {
            error: error.message,
            clipboardSupport: !!navigator.clipboard,
            writeSupport: !!(navigator.clipboard && navigator.clipboard.write)
        });
        
        alert(errorMsg);
        
        // Khôi phục nút sau 2 giây
        setTimeout(() => {
            if (typeof Languages !== 'undefined') {
                copyBtn.innerHTML = Languages.getText('copyButton');
            } else {
                copyBtn.innerHTML = 'Copy';
            }
            copyBtn.style.backgroundColor = '';
            copyBtn.disabled = false;
        }, 2000);
    }
}

// Hàm helper để chuyển đổi ảnh thành blob bằng canvas
async function convertImageToBlob(imageUrl) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = img.width;
            canvas.height = img.height;
            
            ctx.drawImage(img, 0, 0);
            
            canvas.toBlob((blob) => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error('Failed to convert image to blob'));
                }
            }, 'image/png');
        };
        
        img.onerror = () => {
            reject(new Error('Failed to load image'));
        };
        
        img.src = imageUrl;
    });
}

// Khởi tạo sự kiện
document.addEventListener('DOMContentLoaded', function() {
    // Initialize language system first
    initLanguageSystem();
    
    // Khởi tạo theme
    initTheme();
    
    loadCaptureData();
    
    // Kiểm tra jsPDF local
    console.log('Checking local jsPDF on page load...');
    
    setTimeout(() => {
        if (window.jspdf && window.jspdf.jsPDF) {
            console.log('✅ Local jsPDF is ready');
        } else {
            console.warn('⚠️ Local jsPDF not loaded yet');
        }
    }, 500);
    
    // Sự kiện theme toggle
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    
    // Sự kiện chọn vị trí lưu
    document.getElementById('choose-location-btn').addEventListener('click', chooseDownloadLocation);
    
    // Sự kiện crop sidebar
    document.getElementById('crop-enable').addEventListener('click', enableCropMode);
    document.getElementById('crop-disable').addEventListener('click', disableCropMode);
    document.getElementById('crop-reset-sidebar').addEventListener('click', resetCropSelection);
    document.getElementById('crop-apply-sidebar').addEventListener('click', applyCropFromSidebar);
    
    // Sự kiện tải xuống
    document.getElementById('download-btn').addEventListener('click', downloadAllImages);
    document.getElementById('download-all-btn').addEventListener('click', downloadAllImages);
    
    // Sự kiện sao chép
    document.getElementById('copy-btn').addEventListener('click', copyImagesToClipboard);
    
    // Sự kiện Enter trong ô tên file
    document.getElementById('filename').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            downloadAllImages();
        }
    });
    
    // Lưu định dạng file đã chọn
    document.getElementById('file-format').addEventListener('change', function() {
        localStorage.setItem('preferredFormat', this.value);
    });
    
    // Khôi phục định dạng file đã chọn
    const savedFormat = localStorage.getItem('preferredFormat');
    if (savedFormat) {
        document.getElementById('file-format').value = savedFormat;
    }
}); 