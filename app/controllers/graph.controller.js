const Graph = require('../utility/Graph');
const metadataController = require('./metadata.controller');
const ErrorFriendlyMessages = require('../utility/messages').ErrorFriendlyMessages;
const config = require('../../config/config');

/**
 * @function clientErrorMessageGenerator - generates an error message to send the client.
 * @param {Error} error - the object that contains the information about the error.
 * @param {String} message - what to tell the client about the error that occurred.
 */
const clientErrorMessageGenerator = (error) => {
  let message = ErrorFriendlyMessages.DATABASE_RETRIEVAL_ERROR;
  if (error.code === 'ER_BAD_DB_ERROR') {
    message = error.message.split(':')[1].trim();
  }
  if (error.code === 'ER_ACCESS_DENIED_ERROR') {
    message = error.message.split(':')[1].trim().split('(')[0].trim();
  }
  return message;
};

/**
 * @function getAllGraphData - retrieves the metadata and transforms it into a graph
 *                             sent to the client
 * @param {object} req - an http request
 * @param {object} res - an http response
 */
const getAllGraphData = (req, res) =>
    metadataController.getAllTableMetadata(res.app.locals.dbCache, config.dbName)
    .then((result) => {
      const graph = new Graph(result);
      res.status(200).send(graph);
    })
    .catch((error) => {
      res.status(500).send({
        message: clientErrorMessageGenerator(error),
      });
    });

module.exports.getAllGraphData = getAllGraphData;
