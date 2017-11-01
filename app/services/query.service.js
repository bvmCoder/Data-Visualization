const mysql = require('mysql');
const config = require('../../config/config');
const ErrorMessages = require('../utility/messages').ErrorMessages;

/**
 * Given a mySQL query and a cache object, checks the cache for the results of the query. If the
 * results have already been cached, returns the cached results. If the results have not already
 * been cached, queries the database, caches the results, and returns the results.
 * @param {String} sqlQuery - the query to run. Must be provided and cannot be falsy.
 * @param {Object} cache - the cache object. Must be provided and cannot be falsy.
 * @returns {Promise<Object, Error>} - A Promise that resolves with the MySQL query results. Is
 *  rejected with an error if sqlQuery or cache are not provided or are falsy, or if there is an
 *  error with the query.
 */
module.exports.runQuery = (sqlQuery, cache) =>
  new Promise((resolve, reject) => {
    if (!sqlQuery) return reject(new Error(ErrorMessages.INVALID_OR_MISSING_QUERY_ARGUMENT));
    if (!cache) return reject(new Error(ErrorMessages.INVALID_OR_MISSING_CACHE_ARGUMENT));
    return cache.get(sqlQuery,
      results => resolve(results),
      () => {
        const connection = mysql.createConnection(config.db);
        return connection.query(sqlQuery,
          (error, results) => {
            connection.end();
            if (error) {
              return reject(error);
            }
            cache.set(sqlQuery, results);
            return resolve(results);
          });
      });
  });
