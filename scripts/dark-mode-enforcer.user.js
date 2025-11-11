// ==UserScript==
// @name         🌙 Dark Glassmorphism Theme Enforcer
// @namespace    http://tampermonkey.net/
// @version      1.0.3
// @description  Enforces dark glassmorphism theme on any website with customizable blur and transparency
// @author       QoL Team
// @match        *://*/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addStyle
// @require      https://cdn.jsdelivr.net/gh/pc-style/qol-userscripts@main/dist/qol-framework.user.js
// @run-at       document-idle
// ==/UserScript==

(function() {
  'use strict';
  
  QoL.registerScript({
    id: 'dark-mode-enforcer',
    name: '🌙 Dark Theme Enforcer',
    description: 'Apply dark glassmorphism theme to any website',
    version: '1.0.0',
    enabled: true,
    
    settings: {
      mode: {
        type: 'select',
        label: 'Theme Mode',
        options: ['glassmorphism', 'solid-dark', 'filter-invert'],
        default: 'glassmorphism'
      },
      blurAmount: {
        type: 'text',
        label: 'Blur Amount (px)',
        default: '12'
      },
      backgroundColor: {
        type: 'color',
        label: 'Background Color',
        default: '#0f172a'
      },
      transparency: {
        type: 'text',
        label: 'Transparency (0-1)',
        default: '0.9'
      },
      accentColor: {
        type: 'color',
        label: 'Accent Color',
        default: '#6366f1'
      },
      preserveImages: {
        type: 'toggle',
        label: 'Preserve Images',
        default: true
      },
      smoothTransition: {
        type: 'toggle',
        label: 'Smooth Transitions',
        default: true
      }
    },
    
    styleElement: null,
    observer: null,
    
    init() {
      console.log('[dark-mode-enforcer] Initializing...');
      
      const mode = QoL.store.get(this.id, 'mode', 'glassmorphism');
      
      this.applyTheme();
      this.watchForChanges();
      
      QoL.ui.showToast('Dark theme enforced! 🌙', 'success');
    },
    
    destroy() {
      console.log('[dark-mode-enforcer] Cleaning up...');
      
      if (this.styleElement) {
        this.styleElement.remove();
        this.styleElement = null;
      }
      
      if (this.observer) {
        this.observer.disconnect();
        this.observer = null;
      }
      
      // Remove applied classes
      document.documentElement.classList.remove('qol-dark-enforced');
      
      QoL.ui.showToast('Dark theme disabled', 'info');
    },
    
    applyTheme() {
      const mode = QoL.store.get(this.id, 'mode', 'glassmorphism');
      const blur = QoL.store.get(this.id, 'blurAmount', '12');
      const bgColor = QoL.store.get(this.id, 'backgroundColor', '#0f172a');
      const transparency = QoL.store.get(this.id, 'transparency', '0.9');
      const accentColor = QoL.store.get(this.id, 'accentColor', '#6366f1');
      const preserveImages = QoL.store.get(this.id, 'preserveImages', true);
      const smoothTransition = QoL.store.get(this.id, 'smoothTransition', true);
      
      // Remove old style if exists
      if (this.styleElement) {
        this.styleElement.remove();
      }
      
      let css = '';
      
      if (mode === 'glassmorphism') {
        css = this.getGlassmorphismCSS(blur, bgColor, transparency, accentColor, preserveImages, smoothTransition);
      } else if (mode === 'solid-dark') {
        css = this.getSolidDarkCSS(bgColor, accentColor, preserveImages, smoothTransition);
      } else if (mode === 'filter-invert') {
        css = this.getFilterInvertCSS(preserveImages, smoothTransition);
      }
      
      this.styleElement = document.createElement('style');
      this.styleElement.id = 'qol-dark-enforcer-styles';
      this.styleElement.textContent = css;
      document.head.appendChild(this.styleElement);
      
      document.documentElement.classList.add('qol-dark-enforced');
    },
    
    getGlassmorphismCSS(blur, bgColor, transparency, accentColor, preserveImages, smoothTransition) {
      const transition = smoothTransition ? 'transition: all 0.3s ease !important;' : '';
      const imageFilter = preserveImages ? '' : 'img, video { filter: brightness(0.8) !important; }';
      
      return `
        /* Dark Glassmorphism Theme */
        html.qol-dark-enforced {
          background: ${bgColor} !important;
        }
        
        html.qol-dark-enforced body {
          background: ${bgColor} !important;
          color: #e2e8f0 !important;
          ${transition}
        }
        
        html.qol-dark-enforced * {
          ${transition}
        }
        
        html.qol-dark-enforced div,
        html.qol-dark-enforced section,
        html.qol-dark-enforced article,
        html.qol-dark-enforced aside,
        html.qol-dark-enforced nav,
        html.qol-dark-enforced header,
        html.qol-dark-enforced footer,
        html.qol-dark-enforced main {
          background: rgba(15, 23, 42, ${transparency}) !important;
          backdrop-filter: blur(${blur}px) !important;
          -webkit-backdrop-filter: blur(${blur}px) !important;
          border-color: rgba(148, 163, 184, 0.2) !important;
        }
        
        html.qol-dark-enforced p,
        html.qol-dark-enforced span,
        html.qol-dark-enforced h1,
        html.qol-dark-enforced h2,
        html.qol-dark-enforced h3,
        html.qol-dark-enforced h4,
        html.qol-dark-enforced h5,
        html.qol-dark-enforced h6,
        html.qol-dark-enforced li,
        html.qol-dark-enforced td,
        html.qol-dark-enforced th,
        html.qol-dark-enforced label {
          color: #e2e8f0 !important;
        }
        
        html.qol-dark-enforced a {
          color: ${accentColor} !important;
        }
        
        html.qol-dark-enforced a:hover {
          color: #818cf8 !important;
        }
        
        html.qol-dark-enforced input,
        html.qol-dark-enforced textarea,
        html.qol-dark-enforced select,
        html.qol-dark-enforced button {
          background: rgba(30, 41, 59, 0.8) !important;
          color: #e2e8f0 !important;
          border: 1px solid rgba(148, 163, 184, 0.3) !important;
        }
        
        html.qol-dark-enforced button:hover {
          background: rgba(51, 65, 85, 0.9) !important;
          border-color: ${accentColor} !important;
        }
        
        html.qol-dark-enforced code,
        html.qol-dark-enforced pre {
          background: rgba(15, 23, 42, 0.95) !important;
          color: #94a3b8 !important;
          border: 1px solid rgba(148, 163, 184, 0.2) !important;
        }
        
        html.qol-dark-enforced table {
          border-color: rgba(148, 163, 184, 0.2) !important;
        }
        
        html.qol-dark-enforced tr:hover {
          background: rgba(99, 102, 241, 0.1) !important;
        }
        
        ${imageFilter}
        
        /* Scrollbar */
        html.qol-dark-enforced ::-webkit-scrollbar {
          width: 12px;
          height: 12px;
        }
        
        html.qol-dark-enforced ::-webkit-scrollbar-track {
          background: rgba(30, 41, 59, 0.5);
        }
        
        html.qol-dark-enforced ::-webkit-scrollbar-thumb {
          background: ${accentColor};
          border-radius: 6px;
        }
        
        html.qol-dark-enforced ::-webkit-scrollbar-thumb:hover {
          background: #818cf8;
        }
      `;
    },
    
    getSolidDarkCSS(bgColor, accentColor, preserveImages, smoothTransition) {
      const transition = smoothTransition ? 'transition: all 0.3s ease !important;' : '';
      const imageFilter = preserveImages ? '' : 'img, video { filter: brightness(0.8) !important; }';
      
      return `
        /* Solid Dark Theme */
        html.qol-dark-enforced,
        html.qol-dark-enforced body {
          background: ${bgColor} !important;
          color: #e2e8f0 !important;
          ${transition}
        }
        
        html.qol-dark-enforced * {
          color: #e2e8f0 !important;
          background-color: ${bgColor} !important;
          border-color: rgba(148, 163, 184, 0.3) !important;
          ${transition}
        }
        
        html.qol-dark-enforced a {
          color: ${accentColor} !important;
        }
        
        ${imageFilter}
      `;
    },
    
    getFilterInvertCSS(preserveImages, smoothTransition) {
      const transition = smoothTransition ? 'transition: all 0.3s ease !important;' : '';
      const imageRevert = preserveImages ? 'img, video, picture { filter: invert(1) hue-rotate(180deg) !important; }' : '';
      
      return `
        /* Filter Invert Theme */
        html.qol-dark-enforced {
          filter: invert(1) hue-rotate(180deg) !important;
          ${transition}
        }
        
        ${imageRevert}
      `;
    },
    
    watchForChanges() {
      // Watch for dynamic content changes
      this.observer = new MutationObserver(() => {
        if (!document.documentElement.classList.contains('qol-dark-enforced')) {
          document.documentElement.classList.add('qol-dark-enforced');
        }
      });
      
      this.observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class']
      });
    }
  });
})();
