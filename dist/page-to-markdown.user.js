// ==UserScript==
// @name         📝 Page to Markdown with Selector
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Convert any page or selected element to Markdown using Readability and Turndown
// @author       QoL Team
// @match        *://*/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addStyle
// @grant        GM_setClipboard
// @grant        GM_xmlhttpRequest
// @require      https://cdn.jsdelivr.net/gh/pc-style/qol-userscripts@main/dist/qol-framework.user.js
// @run-at       document-idle
// ==/UserScript==

(function() {
  'use strict';
  
  QoL.registerScript({
    id: 'page-to-markdown',
    name: '📝 Page to Markdown',
    description: 'Convert page content to Markdown with element selector',
    version: '1.0.0',
    enabled: true,
    
    settings: {
      mode: {
        type: 'select',
        label: 'Conversion Mode',
        options: ['full-page', 'readability', 'selector'],
        default: 'readability'
      },
      headingStyle: {
        type: 'select',
        label: 'Heading Style',
        options: ['atx', 'setext'],
        default: 'atx'
      },
      codeBlockStyle: {
        type: 'select',
        label: 'Code Block Style',
        options: ['fenced', 'indented'],
        default: 'fenced'
      },
      bulletListMarker: {
        type: 'select',
        label: 'Bullet List Marker',
        options: ['-', '*', '+'],
        default: '-'
      },
      includeMetadata: {
        type: 'toggle',
        label: 'Include Metadata',
        default: true
      },
      copyToClipboard: {
        type: 'toggle',
        label: 'Auto Copy to Clipboard',
        default: true
      },
      showPreview: {
        type: 'toggle',
        label: 'Show Preview Modal',
        default: true
      }
    },
    
    turndownService: null,
    selectorMode: false,
    selectedElement: null,
    
    init() {
      console.log('[page-to-markdown] Initializing...');
      
      this.setupTurndown();
      this.addConvertButton();
      this.setupKeyboardShortcut();
      
      QoL.ui.showToast('Page to Markdown ready! Press Ctrl+Shift+M', 'success');
    },
    
    destroy() {
      console.log('[page-to-markdown] Cleaning up...');
      
      this.removeConvertButton();
      this.disableSelectorMode();
      
      QoL.ui.showToast('Page to Markdown disabled', 'info');
    },
    
    async setupTurndown() {
      const TurndownService = await QoL.deps.load('turndown');
      
      const headingStyle = QoL.store.get(this.id, 'headingStyle', 'atx');
      const codeBlockStyle = QoL.store.get(this.id, 'codeBlockStyle', 'fenced');
      const bulletListMarker = QoL.store.get(this.id, 'bulletListMarker', '-');
      
      this.turndownService = new TurndownService({
        headingStyle: headingStyle,
        codeBlockStyle: codeBlockStyle,
        bulletListMarker: bulletListMarker,
        emDelimiter: '_',
        strongDelimiter: '**'
      });
      
      // Add custom rules
      this.addCustomRules();
    },
    
    addCustomRules() {
      // Strikethrough
      this.turndownService.addRule('strikethrough', {
        filter: ['del', 's', 'strike'],
        replacement: (content) => `~~${content}~~`
      });
      
      // Highlight/mark
      this.turndownService.addRule('highlight', {
        filter: ['mark'],
        replacement: (content) => `==${content}==`
      });
      
      // Preserve data attributes for special elements
      this.turndownService.addRule('codeWithLanguage', {
        filter: (node) => {
          return node.nodeName === 'PRE' && 
                 node.firstChild && 
                 node.firstChild.nodeName === 'CODE';
        },
        replacement: (content, node) => {
          const code = node.firstChild;
          const language = code.className.match(/language-(\w+)/)?.[1] || '';
          return `\n\`\`\`${language}\n${code.textContent}\n\`\`\`\n`;
        }
      });
    },
    
    addConvertButton() {
      // Add floating action button
      const button = QoL.utils.createElement('button', {
        id: 'qol-markdown-convert-btn',
        title: 'Convert to Markdown (Ctrl+Shift+M)',
        style: {
          position: 'fixed',
          bottom: '80px',
          right: '20px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          border: 'none',
          color: '#fff',
          fontSize: '24px',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
          zIndex: '999998',
          transition: 'all 0.3s ease'
        },
        onClick: () => this.handleConvert()
      }, '📝');
      
      button.addEventListener('mouseenter', () => {
        button.style.transform = 'scale(1.1)';
        button.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.6)';
      });
      
      button.addEventListener('mouseleave', () => {
        button.style.transform = 'scale(1)';
        button.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.4)';
      });
      
      document.body.appendChild(button);
    },
    
    removeConvertButton() {
      const button = document.getElementById('qol-markdown-convert-btn');
      if (button) button.remove();
    },
    
    setupKeyboardShortcut() {
      document.addEventListener('keydown', (e) => {
        // Ctrl+Shift+M
        if (e.ctrlKey && e.shiftKey && e.key === 'M') {
          e.preventDefault();
          this.handleConvert();
        }
        
        // Ctrl+Shift+S for selector mode
        if (e.ctrlKey && e.shiftKey && e.key === 'S') {
          e.preventDefault();
          this.toggleSelectorMode();
        }
      });
    },
    
    async handleConvert() {
      const mode = QoL.store.get(this.id, 'mode', 'readability');
      
      if (mode === 'selector') {
        this.enableSelectorMode();
        return;
      }
      
      QoL.ui.showToast('Converting to Markdown...', 'info', 2000);
      
      let markdown = '';
      
      if (mode === 'full-page') {
        markdown = await this.convertFullPage();
      } else if (mode === 'readability') {
        markdown = await this.convertWithReadability();
      }
      
      this.handleMarkdownOutput(markdown);
    },
    
    async convertFullPage() {
      const includeMetadata = QoL.store.get(this.id, 'includeMetadata', true);
      
      let markdown = '';
      
      if (includeMetadata) {
        markdown += this.getMetadata();
      }
      
      // Clone body to avoid modifying the page
      const clone = document.body.cloneNode(true);
      
      // Remove scripts and styles
      clone.querySelectorAll('script, style, noscript').forEach(el => el.remove());
      
      markdown += this.turndownService.turndown(clone);
      
      return markdown;
    },
    
    async convertWithReadability() {
      const { Readability } = await QoL.deps.load('readability');
      const includeMetadata = QoL.store.get(this.id, 'includeMetadata', true);
      
      // Clone document for Readability
      const documentClone = document.cloneNode(true);
      const reader = new Readability(documentClone);
      const article = reader.parse();
      
      if (!article) {
        QoL.ui.showToast('Could not extract article content', 'error');
        return this.convertFullPage();
      }
      
      let markdown = '';
      
      if (includeMetadata) {
        markdown += `# ${article.title}\n\n`;
        if (article.byline) {
          markdown += `**By:** ${article.byline}\n\n`;
        }
        if (article.excerpt) {
          markdown += `> ${article.excerpt}\n\n`;
        }
        markdown += `**Source:** ${window.location.href}\n\n`;
        markdown += `---\n\n`;
      }
      
      markdown += this.turndownService.turndown(article.content);
      
      return markdown;
    },
    
    getMetadata() {
      const title = document.title;
      const url = window.location.href;
      const date = new Date().toISOString().split('T')[0];
      
      return `---
title: ${title}
url: ${url}
date: ${date}
---

`;
    },
    
    enableSelectorMode() {
      this.selectorMode = true;
      QoL.ui.showToast('Click on an element to convert it to Markdown', 'info', 3000);
      
      // Add visual indicator
      document.body.style.cursor = 'crosshair';
      
      // Add click listener
      document.addEventListener('click', this.handleSelectorClick.bind(this), true);
      
      // Add hover effect
      document.addEventListener('mouseover', this.handleSelectorHover.bind(this), true);
      document.addEventListener('mouseout', this.handleSelectorOut.bind(this), true);
    },
    
    disableSelectorMode() {
      this.selectorMode = false;
      document.body.style.cursor = '';
      
      if (this.selectedElement) {
        this.selectedElement.style.outline = '';
        this.selectedElement = null;
      }
    },
    
    handleSelectorHover(e) {
      if (!this.selectorMode) return;
      if (e.target.closest('#qol-toolbar, #qol-modal, #qol-markdown-convert-btn')) return;
      
      e.target.style.outline = '2px solid #6366f1';
      e.target.style.outlineOffset = '2px';
    },
    
    handleSelectorOut(e) {
      if (!this.selectorMode) return;
      e.target.style.outline = '';
    },
    
    async handleSelectorClick(e) {
      if (!this.selectorMode) return;
      if (e.target.closest('#qol-toolbar, #qol-modal, #qol-markdown-convert-btn')) return;
      
      e.preventDefault();
      e.stopPropagation();
      
      this.selectedElement = e.target;
      this.disableSelectorMode();
      
      QoL.ui.showToast('Converting selected element...', 'info', 2000);
      
      const markdown = this.turndownService.turndown(this.selectedElement);
      this.handleMarkdownOutput(markdown);
    },
    
    toggleSelectorMode() {
      if (this.selectorMode) {
        this.disableSelectorMode();
        QoL.ui.showToast('Selector mode disabled', 'info');
      } else {
        this.enableSelectorMode();
      }
    },
    
    handleMarkdownOutput(markdown) {
      const copyToClipboard = QoL.store.get(this.id, 'copyToClipboard', true);
      const showPreview = QoL.store.get(this.id, 'showPreview', true);
      
      if (copyToClipboard) {
        GM_setClipboard(markdown, 'text');
        QoL.ui.showToast('Markdown copied to clipboard! 📋', 'success');
      }
      
      if (showPreview) {
        this.showMarkdownPreview(markdown);
      }
      
      console.log('[page-to-markdown] Generated markdown:', markdown);
    },
    
    showMarkdownPreview(markdown) {
      // Create preview modal
      const modal = QoL.utils.createElement('div', {
        style: {
          position: 'fixed',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(4px)',
          zIndex: '1000000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        },
        onClick: (e) => {
          if (e.target === modal) modal.remove();
        }
      });
      
      const content = QoL.utils.createElement('div', {
        style: {
          width: '90%',
          maxWidth: '900px',
          maxHeight: '80vh',
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(148, 163, 184, 0.35)',
          borderRadius: '18px',
          padding: '24px',
          overflow: 'auto'
        }
      });
      
      const header = QoL.utils.createElement('div', {
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          paddingBottom: '16px',
          borderBottom: '1px solid rgba(148, 163, 184, 0.2)'
        }
      });
      
      const title = QoL.utils.createElement('h2', {
        style: {
          margin: '0',
          color: '#f1f5f9',
          fontSize: '20px'
        }
      }, 'Markdown Preview');
      
      const closeBtn = QoL.utils.createElement('button', {
        style: {
          background: 'none',
          border: 'none',
          color: '#94a3b8',
          fontSize: '28px',
          cursor: 'pointer',
          padding: '0',
          width: '32px',
          height: '32px'
        },
        onClick: () => modal.remove()
      }, '×');
      
      const textarea = QoL.utils.createElement('textarea', {
        style: {
          width: '100%',
          height: '400px',
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid rgba(148, 163, 184, 0.3)',
          borderRadius: '8px',
          color: '#e2e8f0',
          padding: '12px',
          fontFamily: 'monospace',
          fontSize: '14px',
          lineHeight: '1.5',
          resize: 'vertical'
        }
      });
      textarea.value = markdown;
      
      const copyBtn = QoL.utils.createElement('button', {
        style: {
          marginTop: '16px',
          padding: '10px 20px',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          border: 'none',
          borderRadius: '8px',
          color: '#fff',
          fontSize: '14px',
          fontWeight: '500',
          cursor: 'pointer'
        },
        onClick: () => {
          GM_setClipboard(markdown, 'text');
          QoL.ui.showToast('Copied to clipboard! 📋', 'success');
        }
      }, '📋 Copy to Clipboard');
      
      header.appendChild(title);
      header.appendChild(closeBtn);
      content.appendChild(header);
      content.appendChild(textarea);
      content.appendChild(copyBtn);
      modal.appendChild(content);
      document.body.appendChild(modal);
    }
  });
})();
