/**
 * Dependency loader and cache for shared libraries
 * Prevents duplicate loads across scripts
 */

const DEPS = {
  turndown: 'https://unpkg.com/turndown@7.1.2/dist/turndown.js',
  readability: 'https://unpkg.com/@mozilla/readability@0.5.0/Readability.js'
};

const cache = new Map();

/**
 * Load a library from CDN or return cached version
 * @param {string} name - Library name ('turndown' or 'readability')
 * @returns {Promise<any>} The library constructor/object
 */
export async function load(name) {
  if (cache.has(name)) {
    return cache.get(name);
  }
  
  if (!DEPS[name]) {
    throw new Error(`Unknown dependency: ${name}`);
  }
  
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: 'GET',
      url: DEPS[name],
      onload: (response) => {
        try {
          // Execute the library code and extract the global
          const globalName = name === 'turndown' ? 'TurndownService' : 'Readability';
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

/**
 * Check if a dependency is already loaded
 * @param {string} name - Library name
 * @returns {boolean}
 */
export function isLoaded(name) {
  return cache.has(name);
}

/**
 * Clear the dependency cache (useful for testing)
 */
export function clearCache() {
  cache.clear();
}
