const axios = require('axios');
const updateGraph = require('../graphOperations/updateGraph');
const errorNotifier = require('../viewHelpers/errorNotifier');
/**
 * Sends a deletion request to the server to clear the server's database cache and then
 *  updates the graph with the now fresher data.
 * @param {object} container - The container object used as a canvas for drawing.
 * @param {string} baseUrl - The base of the API's URL that the deletion request will hit.
 * @param {object} appState - The application state to pass to updateGraph.
 * @returns {Promise} - A promise for the deletion call that calls updateGraph on success.
 *  If there is an error, it instead alerts the user by executing errorNotifier's alertError.
 */
module.exports.refreshFromDB = (container, baseUrl, appState) =>
  axios({
    method: 'delete',
    url: `${baseUrl}/serverDBCache`,
  }).then(() => {
    updateGraph.updateGraph(container, baseUrl, appState);
  }).catch(() => {
    const error = {};
    error.message = 'Error while refreshing tables information from the database.';
    errorNotifier.alertError(error);
  });
