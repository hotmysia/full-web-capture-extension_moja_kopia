# Full Web Capture Enhanced

🚀 **Advanced Chrome extension for reliable full-page screenshots with enhanced features and modern UI**

## ✨ Features

### 📸 **Smart Screenshot Capture**
- **Full page capture** - Captures entire web pages, no matter how long
- **High-quality output** - PNG/JPEG format support with quality control
- **Split handling** - Automatically handles pages too large for single capture
- **Fast processing** - Optimized capture delays and timeouts

### 🛡️ **Reliability & Error Handling**
- **Intelligent retry logic** with exponential backoff
- **Error screenshot capture** for debugging failed attempts
- **Timeout protection** with configurable limits
- **Debug mode** with detailed logging
- **Enhanced error messages** with actionable guidance

### ⚙️ **Advanced Configuration**
- **Format options**: PNG (lossless) or JPEG (compressed)
- **Quality control**: Adjustable JPEG compression (10-100%)
- **Timeout settings**: Customizable capture timeouts (5-120s)
- **Retry attempts**: Configurable retry logic (1-10 attempts)
- **Error recovery**: Optional error screenshot capture

### 🎨 **Modern User Interface**
- **Real-time progress tracking** with accurate percentages
- **Dynamic progress messages** showing current capture phase
- **Loading animations** for better user feedback
- **Clean configuration panel** with intuitive controls
- **Responsive design** optimized for popup interface

## 🎯 How It Works

1. **Click extension icon** or use keyboard shortcut `Alt+Shift+P`
2. **Monitor progress** with real-time updates and loading animation
3. **View results** in new tab with download options
4. **Configure settings** using the ⚙️ Config button

## ⚡ Quick Start

### Installation
1. Download or clone this repository
2. Open Chrome → Extensions (`chrome://extensions/`)
3. Enable **Developer mode**
4. Click **Load unpacked extension**
5. Select the extension folder

### First Use
1. Navigate to any webpage
2. Click the extension icon
3. Watch the progress bar and loading animation
4. Results open automatically in new tab

## 🔧 Configuration Options

Access settings via the **⚙️ Config** button in the popup:

| Setting | Options | Description |
|---------|---------|-------------|
| **Format** | PNG, JPEG | Image output format |
| **Quality** | 10-100% | JPEG compression level |
| **Timeout** | 5-120s | Maximum capture time |
| **Retries** | 1-10 | Retry attempts on failure |
| **Error Screenshots** | On/Off | Save screenshots on errors |
| **Debug Mode** | On/Off | Detailed console logging |

## 🎮 Advanced Features

### Error Recovery
- Automatic retry with smart delays
- Error screenshots saved for troubleshooting
- Detailed error categorization and guidance

### Performance Optimization
- Intelligent progress calculation
- Optimized capture delays (50ms default)
- Fast processing with 3-second timeouts
- Efficient memory management

### User Experience
- Real-time progress updates with phases:
  - "Analyzing page structure..."
  - "Capturing page sections..."
  - "Processing screenshots..."
  - "Finalizing capture..."
- Loading animations for long captures
- Keyboard shortcut support

## 📱 Compatibility

- **Chrome Browser**: Version 88+
- **Page Types**: HTTP, HTTPS, File URLs
- **Page Sizes**: Up to 50,000px (width/height)
- **Restrictions**: Cannot capture chrome:// or extension pages

## 🐛 Troubleshooting

### Common Issues

**Large Pages (>50,000px)**:
- Enable debug mode for detailed logs
- Increase timeout in configuration
- Use retry functionality if capture fails

**Permission Errors**:
- Ensure extension has activeTab permission
- Refresh page and try again
- Check for Content Security Policy restrictions

**Performance Issues**:
- Reduce JPEG quality for faster processing
- Close unnecessary tabs to free memory
- Try capturing specific page sections

## 🔄 Version History

### v1.2.0 - Enhanced Edition
- ✅ Real-time progress tracking with accurate percentages
- ✅ Advanced error handling with retry logic
- ✅ Configurable capture options (format, quality, timeout)
- ✅ Loading animations and modern UI
- ✅ Debug mode with detailed logging
- ✅ Fast processing with optimized delays

### v1.1.0 - Reliability Update
- ✅ Enhanced error recovery
- ✅ Exponential backoff retry
- ✅ Error screenshot capture

### v1.0.0 - Original Version
- ✅ Basic full-page capture
- ✅ Simple popup interface

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Original extension by [Peter Coles](http://mrcoles.com/)
- Enhanced with modern features and reliability improvements
- Special thanks to [terrycojones](https://github.com/terrycojones) & [gleitz](https://github.com/gleitz) for contributions

---

**⭐ Star this repo if you find it useful!**

**🐛 Found a bug? [Report it here](../../issues)**
