#!/usr/bin/env node

/**
 * Scaffold a new userscript
 * Usage: npm run new:script -- <script-id>
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const scriptsDir = path.join(__dirname, '../scripts');

// Get script ID from command line
const scriptId = process.argv[2];

if (!scriptId) {
  console.error('❌ Error: Script ID is required');
  console.log('Usage: npm run new:script -- <script-id>');
  process.exit(1);
}

// Validate script ID format (kebab-case)
if (!/^[a-z0-9-]+$/.test(scriptId)) {
  console.error('❌ Error: Script ID must be lowercase letters, numbers, and hyphens only');
  process.exit(1);
}

// Check if script already exists
const scriptPath = path.join(scriptsDir, `${scriptId}.user.js`);
if (fs.existsSync(scriptPath)) {
  console.error(`❌ Error: Script "${scriptId}" already exists`);
  process.exit(1);
}

// Create readline interface for prompts
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function prompt(question) {
  return new Promise(resolve => {
    rl.question(question, answer => resolve(answer));
  });
}

async function main() {
  console.log(`\n🚀 Creating new script: ${scriptId}\n`);
  
  // Prompt for details
  const name = await prompt('Script name: ');
  const description = await prompt('Description: ');
  const enabledInput = await prompt('Enabled by default? (y/n) [y]: ');
  const enabled = !enabledInput || enabledInput.toLowerCase() === 'y';
  
  rl.close();
  
  // Generate script template
  const template = `// ==UserScript==
// @name         ${name || scriptId}
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  ${description || 'QoL userscript'}
// @author       You
// @match        *://*/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addStyle
// @require      https://your-cdn.com/qol-framework.user.js
// ==/UserScript==

(function() {
  'use strict';
  
  QoL.registerScript({
    id: '${scriptId}',
    name: '${name || scriptId}',
    description: '${description || 'QoL userscript'}',
    version: '1.0.0',
    enabled: ${enabled},
    
    settings: {
      // Example settings schema
      // exampleToggle: {
      //   type: 'toggle',
      //   label: 'Enable feature',
      //   default: true
      // },
      // exampleText: {
      //   type: 'text',
      //   label: 'Custom text',
      //   default: 'Hello'
      // },
      // exampleSelect: {
      //   type: 'select',
      //   label: 'Choose option',
      //   options: ['option1', 'option2', 'option3'],
      //   default: 'option1'
      // },
      // exampleColor: {
      //   type: 'color',
      //   label: 'Pick color',
      //   default: '#6366f1'
      // }
    },
    
    init() {
      console.log('[${scriptId}] Initializing...');
      
      // Your initialization code here
      // Access settings: QoL.store.get('${scriptId}', 'settingKey', defaultValue)
      // Load dependencies: await QoL.deps.load('turndown')
      // Show toast: QoL.ui.showToast('Message', 'success')
      
      this.setupEventListeners();
    },
    
    destroy() {
      console.log('[${scriptId}] Cleaning up...');
      
      // Your cleanup code here
      // Remove event listeners, clear intervals, etc.
    },
    
    setupEventListeners() {
      // Example: Add event listeners
      // document.addEventListener('click', this.handleClick.bind(this));
    },
    
    handleClick(event) {
      // Example event handler
      console.log('[${scriptId}] Click detected', event.target);
    }
  });
})();
`;
  
  // Ensure scripts directory exists
  if (!fs.existsSync(scriptsDir)) {
    fs.mkdirSync(scriptsDir, { recursive: true });
  }
  
  // Write script file
  fs.writeFileSync(scriptPath, template);
  
  console.log(`\n✅ Created: ${scriptPath}`);
  console.log(`\n📝 Next steps:`);
  console.log(`   1. Edit ${scriptId}.user.js to implement your script`);
  console.log(`   2. Run: npm run check:scripts`);
  console.log(`   3. Run: npm run build\n`);
}

main().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
