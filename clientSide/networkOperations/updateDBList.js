const errorNotifier = require('../viewHelpers/errorNotifier');
const actionGenerators = require('../redux/actionGenerators');
const axios = require('axios');
const ErrorMessages = require('../../app/utility/messages').ErrorMessages;

/**
 * Given the server's base url, and the current appState, makes a request to the server for the
 *  database info, and updates the appState. Alerts the errorNotifier if there is an error.
 * @param {String} baseUrl - the base url for the server
 * @param {Object} appState - the current appState
 * @returns {Promise} - the promise to update the appState with the list of databases and the
 *                        current database
 */
module.exports.updateDBList =
  (baseUrl, appState) => axios({
    method: 'get',
    url: `${baseUrl}/databases`,
    responseType: 'json',
  })
  .then((response) => {
    const replaceCurrentDbNameActionGenerator =
      actionGenerators.replaceCurrentDbNameActionGenerator(response.data.currentDbName);
    const replaceDbNamesActionGenerator =
      actionGenerators.replaceDbNamesActionGenerator(response.data.dbNames);
    appState.dispatch(replaceCurrentDbNameActionGenerator);
    appState.dispatch(replaceDbNamesActionGenerator);
  })
  .catch((error) => {
    errorNotifier.alertError(error.response);
  });

/**
 * This listener responds to changes in the appState. Unfortunately with the way that subscriptions
 *  work in Redux, it responds to ALL changes in appState, not just to the database information.
 *  This isn't a problem functionally, it's just slightly inefficient.
 *  @function dbListListener
 */

/**
 * Given the current appState, returns the listener that will subscribe to changes in the appState.
 * @param {Object} appState - the current appState. Must be provided, cannot be falsy.
 * @returns {dbListListener}
 * @throws {Error} Will throw an error if an appState is not provided, or if the appState is falsy.
 */
module.exports.getDbListListener = (appState) => {
  if (!appState) throw new Error(ErrorMessages.INVALID_APP_STATE);
  return () => {
    const dbNames = appState.getState().dbNamesReducer.dbNames;
    const currentDbName = appState.getState().currentDbNameReducer.currentDbName;

    const select = $('#database-select');

    select.empty();

    dbNames.forEach((dbName) => {
      const option = $('<option></option>');

      option.text(dbName);
      option.attr('value', dbName);

      if (dbName === currentDbName) {
        option.prop('selected', true);
      }

      select.append(option);
    });
  };
};
