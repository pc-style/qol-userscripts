#!/usr/bin/env node

/**
 * Build script using esbuild
 * Bundles framework and individual scripts
 */

import esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

// Ensure dist directory exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

async function buildFramework() {
  console.log('🔨 Building framework...');
  
  // Read version from package.json
  const pkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
  const version = pkg.version;
  
  try {
    await esbuild.build({
      entryPoints: [path.join(rootDir, 'src/index.js')],
      bundle: true,
      outfile: path.join(distDir, 'qol-framework.user.js'),
      format: 'iife',
      minify: false, // Keep readable for userscript debugging
      sourcemap: true,
      target: ['es2020'],
      banner: {
        js: `// ==UserScript==
// @name         QoL Framework
// @namespace    http://tampermonkey.net/
// @version      ${version}
// @description  Unified framework for QoL userscripts with glassmorphic UI
// @author       QoL Team
// @match        *://*/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_listValues
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @run-at       document-start
// ==/UserScript==

/* jshint esversion: 11 */
`
      }
    });
    
    console.log('✅ Framework built successfully');
  } catch (error) {
    console.error('❌ Framework build failed:', error);
    throw error;
  }
}

async function buildScripts() {
  console.log('\n🔨 Building individual scripts...');
  
  const scriptFiles = await glob('*.user.js', { cwd: path.join(rootDir, 'scripts') });
  
  if (scriptFiles.length === 0) {
    console.log('⚠️  No scripts to build');
    return;
  }
  
  for (const file of scriptFiles) {
    const scriptPath = path.join(rootDir, 'scripts', file);
    const content = fs.readFileSync(scriptPath, 'utf8');
    
    // Extract metadata from script
    const metadataMatch = content.match(/\/\/ ==UserScript==\n([\s\S]*?)\n\/\/ ==\/UserScript==/);
    let metadata = '';
    
    if (metadataMatch) {
      metadata = metadataMatch[0];
      
      // Add @require for framework if not present
      if (!metadata.includes('@require')) {
        metadata = metadata.replace(
          '// ==/UserScript==',
          '// @require      https://your-cdn.com/qol-framework.user.js\n// ==/UserScript=='
        );
      }
    }
    
    // For now, just copy scripts to dist (they don't need bundling since they use the framework)
    const outputPath = path.join(distDir, file);
    fs.copyFileSync(scriptPath, outputPath);
    
    console.log(`✅ Built: ${file}`);
  }
}

async function build() {
  console.log('🚀 Starting build process...\n');
  
  try {
    await buildFramework();
    await buildScripts();
    
    console.log('\n✨ Build completed successfully!');
    console.log(`\n📦 Output directory: ${distDir}`);
    console.log('\n📝 Next steps:');
    console.log('   1. Install qol-framework.user.js in your userscript manager');
    console.log('   2. Install individual scripts from dist/');
    console.log('   3. Refresh your browser\n');
  } catch (error) {
    console.error('\n❌ Build failed:', error.message);
    process.exit(1);
  }
}

build();
