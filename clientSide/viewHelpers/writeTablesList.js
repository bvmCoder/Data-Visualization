const _ = require('lodash');
const errorNotifier = require('./errorNotifier');

/**
 * Shows a modal with a list of the database's tables' names, or if there are no tables
 * a message that reflects that fact. If an error occurs the error notifier's alert error
 * function is called.
 * @param appState - The application's state with the tableNames data.
 * @param tableModalIdentifier - The identifier for a modal with a list to add the names
 *  of tables to.
 */

module.exports.writeTablesList = (appState, tableModalIdentifier) => {
  try {
    $(`${tableModalIdentifier} ul`).empty();
    $(`${tableModalIdentifier} .modal-body p`).remove();
    const tableNames = appState.getState().allMetadataReducer.tableNames;
    if (tableNames.length === 0) {
      $(`${tableModalIdentifier} .modal-body`)
        .prepend('<p>The database has no tables.</p>');
    } else {
      _.cloneDeep(tableNames).sort().forEach((tableName) => {
        $(`${tableModalIdentifier} ul`).append(`<li>${tableName}</li>`);
      });
    }
    $(tableModalIdentifier).modal('show');
  } catch (error) {
    const errorAndSuggestion = 'An error occurred when trying to list the database\'s tables.\
      Try refreshing from the database as browser data may not exist.';
    errorNotifier.alertError({ message: errorAndSuggestion });
  }
};
