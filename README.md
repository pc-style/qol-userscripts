# QoL Userscripts Framework

A unified framework for Quality of Life userscripts with a beautiful dark glassmorphic UI.

## Features

- 🎨 **Glassmorphic UI** - Beautiful dark mode interface with blur effects
- 🔧 **Unified Settings** - Single modal for all script settings
- 📦 **Dependency Management** - Shared library loading (Turndown, Readability)
- 💾 **Per-Script Storage** - Namespaced settings using GM_getValue/GM_setValue
- 🔌 **Hot-Swappable** - Enable/disable scripts without reinstalling
- 🛠️ **Developer Tools** - CLI tools for scaffolding and validation

## Quick Start

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a new script:
```bash
npm run new:script -- my-awesome-script
```

3. Edit your script in `scripts/my-awesome-script.user.js`

4. Build the framework:
```bash
npm run build
```

5. Install in your userscript manager:
   - First install `dist/qol-framework.user.js`
   - Then install your script from `dist/`

## Project Structure

```
qol-userscripts/
├── src/
│   ├── core/
│   │   ├── ui.js          # Toolbar, modal, toasts
│   │   ├── store.js       # Per-script storage
│   │   ├── utils.js       # Shared utilities
│   │   ├── deps.js        # Dependency loader
│   │   └── registry.js    # Auto-generated manifest
│   ├── styles.js          # Glassmorphism CSS
│   └── index.js           # Main entry point
├── scripts/               # Your userscripts
├── tools/                 # Build and dev tools
├── dist/                  # Build output
└── package.json
```

## Writing Scripts

### Basic Template

```javascript
QoL.registerScript({
  id: 'my-script',
  name: 'My Awesome Script',
  description: 'Does something cool',
  version: '1.0.0',
  enabled: true,
  
  settings: {
    myToggle: {
      type: 'toggle',
      label: 'Enable feature',
      default: true
    },
    myText: {
      type: 'text',
      label: 'Custom text',
      default: 'Hello'
    },
    mySelect: {
      type: 'select',
      label: 'Choose option',
      options: ['option1', 'option2', 'option3'],
      default: 'option1'
    },
    myColor: {
      type: 'color',
      label: 'Pick color',
      default: '#6366f1'
    }
  },
  
  init() {
    // Your initialization code
    const enabled = QoL.store.get(this.id, 'myToggle', true);
    if (enabled) {
      this.doSomething();
    }
  },
  
  destroy() {
    // Cleanup code
  },
  
  doSomething() {
    QoL.ui.showToast('Script running!', 'success');
  }
});
```

### Using Dependencies

```javascript
// Load Turndown for HTML to Markdown conversion
const TurndownService = await QoL.deps.load('turndown');
const turndown = new TurndownService();
const markdown = turndown.turndown('<h1>Hello</h1>');

// Load Readability for content extraction
const { Readability } = await QoL.deps.load('readability');
const reader = new Readability(document.cloneNode(true));
const article = reader.parse();
console.log(article.title, article.content);
```

### Accessing Storage

```javascript
// Get a value
const value = QoL.store.get('my-script', 'settingKey', 'defaultValue');

// Set a value
QoL.store.set('my-script', 'settingKey', 'newValue');

// Remove a value
QoL.store.remove('my-script', 'settingKey');

// Clear all settings for a script
QoL.store.clear('my-script');
```

### Using Utilities

```javascript
// Create DOM elements
const button = QoL.utils.createElement('button', {
  className: 'my-button',
  onClick: () => console.log('clicked')
}, 'Click me');

// Wait for an element
const element = await QoL.utils.waitForElement('.my-selector', 5000);

// Debounce a function
const debouncedFn = QoL.utils.debounce(() => {
  console.log('Called after delay');
}, 300);

// Generate unique ID
const id = QoL.utils.generateId();
```

### Showing Toasts

```javascript
QoL.ui.showToast('Info message', 'info');
QoL.ui.showToast('Success!', 'success');
QoL.ui.showToast('Warning!', 'warning');
QoL.ui.showToast('Error!', 'error');
```

## CLI Commands

### `npm run new:script -- <id>`
Create a new userscript with boilerplate code.

```bash
npm run new:script -- dark-mode-toggle
```

### `npm run check:scripts`
Validate all scripts for:
- Duplicate IDs
- Required fields
- Valid JavaScript syntax
- Proper structure

```bash
npm run check:scripts
```

### `npm run integrate`
Regenerate the script registry from `scripts/` directory.

```bash
npm run integrate
```

### `npm run build`
Build the framework and all scripts to `dist/`.

```bash
npm run build
```

## Design System

The framework uses a consistent dark glassmorphism design:

- **Background**: `rgba(15, 23, 42, 0.9)` with `backdrop-filter: blur(12px)`
- **Borders**: `rgba(148, 163, 184, 0.35)`
- **Accent**: `#6366f1` (Indigo)
- **Border Radius**: `14px` (toolbar), `18px` (modal)
- **Gradients**: `radial-gradient(circle at top, rgba(148,163,253,0.04), transparent)`

## Setting Types

### Toggle
```javascript
myToggle: {
  type: 'toggle',
  label: 'Enable feature',
  default: true
}
```

### Text Input
```javascript
myText: {
  type: 'text',
  label: 'Enter text',
  default: 'Default value'
}
```

### Select Dropdown
```javascript
mySelect: {
  type: 'select',
  label: 'Choose option',
  options: ['option1', 'option2', 'option3'],
  default: 'option1'
}
```

### Color Picker
```javascript
myColor: {
  type: 'color',
  label: 'Pick color',
  default: '#6366f1'
}
```

## Best Practices

1. **Always provide cleanup** - Implement `destroy()` to remove event listeners and clear intervals
2. **Use namespaced storage** - Always use `QoL.store` with your script ID
3. **Cache dependencies** - `QoL.deps.load()` automatically caches libraries
4. **Clone documents** - When using Readability: `new Readability(document.cloneNode(true))`
5. **Validate settings** - Check setting values before using them
6. **Show feedback** - Use toasts to inform users of actions

## Troubleshooting

### Script not appearing in toolbar
- Check that `QoL.registerScript()` is called correctly
- Verify script ID is unique
- Run `npm run check:scripts` to validate

### Settings not persisting
- Ensure you're using `QoL.store.set()` to save values
- Check that script ID matches in all storage calls
- Verify GM_getValue/GM_setValue permissions in metadata

### Dependencies not loading
- Check browser console for errors
- Verify CDN URLs in `src/core/deps.js`
- Ensure `GM_xmlhttpRequest` permission is granted

## License

MIT

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `npm run check:scripts` to validate
5. Submit a pull request
