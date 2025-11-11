#!/usr/bin/env node

/**
 * Validate all userscripts in the scripts/ directory
 * Checks for:
 * - Duplicate IDs
 * - Required fields (id, name, description)
 * - Valid JavaScript syntax
 * - Proper QoL.registerScript() call structure
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const scriptsDir = path.join(__dirname, '../scripts');

let hasErrors = false;

function error(message) {
  console.error(`❌ ${message}`);
  hasErrors = true;
}

function warning(message) {
  console.warn(`⚠️  ${message}`);
}

function success(message) {
  console.log(`✅ ${message}`);
}

async function validateScripts() {
  console.log('🔍 Validating userscripts...\n');
  
  // Find all .user.js files
  const scriptFiles = await glob('*.user.js', { cwd: scriptsDir });
  
  if (scriptFiles.length === 0) {
    warning('No userscripts found in scripts/ directory');
    return;
  }
  
  console.log(`Found ${scriptFiles.length} script(s)\n`);
  
  const seenIds = new Set();
  const scripts = [];
  
  for (const file of scriptFiles) {
    const filePath = path.join(scriptsDir, file);
    console.log(`Checking: ${file}`);
    
    let content;
    try {
      content = fs.readFileSync(filePath, 'utf8');
    } catch (err) {
      error(`  Failed to read file: ${err.message}`);
      continue;
    }
    
    // Check for QoL.registerScript call
    // More flexible regex to handle IIFEs and nested objects
    const registerMatch = content.match(/QoL\.registerScript\s*\(\s*\{([\s\S]*?)\n\s*\}\s*\)/m);
    if (!registerMatch) {
      error(`  Missing or malformed QoL.registerScript() call`);
      continue;
    }
    
    // Extract script config (basic parsing)
    const configStr = registerMatch[1];
    
    // Extract ID
    const idMatch = configStr.match(/id\s*:\s*['"]([^'"]+)['"]/);
    if (!idMatch) {
      error(`  Missing required field: id`);
      continue;
    }
    const id = idMatch[1];
    
    // Check for duplicate IDs
    if (seenIds.has(id)) {
      error(`  Duplicate script ID: "${id}"`);
      continue;
    }
    seenIds.add(id);
    
    // Extract name
    const nameMatch = configStr.match(/name\s*:\s*['"]([^'"]+)['"]/);
    if (!nameMatch) {
      error(`  Missing required field: name`);
      continue;
    }
    const name = nameMatch[1];
    
    // Extract description (optional but recommended)
    const descMatch = configStr.match(/description\s*:\s*['"]([^'"]+)['"]/);
    if (!descMatch) {
      warning(`  Missing recommended field: description`);
    }
    
    // Check for init function
    if (!configStr.match(/init\s*\(/)) {
      warning(`  Missing init() function`);
    }
    
    // Check for destroy function
    if (!configStr.match(/destroy\s*\(/)) {
      warning(`  Missing destroy() function (recommended for cleanup)`);
    }
    
    // Basic syntax check (try to parse as JS)
    try {
      // This is a very basic check - just ensures no obvious syntax errors
      new Function(content);
    } catch (err) {
      error(`  JavaScript syntax error: ${err.message}`);
      continue;
    }
    
    scripts.push({ id, name, file });
    success(`  Valid: ${name} (${id})`);
    console.log('');
  }
  
  // Summary
  console.log('─'.repeat(50));
  console.log(`\n📊 Summary:`);
  console.log(`   Total scripts: ${scriptFiles.length}`);
  console.log(`   Valid scripts: ${scripts.length}`);
  console.log(`   Errors: ${hasErrors ? 'Yes' : 'None'}\n`);
  
  if (hasErrors) {
    console.error('❌ Validation failed. Please fix the errors above.\n');
    process.exit(1);
  } else {
    console.log('✅ All scripts validated successfully!\n');
  }
}

validateScripts().catch(error => {
  console.error('❌ Validation error:', error.message);
  process.exit(1);
});
