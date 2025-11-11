# Quick Start Guide

Get up and running with the QoL Framework in 5 minutes!

## 1. Install Dependencies

```bash
npm install
```

## 2. Build the Framework

```bash
npm run build
```

This will create:
- `dist/qol-framework.user.js` - The core framework
- `dist/example-script.user.js` - Example script

## 3. Install in Tampermonkey/Violentmonkey

### Install Framework (Required)
1. Open your userscript manager
2. Click "Create new script" or "+"
3. Copy the contents of `dist/qol-framework.user.js`
4. Paste and save

### Install Example Script
1. Click "Create new script" or "+"
2. Copy the contents of `dist/example-script.user.js`
3. Paste and save

## 4. Test It Out

1. Visit any website
2. You should see a glassmorphic toolbar in the bottom-left corner
3. Click the ⚙️ settings button to open the settings modal
4. Toggle the example script on/off
5. Hover over elements to see the highlight effect

## 5. Create Your First Script

```bash
npm run new:script -- my-first-script
```

Follow the prompts to enter:
- Script name
- Description
- Default enabled state

This creates `scripts/my-first-script.user.js` with boilerplate code.

## 6. Edit Your Script

Open `scripts/my-first-script.user.js` and customize:

```javascript
QoL.registerScript({
  id: 'my-first-script',
  name: 'My First Script',
  description: 'Does something awesome',
  version: '1.0.0',
  enabled: true,
  
  settings: {
    myToggle: {
      type: 'toggle',
      label: 'Enable feature',
      default: true
    }
  },
  
  init() {
    console.log('My script is running!');
    QoL.ui.showToast('Hello from my script!', 'success');
  },
  
  destroy() {
    console.log('Cleaning up...');
  }
});
```

## 7. Build and Install

```bash
npm run build
```

Then install `dist/my-first-script.user.js` in your userscript manager.

## Common Commands

```bash
# Create new script
npm run new:script -- script-name

# Validate all scripts
npm run check:scripts

# Regenerate registry
npm run integrate

# Build everything
npm run build
```

## Workflow

1. **Create** - `npm run new:script -- script-name`
2. **Code** - Edit `scripts/script-name.user.js`
3. **Validate** - `npm run check:scripts`
4. **Build** - `npm run build`
5. **Install** - Copy from `dist/` to userscript manager
6. **Test** - Refresh browser and check toolbar

## Tips

- The framework must be installed first before any scripts
- Scripts automatically appear in the toolbar when registered
- Use the settings modal to configure each script
- Check browser console for debug logs
- All scripts share the same glassmorphic UI style

## Troubleshooting

**Toolbar not appearing?**
- Check that framework is installed and enabled
- Look for errors in browser console
- Verify `@match` patterns in userscript headers

**Script not in toolbar?**
- Run `npm run check:scripts` to validate
- Ensure `QoL.registerScript()` is called correctly
- Check that script ID is unique

**Settings not saving?**
- Verify GM_getValue/GM_setValue permissions
- Check script ID matches in all storage calls
- Look for console errors

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Check out the example script for implementation patterns
- Explore the framework API in `src/core/`
- Join the community and share your scripts!

Happy scripting! 🚀
