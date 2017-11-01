/**
 * Finds tables with names similar to the queryString and tables that contain any columns
 * with a name similar to the query string and passes these names into the callBack function.
 * @param {string} queryString - The text to compare the column and table names to.
 * @param {function} callBack - What to pass the array of suggested table names to.
 * @param (Object) appState - The application's state. It contains the table and column info.
 */

module.exports.autocompleteSearch = (queryString, callBack, appState) => {
  if (queryString === '') {
    callBack([]);
    return;
  }
  const suggestions = new Set();

  // find the names of tables with columns that contain the queryString
  const columnNamesToTableNamesDict =
    appState.getState().allMetadataReducer.columnNamesToTableNamesDict;
  Object.keys(columnNamesToTableNamesDict).forEach((key) => {
    if (key.indexOf(queryString) !== -1) {
      columnNamesToTableNamesDict[key].forEach((tableName) => {
        suggestions.add(tableName);
      });
    }
  });

  // find names of tables with names that contain the queryString
  appState.getState().allMetadataReducer.tableNames.forEach((tableName) => {
    if (tableName.indexOf(queryString) !== -1) {
      suggestions.add(tableName);
    }
  });

  // supply the suggestions to the callback as an array.
  callBack([...suggestions]);
};
