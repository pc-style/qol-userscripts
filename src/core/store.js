/**
 * Namespaced storage per script using GM_getValue/GM_setValue
 * Provides a simple key-value store with script isolation
 */

const STORAGE_PREFIX = 'qol_';

/**
 * Get a value from storage for a specific script
 * @param {string} scriptId - Script identifier
 * @param {string} key - Storage key
 * @param {any} defaultValue - Default value if key doesn't exist
 * @returns {any}
 */
export function get(scriptId, key, defaultValue = null) {
  const storageKey = `${STORAGE_PREFIX}${scriptId}_${key}`;
  const value = GM_getValue(storageKey, defaultValue);
  
  // Try to parse JSON if it's a string
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  
  return value;
}

/**
 * Set a value in storage for a specific script
 * @param {string} scriptId - Script identifier
 * @param {string} key - Storage key
 * @param {any} value - Value to store
 */
export function set(scriptId, key, value) {
  const storageKey = `${STORAGE_PREFIX}${scriptId}_${key}`;
  
  // Stringify objects and arrays
  const storageValue = typeof value === 'object' ? JSON.stringify(value) : value;
  
  GM_setValue(storageKey, storageValue);
}

/**
 * Delete a value from storage
 * @param {string} scriptId - Script identifier
 * @param {string} key - Storage key
 */
export function remove(scriptId, key) {
  const storageKey = `${STORAGE_PREFIX}${scriptId}_${key}`;
  GM_deleteValue(storageKey);
}

/**
 * Get all keys for a specific script
 * @param {string} scriptId - Script identifier
 * @returns {string[]}
 */
export function getKeys(scriptId) {
  const prefix = `${STORAGE_PREFIX}${scriptId}_`;
  const allKeys = GM_listValues();
  
  return allKeys
    .filter(key => key.startsWith(prefix))
    .map(key => key.slice(prefix.length));
}

/**
 * Clear all storage for a specific script
 * @param {string} scriptId - Script identifier
 */
export function clear(scriptId) {
  const keys = getKeys(scriptId);
  keys.forEach(key => remove(scriptId, key));
}
