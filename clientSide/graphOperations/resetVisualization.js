const networkGenerator = require('../graphOperations/generateGraph');
const errorNotifier = require('../viewHelpers/errorNotifier');
/**
 * Calls generate graph with all the cell and link info stored on the client side.
 * On a failure displays alert to the user.
 * @param container - The container object used as a location for drawing.
 * @param appState - The application's state. It contains the cell and link info.
 */
module.exports.resetVisualization =
  (container, appState) => {
    try {
      networkGenerator.generateGraph(
        appState.getState().allMetadataReducer.cells,
        appState.getState().allMetadataReducer.links,
        container, appState);
    } catch (error) {
      const errorAndSuggestion = 'An error occurred when trying to reset the visualization.\
        Try refreshing from the database as browser data may not exist.';
      errorNotifier.alertError({ message: errorAndSuggestion });
    }
  };
