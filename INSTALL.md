# Installation Guide

## Fixed Issues ✅
- **CSP Compliance**: Now uses `GM_addStyle` to bypass Content Security Policy
- **Load Order**: Framework initializes with delay to ensure QoL is available
- **Local Testing**: Example script uses `file://` path for local development

## Quick Install

### 1. Install Framework (Required First!)

Copy the entire contents of `dist/qol-framework.user.js` and install in Tampermonkey/Violentmonkey.

**Important**: The framework MUST be installed before any scripts that use it.

### 2. Install Example Script

Copy the entire contents of `dist/example-script.user.js` and install in your userscript manager.

**Note**: For local development, the example script uses:
```javascript
// @require      file:///Users/pcstyle/qol-userscripts/dist/qol-framework.user.js
```

For production, change this to your CDN URL:
```javascript
// @require      https://your-cdn.com/qol-framework.user.js
```

### 3. Test It

1. Visit any website
2. Look for the glassmorphic toolbar in the bottom-left corner
3. Click the ⚙️ settings button
4. Toggle the example script
5. Hover over page elements to see highlighting

## Troubleshooting

### "QoL is not defined"
- **Cause**: Framework not loaded before script
- **Fix**: Ensure framework is installed first and enabled
- **Fix**: Check that `@require` path is correct
- **Fix**: Try `@run-at document-idle` in script headers

### CSP Violations
- **Cause**: Some sites have strict Content Security Policy
- **Fix**: Framework now uses `GM_addStyle` (already fixed ✅)
- **Verify**: Check that `@grant GM_addStyle` is in headers

### Toolbar Not Appearing
- **Check**: Framework is installed and enabled
- **Check**: Console for errors (F12)
- **Check**: `@match` patterns include current site
- **Try**: Refresh the page

### Settings Not Saving
- **Check**: `@grant GM_getValue` and `@grant GM_setValue` in headers
- **Check**: Console for storage errors
- **Try**: Clear browser cache

## Development Setup

### For Local Testing

1. Build the framework:
```bash
npm run build
```

2. In your scripts, use local file path:
```javascript
// @require      file:///Users/pcstyle/qol-userscripts/dist/qol-framework.user.js
```

3. Enable file access in Tampermonkey:
   - Go to Tampermonkey Dashboard
   - Settings tab
   - Enable "Allow access to file URLs"

### For Production

1. Host `dist/qol-framework.user.js` on a CDN (GitHub Pages, jsDelivr, etc.)

2. Update all scripts to use CDN URL:
```javascript
// @require      https://cdn.jsdelivr.net/gh/pc-style/qol-userscripts@main/dist/qol-framework.user.js
```

## GitHub Repository

The framework is now available at:
**https://github.com/pc-style/qol-userscripts**

### Using jsDelivr CDN

You can use jsDelivr to serve the framework directly from GitHub:

```javascript
// @require      https://cdn.jsdelivr.net/gh/pc-style/qol-userscripts@main/dist/qol-framework.user.js
```

This URL will always serve the latest version from the main branch.

## Next Steps

1. ✅ Framework installed and working
2. ✅ Example script demonstrates features
3. 📝 Create your own scripts: `npm run new:script -- my-script`
4. 🚀 Share your scripts with the community!

## Support

- **Issues**: https://github.com/pc-style/qol-userscripts/issues
- **Documentation**: See README.md, QUICKSTART.md, ARCHITECTURE.md
- **Examples**: Check `scripts/example-script.user.js`
