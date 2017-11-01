const mysql = require('mysql');
const config = require('../../config/config');
const QueryManager = require('./query.manager');
const ErrorFriendlyMessages = require('../utility/messages').ErrorFriendlyMessages;

/**
 * Queries the mySQL database server to get a list of database on the server. If there are any
 *  errors while querying, it sends them to the client.
 * @param {Object} req - the request object of the GET request
 * @param {Object} res - the response object of the GET request
 * @returns {Promise} - the promise for the sending of the results to the client
 */
module.exports.getListOfDatabases = (req, res) => {
  const promise = new Promise((resolve, reject) => {
    const sqlQuery = new QueryManager().getListOfDatabasesQuery();
    const connection = mysql.createConnection(config.db);
    connection.query(sqlQuery,
      (error, results) => {
        connection.end();
        if (error) {
          reject(error);
        }
        const dbNames = results.map(row => row.Database);
        resolve(dbNames);
      });
  });
  return promise.then((dbNames) => {
    res.status(200).send({
      dbNames: dbNames,
      currentDbName: config.dbName,
    });
  })
  .catch((error) => {
    res.status(500).send({
      message: ErrorFriendlyMessages.DATABASE_RETRIEVAL_ERROR,
      stack: error.stack,
    });
  });
};
