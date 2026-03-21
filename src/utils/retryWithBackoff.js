import logger from '../config/logger.js';

/**
 * Retries an async function with exponential backoff.
 *
 * @param {Function} fn         - Async function to execute
 * @param {number} maxRetries   - Maximum attempts (default 3)
 * @param {number} baseDelayMs  - Initial delay in ms (default 1000)
 * @returns {Promise<*>}
 */
export const retryWithBackoff = async (fn, maxRetries = 3, baseDelayMs = 1000) => {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt === maxRetries) break;

      const delay = baseDelayMs * Math.pow(2, attempt - 1);
      logger.warn(`Retry ${attempt}/${maxRetries} failed, next attempt in ${delay}ms: ${err.message}`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  throw lastError;
};
