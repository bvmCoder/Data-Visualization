const networkGenerator = require('./generateGraph');
const errorNotifier = require('../viewHelpers/errorNotifier');
const actionGenerators = require('../redux/actionGenerators');
const axios = require('axios');
/**
 * Updates the allMetadata of the application state with info from the server.
 * @param {object} container - The container object used as a canvas for drawing
 * @param {string} baseUrl - The baseUrl of the api the ajax call will hit
 * @param {object} appState - Redux store of the application state
 * @returns {Promise} A promise to save the response's data or notify about an error.
 *
 */
module.exports.updateGraph = function updateGraph(container, baseUrl, appState) {
  return axios({
    method: 'get',
    url: `${baseUrl}/tables/`,
    responseType: 'json',
  }).then((response) => {
    const replaceMetadataAction =
      actionGenerators.replaceAllMetadataActionGenerator(response.data.cells, response.data.links);
    appState.dispatch(replaceMetadataAction);
    networkGenerator.generateGraph(
      response.data.cells,
      response.data.links,
      container,
      appState);
  }).catch((error) => {
    errorNotifier.alertError(error.response);
  });
};
