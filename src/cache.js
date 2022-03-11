import logger from './logger';

/**
 * @description A module to handle caching data from Webex SDK.
 * @see {@link https://www.youtube.com/watch?v=ZrtSOTGNqA8}
 *
 * @module CacheMeOutside No-pun intented
 * @returns {CacheMeOutside}
 */
class CacheMeOutside {
  constructor() {
    this.store = new Map();
    logger.debug('CacheMeOutside', null, 'init()', []);
  }

  /**
   * Cache data or update and existing record.
   *
   * @param {string} key Unique key identifying the cache
   * @param {object} value Cached value
   * @returns {CacheMeOutside} Returns instance of caching module
   */
  set(key, value) {
    logger.debug('CacheMeOutside', null, 'set()', [key]);

    return this.store.set(key, value);
  }

  /**
   * Get cached value. Returns cached value (or undefined)
   *
   * @param {string} key Key identifying the cache
   * @returns {object} Cached value
   */
  get(key) {
    logger.debug('CacheMeOutside', null, 'get()', [key]);

    return this.store.get(key);
  }

  /**
   * Check for cached key.
   *
   * @param {string} key Key identifying the cache
   * @returns {boolean} Returns true/false if key exists
   */
  has(key) {
    return this.store.has(key);
  }

  /**
   * Removes key from cache.
   *
   * @param {string} key Key identifying the cache
   * @returns {boolean} Returns true/false if key removed
   */
  remove(key) {
    return this.store.delete(key);
  }

  /**
   * Returns array of all values in cache
   *
   * @returns {Array} Array of values
   */
  values() {
    return this.store.values();
  }

  /**
   * Returns the number of keys in the cache
   *
   * @returns {number} Size of cache
   */
  size() {
    return this.store.size;
  }

  /**
   * Returns array of all keys in cache
   *
   * @returns {Array} Array of keys
   */
  keys() {
    return this.store.keys();
  }

  /**
   * I take an array of SDK conversations and cache them.
   *
   * @param {Array} conversations Array of sdk server rooms
   */
  cacheConversations(conversations) {
    logger.debug('CacheMeOutside', 'cacheConversations()', conversations.length, []);

    conversations.map((o) => this.set(o.id, o));
  }

  /**
   * I take an array of server activities and cache them.
   *
   * @param {Array} activities Array of sdk server activities
   */
  cachActivities(activities) {
    logger.debug('CacheMeOutside', 'cachActivities()', activities.length, []);

    activities.map((o) => this.set(o.id, o));
  }

  /**
   * I take an array of SDK activities and convert them into adapter activities.
   *
   * @param {Array} sdkActivities Array of sdk server activities
   */
  cachSDKActivities(sdkActivities) {
    logger.debug('CacheMeOutside', 'cachSDKActivities()', sdkActivities.length, []);

    sdkActivities.map((o) => this.set(o.id, o));
  }
}

const singleton = new CacheMeOutside();

export default singleton;
