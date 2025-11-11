Perfect! Now I have all the details needed. Let me create a comprehensive plan for your QoL userscript framework.

# Implementation Plan

## Project Structure
```
qol-userscripts/
├── src/
│   ├── core/
│   │   ├── ui.js          # Toolbar, modal, toasts (glassmorphism)
│   │   ├── store.js       # Per-script persistent settings
│   │   ├── utils.js       # Shared helpers
│   │   ├── deps.js        # Dependency loader/cache
│   │   └── registry.js    # Auto-generated script manifest
│   ├── styles.js          # Dark glassmorphism CSS
│   └── index.js           # Main entry, exposes global QoL
├── scripts/
│   └── [individual userscripts call QoL.registerScript()]
├── tools/
│   ├── new-script.js      # Scaffold new scripts
│   ├── check-scripts.js   # Validate scripts
│   ├── integrate.js       # Regenerate registry
│   └── build.js           # esbuild bundler
├── dist/                  # Build output
├── package.json
└── README.md
```

## Framework Core (`src/`)

### `QoL.ui`
- **Toolbar**: Fixed bottom-left glassmorphic toolbar showing registered scripts with toggle buttons
- **Modal**: Unified settings modal with tabs/sections per script, renders based on each script's settings schema
- **Toasts**: Notification system matching existing toast styling from dark-mode-toggle

### `QoL.store`
- Namespaced storage per script using `GM_getValue`/`GM_setValue`
- API: `QoL.store.get(scriptId, key)`, `QoL.store.set(scriptId, key, value)`

### `QoL.deps`
- Dependency cache for shared libraries (Turndown, Readability, etc.)
- API: `await QoL.deps.load('turndown')` returns cached or loads from CDN
- Prevents duplicate library loads across scripts

**Supported Libraries:**
```javascript
// Turndown - HTML to Markdown conversion
const TurndownService = await QoL.deps.load('turndown');
const turndown = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced'
});

// Add custom rules for specific HTML elements
turndown.addRule('strikethrough', {
  filter: ['del', 's', 'strike'],
  replacement: (content) => `~~${content}~~`
});

const markdown = turndown.turndown('<h1>Hello</h1>');

// Readability - Extract main content from web pages
const { Readability } = await QoL.deps.load('readability');
const reader = new Readability(document.cloneNode(true));
const article = reader.parse();

console.log(article.title);      // Article title
console.log(article.content);    // Clean HTML content
console.log(article.textContent); // Plain text
console.log(article.excerpt);    // Short summary
console.log(article.byline);     // Author info
```

### `QoL.registerScript(config)`
- Registers script with: `{ id, name, description, version, enabled, settings: {...}, init: fn, destroy: fn }`
- Settings schema defines UI controls (toggle, text, color, select, etc.)
- Framework calls [init()](cci:1://file:///Users/pcstyle/qol-userscripts/custom-shortcuts-manager.user.js:2005:2-2017:3) when enabled, `destroy()` when disabled

## Styling
All UI components use your existing dark glassmorphism design:
- Background: `rgba(15, 23, 42, 0.9)` with `backdrop-filter: blur(12px)`
- Borders: `rgba(148, 163, 184, 0.35)`
- Accent: `#6366f1`
- Border radius: `14px` (toolbar), `18px` (modal)
- Gradients: `radial-gradient(circle at top, rgba(148,163,253,0.04), transparent)`

## Tooling (`tools/`)

### `npm run new:script -- <id>`
Creates `scripts/<id>.user.js` with:
- Userscript metadata headers
- `QoL.registerScript()` boilerplate
- Validates unique ID against existing scripts
- Prompts for name, description, default enabled state

### `npm run check:scripts`
Validates all files in `scripts/`:
- No duplicate IDs
- Required fields present (id, name, description)
- Valid JavaScript syntax
- Proper `QoL.registerScript()` call structure

### `npm run integrate`
Scans `scripts/` and regenerates `src/core/registry.js`:
- Exports array of all available scripts metadata
- Used by framework toolbar to show available scripts
- Auto-runs before build

### `npm run build` / `npm run build:all`
Uses esbuild to:
1. Bundle `src/` → `dist/qol-framework.user.js` with userscript headers and all `@grant` permissions
2. Bundle each `scripts/*.user.js` → `dist/` with `@require` pointing to framework
3. Minify and add source maps for debugging

**esbuild Configuration:**
```javascript
// tools/build.js
const esbuild = require('esbuild');

async function buildFramework() {
  await esbuild.build({
    entryPoints: ['src/index.js'],
    bundle: true,
    outfile: 'dist/qol-framework.user.js',
    format: 'iife',
    minify: true,
    sourcemap: true,
    target: ['es2020'],
    banner: {
      js: `// ==UserScript==
// @name         QoL Framework
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Unified framework for QoL userscripts
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// ==/UserScript==`
    }
  });
}

async function buildScripts() {
  const scripts = await glob('scripts/*.user.js');
  
  await esbuild.build({
    entryPoints: scripts.reduce((acc, script) => {
      const name = path.basename(script, '.user.js');
      acc[name] = script;
      return acc;
    }, {}),
    bundle: true,
    outdir: 'dist',
    format: 'iife',
    minify: true,
    sourcemap: true,
    target: ['es2020'],
    banner: {
      js: `// @require https://your-cdn.com/qol-framework.user.js`
    }
  });
}
```

## Migration Example
Convert [dark-mode-toggle.user.js](cci:7://file:///Users/pcstyle/qol-userscripts/dark-mode-toggle.user.js:0:0-0:0) to:
```javascript
QoL.registerScript({
  id: 'dark-mode-toggle',
  name: 'Dark Mode Toggle',
  description: 'Hybrid dark mode with smart CSS injection',
  version: '2.0.0',
  enabled: true,
  settings: {
    defaultMode: { type: 'select', options: ['smart', 'filter', 'off'], default: 'smart' },
    hotkey: { type: 'text', default: 'Alt+D' },
    // ... other settings
  },
  init() { /* existing logic */ },
  destroy() { /* cleanup */ }
});
```

## Key Features
- **Modular**: Core framework + independent scripts
- **Consistent UI**: All scripts share glassmorphic toolbar and settings modal
- **Easy workflow**: `new:script` → code → `check:scripts` → `build`
- **Dependency sharing**: Common libraries loaded once via `QoL.deps`
- **Per-script settings**: Each script declares schema, framework renders UI
- **Hot-swappable**: Enable/disable scripts from unified settings without reinstalling

This plan creates a clean, extensible foundation matching your existing QoL aesthetic while providing robust tooling for managing multiple userscripts in one repo.

---

## Implementation Best Practices (from Context7)

### esbuild Multiple Entry Points
- Use object notation for entry points to control output names
- Enable code splitting with `splitting: true` and `format: 'esm'` for shared dependencies
- Use `banner` option to inject userscript headers automatically
- Set `metafile: true` to analyze bundle composition

### Turndown Custom Rules
- Add custom rules for site-specific HTML elements (e.g., spoiler tags, code blocks)
- Use `keep()` method to preserve certain HTML elements as-is
- Use `remove()` method to strip unwanted elements (ads, navigation)
- Chain multiple rules for complex conversions

### Readability Content Extraction
- Always clone the document before parsing: `new Readability(document.cloneNode(true))`
- Use `article.textContent` for plain text, `article.content` for cleaned HTML
- Check `article.excerpt` for auto-generated summaries
- Combine with Turndown for HTML → Markdown conversion pipeline

### Dependency Loading Strategy
```javascript
// src/core/deps.js
const DEPS = {
  turndown: 'https://unpkg.com/turndown@7.1.2/dist/turndown.js',
  readability: 'https://unpkg.com/@mozilla/readability@0.5.0/Readability.js'
};

const cache = new Map();

export async function load(name) {
  if (cache.has(name)) return cache.get(name);
  
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: 'GET',
      url: DEPS[name],
      onload: (response) => {
        const script = new Function(response.responseText + `; return ${name === 'turndown' ? 'TurndownService' : 'Readability'};`);
        const lib = script();
        cache.set(name, lib);
        resolve(lib);
      },
      onerror: reject
    });
  });
}
```

### Build Optimization
```javascript
// Shared chunk naming for better caching
chunkNames: 'chunks/[name]-[hash]',

// External dependencies (don't bundle, load from CDN)
external: ['https://unpkg.com/*'],

// Tree shaking for smaller bundles
treeShaking: true,

// Target modern browsers for smaller output
target: ['chrome90', 'firefox88', 'safari14']
```