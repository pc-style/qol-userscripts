// ==UserScript==
// @name         Example QoL Script
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Example userscript demonstrating QoL framework features
// @author       QoL Team
// @match        *://*/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addStyle
// @require      file:///Users/pcstyle/qol-userscripts/dist/qol-framework.user.js
// @run-at       document-idle
// ==/UserScript==

(function() {
  'use strict';
  
  QoL.registerScript({
    id: 'example-script',
    name: '📝 Example Script',
    description: 'Demonstrates framework features with a simple page highlighter',
    version: '1.0.0',
    enabled: true,
    
    settings: {
      highlightColor: {
        type: 'color',
        label: 'Highlight Color',
        default: '#6366f1'
      },
      highlightMode: {
        type: 'select',
        label: 'Highlight Mode',
        options: ['hover', 'click', 'both'],
        default: 'hover'
      },
      showBorder: {
        type: 'toggle',
        label: 'Show Border',
        default: true
      },
      borderWidth: {
        type: 'text',
        label: 'Border Width (px)',
        default: '2'
      }
    },
    
    // Store event listeners for cleanup
    listeners: [],
    
    init() {
      console.log('[example-script] Initializing...');
      
      // Get settings
      const color = QoL.store.get(this.id, 'highlightColor', '#6366f1');
      const mode = QoL.store.get(this.id, 'highlightMode', 'hover');
      const showBorder = QoL.store.get(this.id, 'showBorder', true);
      const borderWidth = QoL.store.get(this.id, 'borderWidth', '2');
      
      // Inject custom styles
      this.injectStyles(color, showBorder, borderWidth);
      
      // Setup event listeners based on mode
      if (mode === 'hover' || mode === 'both') {
        this.setupHoverHighlight();
      }
      
      if (mode === 'click' || mode === 'both') {
        this.setupClickHighlight();
      }
      
      // Show success toast
      QoL.ui.showToast('Example script enabled!', 'success');
    },
    
    destroy() {
      console.log('[example-script] Cleaning up...');
      
      // Remove all event listeners
      this.listeners.forEach(({ element, event, handler }) => {
        element.removeEventListener(event, handler);
      });
      this.listeners = [];
      
      // Remove injected styles
      const styleEl = document.getElementById('example-script-styles');
      if (styleEl) {
        styleEl.remove();
      }
      
      // Remove all highlights
      document.querySelectorAll('.qol-highlighted').forEach(el => {
        el.classList.remove('qol-highlighted', 'qol-clicked');
      });
      
      QoL.ui.showToast('Example script disabled', 'info');
    },
    
    injectStyles(color, showBorder, borderWidth) {
      const styles = `
        .qol-highlighted {
          background-color: ${color}20 !important;
          ${showBorder ? `border: ${borderWidth}px solid ${color} !important;` : ''}
          transition: all 0.2s ease !important;
        }
        
        .qol-clicked {
          background-color: ${color}40 !important;
          ${showBorder ? `border: ${borderWidth}px solid ${color} !important;` : ''}
          box-shadow: 0 0 10px ${color}80 !important;
        }
      `;
      
      const styleEl = document.createElement('style');
      styleEl.id = 'example-script-styles';
      styleEl.textContent = styles;
      document.head.appendChild(styleEl);
    },
    
    setupHoverHighlight() {
      const mouseoverHandler = (e) => {
        if (e.target.closest('#qol-toolbar, #qol-modal')) return;
        e.target.classList.add('qol-highlighted');
      };
      
      const mouseoutHandler = (e) => {
        if (!e.target.classList.contains('qol-clicked')) {
          e.target.classList.remove('qol-highlighted');
        }
      };
      
      document.body.addEventListener('mouseover', mouseoverHandler);
      document.body.addEventListener('mouseout', mouseoutHandler);
      
      this.listeners.push(
        { element: document.body, event: 'mouseover', handler: mouseoverHandler },
        { element: document.body, event: 'mouseout', handler: mouseoutHandler }
      );
    },
    
    setupClickHighlight() {
      const clickHandler = (e) => {
        if (e.target.closest('#qol-toolbar, #qol-modal')) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        if (e.target.classList.contains('qol-clicked')) {
          e.target.classList.remove('qol-clicked', 'qol-highlighted');
          QoL.ui.showToast('Highlight removed', 'info');
        } else {
          e.target.classList.add('qol-clicked', 'qol-highlighted');
          QoL.ui.showToast('Element highlighted!', 'success', 1500);
        }
      };
      
      document.body.addEventListener('click', clickHandler, true);
      
      this.listeners.push(
        { element: document.body, event: 'click', handler: clickHandler }
      );
    }
  });
})();
