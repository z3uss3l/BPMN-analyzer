/**
 * Helper utilities for BPMN Analyzer Pro
 * Common utility functions used across the application
 */

/**
 * Helper class with static utility methods
 */
export class Helpers {
  /**
   * Read file content
   * @param {File} file - File to read
   * @returns {Promise<string>} File content
   */
  static async readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  }

  /**
   * Download file to user's computer
   * @param {string} filename - Filename
   * @param {string} content - File content
   * @param {string} mimeType - MIME type
   */
  static downloadFile(filename, content, mimeType = 'text/plain') {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Deep clone object
   * @param {*} obj - Object to clone
   * @returns {*} Cloned object
   */
  static deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(item => Helpers.deepClone(item));
    const cloned = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        cloned[key] = Helpers.deepClone(obj[key]);
      }
    }
    return cloned;
  }

  /**
   * Debounce function
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @returns {Function} Debounced function
   */
  static debounce(func, wait) {
    let timeout;
    return function (...args) {
      const context = this;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), wait);
    };
  }

  /**
   * Throttle function
   * @param {Function} func - Function to throttle
   * @param {number} limit - Limit in milliseconds
   * @returns {Function} Throttled function
   */
  static throttle(func, limit) {
    let inThrottle;
    return function (...args) {
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => {
          inThrottle = false;
        }, limit);
      }
    };
  }

  /**
   * Generate unique ID
   * @param {string} prefix - ID prefix
   * @returns {string} Unique ID
   */
  static generateId(prefix = 'id') {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Format file size
   * @param {number} bytes - Size in bytes
   * @returns {string} Formatted size
   */
  static formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Format date
   * @param {Date} date - Date to format
   * @param {string} format - Format string
   * @returns {string} Formatted date
   */
  static formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
    const d = new Date(date);
    const map = {
      'YYYY': d.getFullYear(),
      'MM': String(d.getMonth() + 1).padStart(2, '0'),
      'DD': String(d.getDate()).padStart(2, '0'),
      'HH': String(d.getHours()).padStart(2, '0'),
      'mm': String(d.getMinutes()).padStart(2, '0'),
      'ss': String(d.getSeconds()).padStart(2, '0')
    };
    return format.replace(/YYYY|MM|DD|HH|mm|ss/g, matched => map[matched]);
  }

  /**
   * Validate email
   * @param {string} email - Email to validate
   * @returns {boolean} True if valid
   */
  static isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  /**
   * Validate URL
   * @param {string} url - URL to validate
   * @returns {boolean} True if valid
   */
  static isValidURL(url) {
    try {
      new URL(url);
      return true;
    } catch (_) {
      return false;
    }
  }

  /**
   * Escape HTML
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  static escapeHTML(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  /**
   * Sanitize string
   * @param {string} str - String to sanitize
   * @returns {string} Sanitized string
   */
  static sanitize(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/[^\w\s-]/gi, '').trim();
  }

  /**
   * Capitalize first letter
   * @param {string} str - String to capitalize
   * @returns {string} Capitalized string
   */
  static capitalize(str) {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Convert camelCase to kebab-case
   * @param {string} str - CamelCase string
   * @returns {string} Kebab-case string
   */
  static camelToKebab(str) {
    return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  }

  /**
   * Convert kebab-case to camelCase
   * @param {string} str - Kebab-case string
   * @returns {string} CamelCase string
   */
  static kebabToCamel(str) {
    return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
  }

  /**
   * Get nested object property
   * @param {Object} obj - Object
   * @param {string} path - Property path
   * @param {*} defaultValue - Default value
   * @returns {*} Property value
   */
  static getNestedProperty(obj, path, defaultValue = null) {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj) || defaultValue;
  }

  /**
   * Set nested object property
   * @param {Object} obj - Object
   * @param {string} path - Property path
   * @param {*} value - Value to set
   */
  static setNestedProperty(obj, path, value) {
    const parts = path.split('.');
    const last = parts.pop();
    const target = parts.reduce((acc, part) => {
      if (!acc[part]) acc[part] = {};
      return acc[part];
    }, obj);
    target[last] = value;
  }

  /**
   * Merge objects
   * @param {Object} target - Target object
   * @param {...Object} sources - Source objects
   * @returns {Object} Merged object
   */
  static merge(target, ...sources) {
    sources.forEach(source => {
      for (const key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          if (Helpers.isObject(source[key]) && Helpers.isObject(target[key])) {
            Helpers.merge(target[key], source[key]);
          } else {
            target[key] = source[key];
          }
        }
      }
    });
    return target;
  }

  /**
   * Check if object is empty
   * @param {Object} obj - Object to check
   * @returns {boolean} True if empty
   */
  static isEmpty(obj) {
    return Object.keys(obj).length === 0;
  }

  /**
   * Check if value is null or undefined
   * @param {*} value - Value to check
   * @returns {boolean} True if null or undefined
   */
  static isNullOrUndefined(value) {
    return value === null || value === undefined;
  }

  /**
   * Check if value is a function
   * @param {*} value - Value to check
   * @returns {boolean} True if function
   */
  static isFunction(value) {
    return typeof value === 'function';
  }

  /**
   * Check if value is an object
   * @param {*} value - Value to check
   * @returns {boolean} True if object
   */
  static isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  /**
   * Check if value is an array
   * @param {*} value - Value to check
   * @returns {boolean} True if array
   */
  static isArray(value) {
    return Array.isArray(value);
  }

  /**
   * Create array from iterable
   * @param {*} iterable - Iterable object
   * @returns {Array} Array
   */
  static toArray(iterable) {
    return Array.from(iterable);
  }

  /**
   * Remove duplicates from array
   * @param {Array} array - Array to deduplicate
   * @returns {Array} Deduplicated array
   */
  static unique(array) {
    return [...new Set(array)];
  }

  /**
   * Shuffle array
   * @param {Array} array - Array to shuffle
   * @returns {Array} Shuffled array
   */
  static shuffle(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  /**
   * Get random item from array
   * @param {Array} array - Array
   * @returns {*} Random item
   */
  static random(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * Clamp number between min and max
   * @param {number} value - Value to clamp
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {number} Clamped value
   */
  static clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  /**
   * Generate random number between min and max
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {number} Random number
   */
  static randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  /**
   * Round number to decimal places
   * @param {number} number - Number to round
   * @param {number} decimals - Decimal places
   * @returns {number} Rounded number
   */
  static roundTo(number, decimals) {
    return Number(Math.round(number + 'e' + decimals) + 'e-' + decimals);
  }

  /**
   * Calculate percentage
   * @param {number} value - Value
   * @param {number} total - Total
   * @returns {number} Percentage
   */
  static percentage(value, total) {
    return (value / total) * 100;
  }

  /**
   * Sleep for specified time
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise} Promise
   */
  static sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Retry function
   * @param {Function} fn - Function to retry
   * @param {number} attempts - Number of attempts
   * @param {number} delay - Delay between attempts
   * @returns {Promise} Promise
   */
  static async retry(fn, attempts = 3, delay = 1000) {
    let lastError;
    for (let i = 0; i < attempts; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        if (i < attempts - 1) await Helpers.sleep(delay);
      }
    }
    throw lastError;
  }

  /**
   * Create promise with timeout
   * @param {Promise} promise - Promise to wrap
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise} Promise with timeout
   */
  static withTimeout(promise, timeout) {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Operation timed out')), timeout)
    );
    return Promise.race([promise, timeoutPromise]);
  }
}
