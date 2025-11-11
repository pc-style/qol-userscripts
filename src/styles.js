/**
 * Dark glassmorphism CSS styles for QoL framework
 */

export const styles = `
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

/**
 * Inject styles into the page
 */
export function injectStyles() {
  if (document.getElementById('qol-styles')) return;
  
  // Use GM_addStyle if available (bypasses CSP)
  if (typeof GM_addStyle !== 'undefined') {
    GM_addStyle(styles);
  } else {
    // Fallback to style element
    const styleEl = document.createElement('style');
    styleEl.id = 'qol-styles';
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);
  }
}
