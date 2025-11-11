/**
 * UI components: Toolbar, Modal, Toasts
 * All using dark glassmorphism design
 */

import { createElement } from './utils.js';
import * as store from './store.js';

const TOOLBAR_ID = 'qol-toolbar';
const MODAL_ID = 'qol-modal';
const TOAST_CONTAINER_ID = 'qol-toast-container';

let registeredScripts = [];
let toolbar = null;
let modal = null;
let toastContainer = null;

/**
 * Initialize the UI with registered scripts
 * @param {Array} scripts - Array of registered script configs
 */
export function init(scripts) {
  registeredScripts = scripts;
  createToastContainer();
  createToolbar();
  createModal();
}

/**
 * Create the glassmorphic toolbar
 */
function createToolbar() {
  if (toolbar) return;
  
  toolbar = createElement('div', {
    id: TOOLBAR_ID,
    className: 'qol-toolbar',
    style: {
      position: 'fixed',
      bottom: '20px',
      left: '20px',
      zIndex: '999999',
      display: 'flex',
      gap: '8px',
      padding: '12px',
      background: 'rgba(15, 23, 42, 0.9)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(148, 163, 184, 0.35)',
      borderRadius: '14px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    }
  });
  
  // Add settings button
  const settingsBtn = createElement('button', {
    className: 'qol-toolbar-btn qol-settings-btn',
    title: 'QoL Settings',
    onClick: () => openModal()
  }, '⚙️');
  
  toolbar.appendChild(settingsBtn);
  
  // Add script toggle buttons
  registeredScripts.forEach(script => {
    const enabled = store.get(script.id, 'enabled', script.enabled);
    const btn = createElement('button', {
      className: `qol-toolbar-btn ${enabled ? 'active' : ''}`,
      'data-script-id': script.id,
      title: `${script.name}\n${script.description}`,
      onClick: () => toggleScript(script.id)
    }, getScriptIcon(script));
    
    toolbar.appendChild(btn);
  });
  
  document.body.appendChild(toolbar);
}

/**
 * Create the settings modal
 */
function createModal() {
  if (modal) return;
  
  modal = createElement('div', {
    id: MODAL_ID,
    className: 'qol-modal',
    style: {
      display: 'none',
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      zIndex: '1000000',
      background: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(4px)',
    },
    onClick: (e) => {
      if (e.target === modal) closeModal();
    }
  });
  
  const modalContent = createElement('div', {
    className: 'qol-modal-content',
    style: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '90%',
      maxWidth: '800px',
      maxHeight: '80vh',
      overflow: 'auto',
      background: 'rgba(15, 23, 42, 0.95)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(148, 163, 184, 0.35)',
      borderRadius: '18px',
      padding: '24px',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
    }
  });
  
  // Header
  const header = createElement('div', {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px',
      paddingBottom: '16px',
      borderBottom: '1px solid rgba(148, 163, 184, 0.2)',
    }
  });
  
  const title = createElement('h2', {
    style: {
      margin: '0',
      fontSize: '24px',
      fontWeight: '600',
      color: '#f1f5f9',
    }
  }, 'QoL Settings');
  
  const closeBtn = createElement('button', {
    className: 'qol-close-btn',
    onClick: closeModal,
    style: {
      background: 'none',
      border: 'none',
      fontSize: '28px',
      color: '#94a3b8',
      cursor: 'pointer',
      padding: '0',
      width: '32px',
      height: '32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }
  }, '×');
  
  header.appendChild(title);
  header.appendChild(closeBtn);
  modalContent.appendChild(header);
  
  // Script sections
  registeredScripts.forEach(script => {
    const section = createScriptSection(script);
    modalContent.appendChild(section);
  });
  
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
}

/**
 * Create a settings section for a script
 */
function createScriptSection(script) {
  const section = createElement('div', {
    className: 'qol-script-section',
    style: {
      marginBottom: '24px',
      padding: '16px',
      background: 'radial-gradient(circle at top, rgba(148,163,253,0.04), transparent)',
      borderRadius: '12px',
      border: '1px solid rgba(148, 163, 184, 0.15)',
    }
  });
  
  // Script header
  const scriptHeader = createElement('div', {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '12px',
    }
  });
  
  const scriptInfo = createElement('div');
  const scriptName = createElement('h3', {
    style: {
      margin: '0 0 4px 0',
      fontSize: '18px',
      fontWeight: '600',
      color: '#f1f5f9',
    }
  }, script.name);
  
  const scriptDesc = createElement('p', {
    style: {
      margin: '0',
      fontSize: '14px',
      color: '#94a3b8',
    }
  }, script.description);
  
  scriptInfo.appendChild(scriptName);
  scriptInfo.appendChild(scriptDesc);
  
  // Enable toggle
  const enabled = store.get(script.id, 'enabled', script.enabled);
  const toggle = createToggle(script.id, 'enabled', enabled, (value) => {
    store.set(script.id, 'enabled', value);
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
  
  // Settings
  if (script.settings && Object.keys(script.settings).length > 0) {
    const settingsContainer = createElement('div', {
      style: {
        marginTop: '16px',
        paddingTop: '16px',
        borderTop: '1px solid rgba(148, 163, 184, 0.1)',
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

/**
 * Create a setting control based on type
 */
function createSettingControl(scriptId, key, config) {
  const container = createElement('div', {
    style: {
      marginBottom: '16px',
    }
  });
  
  const label = createElement('label', {
    style: {
      display: 'block',
      marginBottom: '8px',
      fontSize: '14px',
      fontWeight: '500',
      color: '#e2e8f0',
    }
  }, config.label || key);
  
  container.appendChild(label);
  
  const currentValue = store.get(scriptId, key, config.default);
  
  let control;
  switch (config.type) {
    case 'toggle':
      control = createToggle(scriptId, key, currentValue);
      break;
    case 'text':
      control = createTextInput(scriptId, key, currentValue);
      break;
    case 'select':
      control = createSelect(scriptId, key, currentValue, config.options);
      break;
    case 'color':
      control = createColorInput(scriptId, key, currentValue);
      break;
    default:
      control = createTextInput(scriptId, key, currentValue);
  }
  
  container.appendChild(control);
  return container;
}

/**
 * Create a toggle switch
 */
function createToggle(scriptId, key, value, onChange) {
  const toggle = createElement('label', {
    className: 'qol-toggle',
    style: {
      position: 'relative',
      display: 'inline-block',
      width: '48px',
      height: '24px',
      cursor: 'pointer',
    }
  });
  
  const input = createElement('input', {
    type: 'checkbox',
    checked: value,
    style: { display: 'none' },
    onChange: (e) => {
      const newValue = e.target.checked;
      store.set(scriptId, key, newValue);
      if (onChange) onChange(newValue);
    }
  });
  
  const slider = createElement('span', {
    style: {
      position: 'absolute',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      background: value ? '#6366f1' : 'rgba(148, 163, 184, 0.3)',
      borderRadius: '24px',
      transition: 'all 0.3s',
    }
  });
  
  const knob = createElement('span', {
    style: {
      position: 'absolute',
      top: '2px',
      left: value ? '26px' : '2px',
      width: '20px',
      height: '20px',
      background: '#fff',
      borderRadius: '50%',
      transition: 'all 0.3s',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
    }
  });
  
  slider.appendChild(knob);
  toggle.appendChild(input);
  toggle.appendChild(slider);
  
  return toggle;
}

/**
 * Create a text input
 */
function createTextInput(scriptId, key, value) {
  return createElement('input', {
    type: 'text',
    value: value || '',
    style: {
      width: '100%',
      padding: '8px 12px',
      background: 'rgba(15, 23, 42, 0.6)',
      border: '1px solid rgba(148, 163, 184, 0.3)',
      borderRadius: '8px',
      color: '#f1f5f9',
      fontSize: '14px',
    },
    onChange: (e) => store.set(scriptId, key, e.target.value)
  });
}

/**
 * Create a select dropdown
 */
function createSelect(scriptId, key, value, options) {
  const select = createElement('select', {
    style: {
      width: '100%',
      padding: '8px 12px',
      background: 'rgba(15, 23, 42, 0.6)',
      border: '1px solid rgba(148, 163, 184, 0.3)',
      borderRadius: '8px',
      color: '#f1f5f9',
      fontSize: '14px',
      cursor: 'pointer',
    },
    onChange: (e) => store.set(scriptId, key, e.target.value)
  });
  
  options.forEach(opt => {
    const option = createElement('option', {
      value: opt,
      selected: opt === value
    }, opt);
    select.appendChild(option);
  });
  
  return select;
}

/**
 * Create a color input
 */
function createColorInput(scriptId, key, value) {
  return createElement('input', {
    type: 'color',
    value: value || '#6366f1',
    style: {
      width: '60px',
      height: '36px',
      border: '1px solid rgba(148, 163, 184, 0.3)',
      borderRadius: '8px',
      cursor: 'pointer',
    },
    onChange: (e) => store.set(scriptId, key, e.target.value)
  });
}

/**
 * Create toast container
 */
function createToastContainer() {
  if (toastContainer) return;
  
  toastContainer = createElement('div', {
    id: TOAST_CONTAINER_ID,
    style: {
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: '1000001',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    }
  });
  
  document.body.appendChild(toastContainer);
}

/**
 * Show a toast notification
 * @param {string} message - Toast message
 * @param {string} type - Toast type: 'info', 'success', 'warning', 'error'
 * @param {number} duration - Duration in ms (default: 3000)
 */
export function showToast(message, type = 'info', duration = 3000) {
  const colors = {
    info: '#6366f1',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
  };
  
  const toast = createElement('div', {
    className: 'qol-toast',
    style: {
      padding: '12px 16px',
      background: 'rgba(15, 23, 42, 0.95)',
      backdropFilter: 'blur(12px)',
      border: `1px solid ${colors[type] || colors.info}`,
      borderRadius: '12px',
      color: '#f1f5f9',
      fontSize: '14px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      minWidth: '200px',
      maxWidth: '400px',
      animation: 'qol-toast-in 0.3s ease',
    }
  }, message);
  
  toastContainer.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'qol-toast-out 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/**
 * Open the settings modal
 */
export function openModal() {
  if (modal) {
    modal.style.display = 'block';
  }
}

/**
 * Close the settings modal
 */
export function closeModal() {
  if (modal) {
    modal.style.display = 'none';
  }
}

/**
 * Toggle a script on/off
 */
function toggleScript(scriptId) {
  const script = registeredScripts.find(s => s.id === scriptId);
  if (!script) return;
  
  const currentState = store.get(scriptId, 'enabled', script.enabled);
  const newState = !currentState;
  
  store.set(scriptId, 'enabled', newState);
  updateToolbarButton(scriptId, newState);
  
  if (newState && script.init) {
    script.init();
    showToast(`${script.name} enabled`, 'success');
  } else if (!newState && script.destroy) {
    script.destroy();
    showToast(`${script.name} disabled`, 'info');
  }
}

/**
 * Update toolbar button state
 */
function updateToolbarButton(scriptId, enabled) {
  if (!toolbar) return;
  
  const btn = toolbar.querySelector(`[data-script-id="${scriptId}"]`);
  if (btn) {
    if (enabled) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  }
}

/**
 * Get icon for script (first emoji or first letter)
 */
function getScriptIcon(script) {
  // Try to extract emoji from name or description
  const emojiMatch = (script.name + script.description).match(/[\p{Emoji}]/u);
  if (emojiMatch) return emojiMatch[0];
  
  // Fallback to first letter
  return script.name.charAt(0).toUpperCase();
}
