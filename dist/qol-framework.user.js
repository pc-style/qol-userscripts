// ==UserScript==
// @name         QoL Framework
// @namespace    http://tampermonkey.net/
// @version      1.0.3
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

(() => {
  var __defProp = Object.defineProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // src/core/ui.js
  var ui_exports = {};
  __export(ui_exports, {
    closeModal: () => closeModal,
    init: () => init,
    openModal: () => openModal,
    showToast: () => showToast
  });

  // src/core/utils.js
  var utils_exports = {};
  __export(utils_exports, {
    createElement: () => createElement,
    debounce: () => debounce,
    deepClone: () => deepClone,
    generateId: () => generateId,
    getDomain: () => getDomain,
    isInIframe: () => isInIframe,
    throttle: () => throttle,
    waitForElement: () => waitForElement
  });
  function createElement(tag, attrs = {}, children = []) {
    const el = document.createElement(tag);
    Object.entries(attrs).forEach(([key, value]) => {
      if (key === "className") {
        el.className = value;
      } else if (key === "style" && typeof value === "object") {
        Object.assign(el.style, value);
      } else if (key.startsWith("on") && typeof value === "function") {
        el.addEventListener(key.slice(2).toLowerCase(), value);
      } else {
        el.setAttribute(key, value);
      }
    });
    const childArray = Array.isArray(children) ? children : [children];
    childArray.forEach((child) => {
      if (typeof child === "string") {
        el.appendChild(document.createTextNode(child));
      } else if (child instanceof Node) {
        el.appendChild(child);
      }
    });
    return el;
  }
  function waitForElement(selector, timeout = 5e3) {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(selector);
      if (existing) {
        resolve(existing);
        return;
      }
      const observer = new MutationObserver(() => {
        const element = document.querySelector(selector);
        if (element) {
          observer.disconnect();
          clearTimeout(timer);
          resolve(element);
        }
      });
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
      const timer = setTimeout(() => {
        observer.disconnect();
        reject(new Error(`Element ${selector} not found within ${timeout}ms`));
      }, timeout);
    });
  }
  function debounce(fn, delay = 300) {
    let timeoutId;
    return function(...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
  }
  function throttle(fn, limit = 300) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        fn.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
  function generateId() {
    return `qol_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  function deepClone(obj) {
    if (obj === null || typeof obj !== "object")
      return obj;
    if (obj instanceof Date)
      return new Date(obj);
    if (obj instanceof Array)
      return obj.map((item) => deepClone(item));
    if (obj instanceof Object) {
      return Object.fromEntries(
        Object.entries(obj).map(([key, value]) => [key, deepClone(value)])
      );
    }
  }
  function isInIframe() {
    return window.self !== window.top;
  }
  function getDomain(url = window.location.href) {
    try {
      return new URL(url).hostname;
    } catch {
      return "";
    }
  }

  // src/core/store.js
  var store_exports = {};
  __export(store_exports, {
    clear: () => clear,
    get: () => get,
    getKeys: () => getKeys,
    remove: () => remove,
    set: () => set
  });
  var STORAGE_PREFIX = "qol_";
  function get(scriptId, key, defaultValue = null) {
    const storageKey = `${STORAGE_PREFIX}${scriptId}_${key}`;
    const value = GM_getValue(storageKey, defaultValue);
    if (typeof value === "string") {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  }
  function set(scriptId, key, value) {
    const storageKey = `${STORAGE_PREFIX}${scriptId}_${key}`;
    const storageValue = typeof value === "object" ? JSON.stringify(value) : value;
    GM_setValue(storageKey, storageValue);
  }
  function remove(scriptId, key) {
    const storageKey = `${STORAGE_PREFIX}${scriptId}_${key}`;
    GM_deleteValue(storageKey);
  }
  function getKeys(scriptId) {
    const prefix = `${STORAGE_PREFIX}${scriptId}_`;
    const allKeys = GM_listValues();
    return allKeys.filter((key) => key.startsWith(prefix)).map((key) => key.slice(prefix.length));
  }
  function clear(scriptId) {
    const keys = getKeys(scriptId);
    keys.forEach((key) => remove(scriptId, key));
  }

  // src/core/ui.js
  var TOOLBAR_ID = "qol-toolbar";
  var MODAL_ID = "qol-modal";
  var TOAST_CONTAINER_ID = "qol-toast-container";
  var registeredScripts = [];
  var toolbar = null;
  var modal = null;
  var toastContainer = null;
  function init(scripts2) {
    registeredScripts = scripts2;
    createToastContainer();
    createToolbar();
    createModal();
  }
  function createToolbar() {
    if (toolbar)
      return;
    toolbar = createElement("div", {
      id: TOOLBAR_ID,
      className: "qol-toolbar",
      style: {
        position: "fixed",
        bottom: "20px",
        left: "20px",
        zIndex: "999999",
        display: "flex",
        gap: "8px",
        padding: "12px",
        background: "rgba(15, 23, 42, 0.9)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(148, 163, 184, 0.35)",
        borderRadius: "14px",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)"
      }
    });
    const settingsBtn = createElement("button", {
      className: "qol-toolbar-btn qol-settings-btn",
      title: "QoL Settings",
      onClick: () => openModal()
    }, "\u2699\uFE0F");
    toolbar.appendChild(settingsBtn);
    registeredScripts.forEach((script) => {
      const enabled = get(script.id, "enabled", script.enabled);
      const btn = createElement("button", {
        className: `qol-toolbar-btn ${enabled ? "active" : ""}`,
        "data-script-id": script.id,
        title: `${script.name}
${script.description}`,
        onClick: () => toggleScript(script.id)
      }, getScriptIcon(script));
      toolbar.appendChild(btn);
    });
    document.body.appendChild(toolbar);
  }
  function createModal() {
    if (modal)
      return;
    modal = createElement("div", {
      id: MODAL_ID,
      className: "qol-modal",
      style: {
        display: "none",
        position: "fixed",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        zIndex: "1000000",
        background: "rgba(0, 0, 0, 0.7)",
        backdropFilter: "blur(4px)"
      },
      onClick: (e) => {
        if (e.target === modal)
          closeModal();
      }
    });
    const modalContent = createElement("div", {
      className: "qol-modal-content",
      style: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "90%",
        maxWidth: "800px",
        maxHeight: "80vh",
        overflow: "auto",
        background: "rgba(15, 23, 42, 0.95)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(148, 163, 184, 0.35)",
        borderRadius: "18px",
        padding: "24px",
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)"
      }
    });
    const header = createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "24px",
        paddingBottom: "16px",
        borderBottom: "1px solid rgba(148, 163, 184, 0.2)"
      }
    });
    const title = createElement("h2", {
      style: {
        margin: "0",
        fontSize: "24px",
        fontWeight: "600",
        color: "#f1f5f9"
      }
    }, "QoL Settings");
    const closeBtn = createElement("button", {
      className: "qol-close-btn",
      onClick: closeModal,
      style: {
        background: "none",
        border: "none",
        fontSize: "28px",
        color: "#94a3b8",
        cursor: "pointer",
        padding: "0",
        width: "32px",
        height: "32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }
    }, "\xD7");
    header.appendChild(title);
    header.appendChild(closeBtn);
    modalContent.appendChild(header);
    registeredScripts.forEach((script) => {
      const section = createScriptSection(script);
      modalContent.appendChild(section);
    });
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
  }
  function createScriptSection(script) {
    const section = createElement("div", {
      className: "qol-script-section",
      style: {
        marginBottom: "24px",
        padding: "16px",
        background: "radial-gradient(circle at top, rgba(148,163,253,0.04), transparent)",
        borderRadius: "12px",
        border: "1px solid rgba(148, 163, 184, 0.15)"
      }
    });
    const scriptHeader = createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "12px"
      }
    });
    const scriptInfo = createElement("div");
    const scriptName = createElement("h3", {
      style: {
        margin: "0 0 4px 0",
        fontSize: "18px",
        fontWeight: "600",
        color: "#f1f5f9"
      }
    }, script.name);
    const scriptDesc = createElement("p", {
      style: {
        margin: "0",
        fontSize: "14px",
        color: "#94a3b8"
      }
    }, script.description);
    scriptInfo.appendChild(scriptName);
    scriptInfo.appendChild(scriptDesc);
    const enabled = get(script.id, "enabled", script.enabled);
    const toggle = createToggle(script.id, "enabled", enabled, (value) => {
      set(script.id, "enabled", value);
      updateToolbarButton(script.id, value);
      if (value && script.init) {
        script.init();
      } else if (!value && script.destroy) {
        script.destroy();
      }
    });
    scriptHeader.appendChild(scriptInfo);
    scriptHeader.appendChild(toggle);
    section.appendChild(scriptHeader);
    if (script.settings && Object.keys(script.settings).length > 0) {
      const settingsContainer = createElement("div", {
        style: {
          marginTop: "16px",
          paddingTop: "16px",
          borderTop: "1px solid rgba(148, 163, 184, 0.1)"
        }
      });
      Object.entries(script.settings).forEach(([key, config]) => {
        const control = createSettingControl(script.id, key, config);
        settingsContainer.appendChild(control);
      });
      section.appendChild(settingsContainer);
    }
    return section;
  }
  function createSettingControl(scriptId, key, config) {
    const container = createElement("div", {
      style: {
        marginBottom: "16px"
      }
    });
    const label = createElement("label", {
      style: {
        display: "block",
        marginBottom: "8px",
        fontSize: "14px",
        fontWeight: "500",
        color: "#e2e8f0"
      }
    }, config.label || key);
    container.appendChild(label);
    const currentValue = get(scriptId, key, config.default);
    let control;
    switch (config.type) {
      case "toggle":
        control = createToggle(scriptId, key, currentValue);
        break;
      case "text":
        control = createTextInput(scriptId, key, currentValue);
        break;
      case "select":
        control = createSelect(scriptId, key, currentValue, config.options);
        break;
      case "color":
        control = createColorInput(scriptId, key, currentValue);
        break;
      default:
        control = createTextInput(scriptId, key, currentValue);
    }
    container.appendChild(control);
    return container;
  }
  function createToggle(scriptId, key, value, onChange) {
    const toggle = createElement("label", {
      className: "qol-toggle",
      style: {
        position: "relative",
        display: "inline-block",
        width: "48px",
        height: "24px",
        cursor: "pointer"
      }
    });
    const input = createElement("input", {
      type: "checkbox",
      checked: value,
      style: { display: "none" },
      onChange: (e) => {
        const newValue = e.target.checked;
        set(scriptId, key, newValue);
        if (onChange)
          onChange(newValue);
      }
    });
    const slider = createElement("span", {
      style: {
        position: "absolute",
        top: "0",
        left: "0",
        right: "0",
        bottom: "0",
        background: value ? "#6366f1" : "rgba(148, 163, 184, 0.3)",
        borderRadius: "24px",
        transition: "all 0.3s"
      }
    });
    const knob = createElement("span", {
      style: {
        position: "absolute",
        top: "2px",
        left: value ? "26px" : "2px",
        width: "20px",
        height: "20px",
        background: "#fff",
        borderRadius: "50%",
        transition: "all 0.3s",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)"
      }
    });
    slider.appendChild(knob);
    toggle.appendChild(input);
    toggle.appendChild(slider);
    return toggle;
  }
  function createTextInput(scriptId, key, value) {
    return createElement("input", {
      type: "text",
      value: value || "",
      style: {
        width: "100%",
        padding: "8px 12px",
        background: "rgba(15, 23, 42, 0.6)",
        border: "1px solid rgba(148, 163, 184, 0.3)",
        borderRadius: "8px",
        color: "#f1f5f9",
        fontSize: "14px"
      },
      onChange: (e) => set(scriptId, key, e.target.value)
    });
  }
  function createSelect(scriptId, key, value, options) {
    const select = createElement("select", {
      style: {
        width: "100%",
        padding: "8px 12px",
        background: "rgba(15, 23, 42, 0.6)",
        border: "1px solid rgba(148, 163, 184, 0.3)",
        borderRadius: "8px",
        color: "#f1f5f9",
        fontSize: "14px",
        cursor: "pointer"
      },
      onChange: (e) => set(scriptId, key, e.target.value)
    });
    options.forEach((opt) => {
      const option = createElement("option", {
        value: opt,
        selected: opt === value
      }, opt);
      select.appendChild(option);
    });
    return select;
  }
  function createColorInput(scriptId, key, value) {
    return createElement("input", {
      type: "color",
      value: value || "#6366f1",
      style: {
        width: "60px",
        height: "36px",
        border: "1px solid rgba(148, 163, 184, 0.3)",
        borderRadius: "8px",
        cursor: "pointer"
      },
      onChange: (e) => set(scriptId, key, e.target.value)
    });
  }
  function createToastContainer() {
    if (toastContainer)
      return;
    toastContainer = createElement("div", {
      id: TOAST_CONTAINER_ID,
      style: {
        position: "fixed",
        top: "20px",
        right: "20px",
        zIndex: "1000001",
        display: "flex",
        flexDirection: "column",
        gap: "12px"
      }
    });
    document.body.appendChild(toastContainer);
  }
  function showToast(message, type = "info", duration = 3e3) {
    const colors = {
      info: "#6366f1",
      success: "#10b981",
      warning: "#f59e0b",
      error: "#ef4444"
    };
    const toast = createElement("div", {
      className: "qol-toast",
      style: {
        padding: "12px 16px",
        background: "rgba(15, 23, 42, 0.95)",
        backdropFilter: "blur(12px)",
        border: `1px solid ${colors[type] || colors.info}`,
        borderRadius: "12px",
        color: "#f1f5f9",
        fontSize: "14px",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
        minWidth: "200px",
        maxWidth: "400px",
        animation: "qol-toast-in 0.3s ease"
      }
    }, message);
    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.animation = "qol-toast-out 0.3s ease";
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
  function openModal() {
    if (modal) {
      modal.style.display = "block";
    }
  }
  function closeModal() {
    if (modal) {
      modal.style.display = "none";
    }
  }
  function toggleScript(scriptId) {
    const script = registeredScripts.find((s) => s.id === scriptId);
    if (!script)
      return;
    const currentState = get(scriptId, "enabled", script.enabled);
    const newState = !currentState;
    set(scriptId, "enabled", newState);
    updateToolbarButton(scriptId, newState);
    if (newState && script.init) {
      script.init();
      showToast(`${script.name} enabled`, "success");
    } else if (!newState && script.destroy) {
      script.destroy();
      showToast(`${script.name} disabled`, "info");
    }
  }
  function updateToolbarButton(scriptId, enabled) {
    if (!toolbar)
      return;
    const btn = toolbar.querySelector(`[data-script-id="${scriptId}"]`);
    if (btn) {
      if (enabled) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    }
  }
  function getScriptIcon(script) {
    const emojiMatch = (script.name + script.description).match(/[\p{Emoji}]/u);
    if (emojiMatch)
      return emojiMatch[0];
    return script.name.charAt(0).toUpperCase();
  }

  // src/core/deps.js
  var deps_exports = {};
  __export(deps_exports, {
    clearCache: () => clearCache,
    isLoaded: () => isLoaded,
    load: () => load
  });
  var DEPS = {
    turndown: "https://unpkg.com/turndown@7.1.2/dist/turndown.js",
    readability: "https://unpkg.com/@mozilla/readability@0.5.0/Readability.js"
  };
  var cache = /* @__PURE__ */ new Map();
  async function load(name) {
    if (cache.has(name)) {
      return cache.get(name);
    }
    if (!DEPS[name]) {
      throw new Error(`Unknown dependency: ${name}`);
    }
    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        method: "GET",
        url: DEPS[name],
        onload: (response) => {
          try {
            const globalName = name === "turndown" ? "TurndownService" : "Readability";
            const script = new Function(response.responseText + `; return ${globalName};`);
            const lib = script();
            cache.set(name, lib);
            resolve(lib);
          } catch (error) {
            reject(new Error(`Failed to load ${name}: ${error.message}`));
          }
        },
        onerror: (error) => {
          reject(new Error(`Network error loading ${name}: ${error}`));
        }
      });
    });
  }
  function isLoaded(name) {
    return cache.has(name);
  }
  function clearCache() {
    cache.clear();
  }

  // src/core/registry.js
  var scripts = [
    {
      "id": "page-to-markdown",
      "name": "\u{1F4DD} Page to Markdown",
      "description": "Convert page content to Markdown with element selector",
      "version": "1.0.0",
      "enabled": true,
      "file": "page-to-markdown.user.js"
    },
    {
      "id": "dark-mode-enforcer",
      "name": "\u{1F319} Dark Theme Enforcer",
      "description": "Apply dark glassmorphism theme to any website",
      "version": "1.0.0",
      "enabled": true,
      "file": "dark-mode-enforcer.user.js"
    }
  ];

  // src/styles.js
  var styles = `
/* QoL Framework Styles */
.qol-toolbar-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: rgba(30, 41, 59, 0.6);
  color: #94a3b8;
  font-size: 18px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qol-toolbar-btn:hover {
  background: rgba(51, 65, 85, 0.8);
  color: #e2e8f0;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.qol-toolbar-btn.active {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.4);
}

.qol-settings-btn {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2)) !important;
  border: 1px solid rgba(99, 102, 241, 0.3);
}

.qol-settings-btn:hover {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.4), rgba(139, 92, 246, 0.4)) !important;
}

.qol-modal-content::-webkit-scrollbar {
  width: 8px;
}

.qol-modal-content::-webkit-scrollbar-track {
  background: rgba(30, 41, 59, 0.3);
  border-radius: 4px;
}

.qol-modal-content::-webkit-scrollbar-thumb {
  background: rgba(99, 102, 241, 0.5);
  border-radius: 4px;
}

.qol-modal-content::-webkit-scrollbar-thumb:hover {
  background: rgba(99, 102, 241, 0.7);
}

.qol-close-btn:hover {
  color: #f1f5f9 !important;
  transform: rotate(90deg);
  transition: all 0.3s ease;
}

.qol-toggle input:checked + span {
  background: #6366f1 !important;
}

.qol-toggle input:checked + span span {
  left: 26px !important;
}

input[type="text"]:focus,
select:focus {
  outline: none;
  border-color: #6366f1 !important;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

@keyframes qol-toast-in {
  from {
    opacity: 0;
    transform: translateX(100px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes qol-toast-out {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(100px);
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .qol-toolbar {
    bottom: 10px !important;
    left: 10px !important;
    padding: 8px !important;
    gap: 6px !important;
  }
  
  .qol-toolbar-btn {
    width: 36px !important;
    height: 36px !important;
    font-size: 16px !important;
  }
  
  .qol-modal-content {
    width: 95% !important;
    padding: 16px !important;
  }
}
`;
  function injectStyles() {
    if (document.getElementById("qol-styles"))
      return;
    if (typeof GM_addStyle !== "undefined") {
      GM_addStyle(styles);
    } else {
      const styleEl = document.createElement("style");
      styleEl.id = "qol-styles";
      styleEl.textContent = styles;
      document.head.appendChild(styleEl);
    }
  }

  // src/index.js
  window.QoL = {
    version: "1.0.0",
    scripts: [],
    // Core modules
    ui: ui_exports,
    store: store_exports,
    deps: deps_exports,
    utils: utils_exports,
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
      if (!config.id || !config.name) {
        console.error("[QoL] Script registration failed: id and name are required");
        return;
      }
      if (this.scripts.find((s) => s.id === config.id)) {
        console.error(`[QoL] Script with id "${config.id}" already registered`);
        return;
      }
      const script = {
        enabled: true,
        settings: {},
        version: "1.0.0",
        description: "",
        init: () => {
        },
        destroy: () => {
        },
        ...config
      };
      this.scripts.push(script);
      console.log(`[QoL] Registered script: ${script.name} v${script.version}`);
      const isEnabled = get(script.id, "enabled", script.enabled);
      if (isEnabled && script.init) {
        try {
          script.init();
          console.log(`[QoL] Initialized: ${script.name}`);
        } catch (error) {
          console.error(`[QoL] Failed to initialize ${script.name}:`, error);
          showToast(`Failed to initialize ${script.name}`, "error");
        }
      }
    },
    /**
     * Initialize the framework
     */
    init() {
      console.log(`[QoL] Framework v${this.version} initializing...`);
      injectStyles();
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => this._initUI());
      } else {
        this._initUI();
      }
    },
    /**
     * Initialize UI components
     * @private
     */
    _initUI() {
      const allScripts = [...scripts, ...this.scripts];
      const uniqueScripts = allScripts.reduce((acc, script) => {
        if (!acc.find((s) => s.id === script.id)) {
          acc.push(script);
        }
        return acc;
      }, []);
      init(uniqueScripts);
      console.log(`[QoL] Framework initialized with ${uniqueScripts.length} scripts`);
    }
  };
  if (typeof GM_info !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        setTimeout(() => QoL.init(), 100);
      });
    } else {
      setTimeout(() => QoL.init(), 100);
    }
  }
  var src_default = window.QoL;
})();
//# sourceMappingURL=qol-framework.user.js.map
