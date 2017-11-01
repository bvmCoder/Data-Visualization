const contract = require('neat-contract');

/**
 * Generates a new state when the list of database names changes.
 * @param {Object} currentState - The current application state.
 * @param {Object} action - The action whose type and data are used to determine a new state.
 * @returns {Object} The new state of the application.
 * @throws {TypeError} Throws a TypeError if currentState is not an Object, and if action does not
 *  have an Array property dbNames
 */
module.exports.dbNamesReducer = (currentState = { dbNames: [] }, action) => {
  contract('currentState', Object, currentState);
  switch (action.type) {
    case 'REPLACE_DATABASE_NAMES':
      contract('action.dbNames', Array, action.dbNames);
      return Object.assign({}, currentState, {
        dbNames: action.dbNames,
      });
    default:
      return currentState;
  }
};
