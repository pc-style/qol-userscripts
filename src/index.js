/**
 * QoL Framework - Main Entry Point
 * Unified framework for Quality of Life userscripts
 */

import * as ui from './core/ui.js';
import * as store from './core/store.js';
import * as deps from './core/deps.js';
import * as utils from './core/utils.js';
import { scripts as registeredScripts } from './core/registry.js';
import { injectStyles } from './styles.js';

// Global QoL object
window.QoL = {
  version: '1.0.0',
  scripts: [],
  
  // Core modules
  ui,
  store,
  deps,
  utils,
  
  /**
   * Register a new script with the framework
   * @param {Object} config - Script configuration
   * @param {string} config.id - Unique script identifier
   * @param {string} config.name - Display name
   * @param {string} config.description - Short description
   * @param {string} config.version - Script version
   * @param {boolean} config.enabled - Default enabled state
   * @param {Object} config.settings - Settings schema
   * @param {Function} config.init - Initialization function
   * @param {Function} config.destroy - Cleanup function
   */
  registerScript(config) {
    // Validate required fields
    if (!config.id || !config.name) {
      console.error('[QoL] Script registration failed: id and name are required');
      return;
    }
    
    // Check for duplicate IDs
    if (this.scripts.find(s => s.id === config.id)) {
      console.error(`[QoL] Script with id "${config.id}" already registered`);
      return;
    }
    
    // Set defaults
    const script = {
      enabled: true,
      settings: {},
      version: '1.0.0',
      description: '',
      init: () => {},
      destroy: () => {},
      ...config
    };
    
    this.scripts.push(script);
    console.log(`[QoL] Registered script: ${script.name} v${script.version}`);
    
    // Auto-init if enabled
    const isEnabled = store.get(script.id, 'enabled', script.enabled);
    if (isEnabled && script.init) {
      try {
        script.init();
        console.log(`[QoL] Initialized: ${script.name}`);
      } catch (error) {
        console.error(`[QoL] Failed to initialize ${script.name}:`, error);
        ui.showToast(`Failed to initialize ${script.name}`, 'error');
      }
    }
  },
  
  /**
   * Initialize the framework
   */
  init() {
    console.log(`[QoL] Framework v${this.version} initializing...`);
    
    // Inject styles
    injectStyles();
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this._initUI());
    } else {
      this._initUI();
    }
  },
  
  /**
   * Initialize UI components
   * @private
   */
  _initUI() {
    // Merge registry scripts with dynamically registered scripts
    const allScripts = [...registeredScripts, ...this.scripts];
    
    // Remove duplicates (prefer dynamically registered)
    const uniqueScripts = allScripts.reduce((acc, script) => {
      if (!acc.find(s => s.id === script.id)) {
        acc.push(script);
      }
      return acc;
    }, []);
    
    // Initialize UI
    ui.init(uniqueScripts);
    
    console.log(`[QoL] Framework initialized with ${uniqueScripts.length} scripts`);
  }
};

// Auto-initialize on load
if (typeof GM_info !== 'undefined') {
  // Wait a bit to ensure all scripts can access QoL
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => QoL.init(), 100);
    });
  } else {
    setTimeout(() => QoL.init(), 100);
  }
}

// Export for module usage
export default window.QoL;
