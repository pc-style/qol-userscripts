#!/usr/bin/env node

/**
 * Purge jsDelivr CDN cache for the QoL framework
 * This forces users to get the latest version immediately
 */

import https from 'https';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));

const GITHUB_USER = 'pc-style';
const GITHUB_REPO = 'qol-userscripts';

// Files to purge
const FILES_TO_PURGE = [
  '/dist/qol-framework.user.js',
  '/dist/qol-framework.user.js.map',
  '/dist/dark-mode-enforcer.user.js',
  '/dist/page-to-markdown.user.js',
  '/dist/example-script.user.js'
];

console.log(`\n🔄 Purging jsDelivr CDN cache for v${pkg.version}...\n`);

/**
 * Purge a single file from jsDelivr CDN
 */
function purgeFile(filePath) {
  return new Promise((resolve, reject) => {
    // jsDelivr purge URL format
    const purgeUrl = `https://purge.jsdelivr.net/gh/${GITHUB_USER}/${GITHUB_REPO}@main${filePath}`;
    
    console.log(`Purging: ${filePath}`);
    
    https.get(purgeUrl, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log(`✅ Purged: ${filePath}`);
          resolve({ file: filePath, status: 'success' });
        } else {
          console.log(`⚠️  Warning: ${filePath} - Status ${res.statusCode}`);
          resolve({ file: filePath, status: 'warning', code: res.statusCode });
        }
      });
    }).on('error', (err) => {
      console.error(`❌ Error purging ${filePath}:`, err.message);
      reject({ file: filePath, error: err.message });
    });
  });
}

/**
 * Purge all files
 */
async function purgeAll() {
  const results = [];
  
  for (const file of FILES_TO_PURGE) {
    try {
      const result = await purgeFile(file);
      results.push(result);
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      results.push(error);
    }
  }
  
  console.log('\n' + '─'.repeat(50));
  console.log('\n📊 Summary:');
  
  const successful = results.filter(r => r.status === 'success').length;
  const warnings = results.filter(r => r.status === 'warning').length;
  const errors = results.filter(r => r.error).length;
  
  console.log(`   ✅ Successful: ${successful}`);
  if (warnings > 0) console.log(`   ⚠️  Warnings: ${warnings}`);
  if (errors > 0) console.log(`   ❌ Errors: ${errors}`);
  
  console.log('\n💡 Tips:');
  console.log('   - Cache purge takes a few minutes to propagate globally');
  console.log('   - Users will get the new version on next page load');
  console.log('   - CDN URL: https://cdn.jsdelivr.net/gh/pc-style/qol-userscripts@main/dist/');
  console.log('');
}

purgeAll().catch(error => {
  console.error('\n❌ Purge failed:', error);
  process.exit(1);
});
