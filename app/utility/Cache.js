const NodeCache = require('node-cache');
/** Class providing caching functionality */
class Cache extends NodeCache {
  /**
   * Create a cache.
   * @param {number} defaultTTL - The default TTL (time to live) in seconds.
   * @param {number} checkPeriod - The checkperiod in seconds.
   */
  constructor(defaultTTL = 100, checkPeriod = 120) {
    super({ stdTTL: defaultTTL, checkperiod: checkPeriod });
  }

  /**
   * Executed on a cache hit.
   * @callback inCacheCallback
   * @param value - The value of the hit key-value pair.
   */

  /**
   * Executed on a cache miss or error.
   * @callback cacheFailureCallback
   * @param [error] - Information on any error that occurred (a cache miss is not an error).
   */

  /**
   * Retrieve the value, if it exists, that corresponds to the key.
   * @param {String|Number} key - Used to determine what value should be retrieved.
   * @param {inCacheCallback} inCacheCB - Called back with the value if
   * a matching, on key, key-value pair exists.
   * @param {cacheFailureCallback} failureCB - Called back with the error if an
   * error occurs or if there is no matching key-value pair.
   */
  get(key, inCacheCB, cacheFailureCB) {
    super.get(key, (err, value) => {
      if (err) {
        cacheFailureCB(err);
        return;
      }
      if (!err && value === undefined) {
        cacheFailureCB();
        return;
      }
      inCacheCB(value);
    });
  }
}

module.exports = Cache;
