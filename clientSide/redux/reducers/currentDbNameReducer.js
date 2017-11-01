const contract = require('neat-contract');

/**
 * Generates a new state when the current database name changes.
 * @param {Object} currentState - The current application state.
 * @param {Object} action - The action whose type and data are used to determine a new state.
 * @returns {Object} The new state of the application.
 * @throws {TypeError} Throws a TypeError if currentState is not an Object, and if action does not
 *  have a String property currentDbName
 */
module.exports.currentDbNameReducer = (currentState = { currentDbName: '' }, action) => {
  contract('currentState', Object, currentState);
  switch (action.type) {
    case 'REPLACE_CURRENT_DATABASE_NAME':
      contract('action.currentDbName', String, action.currentDbName);
      return Object.assign({}, currentState, {
        currentDbName: action.currentDbName,
      });
    default:
      return currentState;
  }
};
