const contract = require('neat-contract');
/**
 * Generates a dictionary that maps column names to an array of table names of
 * tables that contain columns with that column name. It skips columns that have
 * a colon, because the column descriptions should come in a "NAME : TYPE" string
 * format. Thus, if they don't have a colon it is not possible to determine what
 * part of the string is the name and what is the type.
 * @param {Array[Object]} cells - The cells the table relationship graph.
 * @returns {Object} columnNameDict - A mapping of column names to the names of tables
 * that contain columns with those column names.
 */
function columnNamesToTableNamesDictGenerator(cells) {
  const columnNameDict = {};
  cells.forEach((cell) => {
    cell.columns.forEach((column) => {
      if (column.indexOf(':') !== -1) {
        const columnName = column.substring(0, column.indexOf(':')).split(' ')[0];
        if (columnNameDict[columnName]) {
          columnNameDict[columnName].push(cell.tableName);
        } else {
          columnNameDict[columnName] = [cell.tableName];
        }
      }
    });
  });
  return columnNameDict;
}

/**
 * Generates a new state when the allMetadata (the cached metadata on the server) changes.
 * Will throw an error if current state is not an object or if action.cells and action.links
 * are not arrays.
 * @param {object} currentState - The current application state.
 * @param {object} action - The action whose type and data are used to determine a new state.
 * @returns {object} The new state of the application.
 */
function allMetadataReducer(
  currentState = {
    cells: [],
    links: [],
    columnNamesToTableNamesDict: [],
    tableNames: [],
  }, action) {
  contract('currentState', Object, currentState);
  switch (action.type) {
    case 'REPLACE_ALL_METADATA':
      contract('action.cells', Array, action.cells);
      contract('action.links', Array, action.links);
      return Object.assign({}, currentState, {
        cells: action.cells,
        links: action.links,
        columnNamesToTableNamesDict: columnNamesToTableNamesDictGenerator(action.cells),
        tableNames: action.cells.map(cell => cell.tableName),
      });
    default:
      return currentState;
  }
}

/**
 * Generates a new state when the displayedMetadata changes.
 * Will throw a type error if current state is not an object or if action.cells and action.links
 * are not arrays.
 * @param {object} currentState - The current application state.
 * @param {object} action - The action whose type and data are used to determine a new state.
 * @returns {object} The new state of the application.
 */
function displayedMetadataReducer(currentState = { cells: [], links: [], tableNames: [] },
  action) {
  contract('currentState', Object, currentState);
  switch (action.type) {
    case 'REPLACE_DISPLAYED_METADATA':
      contract('action.cells', Array, action.cells);
      contract('action.links', Array, action.links);
      return Object.assign({}, currentState, {
        cells: action.cells,
        links: action.links,
        tableNames: action.cells.map(cell => cell.tableName),
      });
    default:
      return currentState;
  }
}

module.exports.allMetadataReducer = allMetadataReducer;
module.exports.displayedMetadataReducer = displayedMetadataReducer;
