/**
 * Created by TA053139 on 3/27/2017.
 */


const ColumnMetadata = require('./metadata.column');

/**
 * Represents a model for table's metadata
 * @param {string} tableName -  The name of the table in the database
 * @constructor
 */
function TableMetadata(tableName) {
  // The table's name
  this.name = tableName;

  // An array of the tables' columns
  this.columns = [];
}

/**
 * Returns all columns that are primary keys in the table
 * @returns {Array.<ColumnMetadata>} - An array of columns that are primary keys
 */
TableMetadata.prototype.getPrimaryKeyColumns = function getPrimaryKeyColumns() {
  return this.columns.filter(column => column.isPK);
};

/**
 * Add a column to the table
 * @param {ColumnMetadata} column - The column's metadata object
 */
TableMetadata.prototype.addColumn = function addColumn(column) {
  this.columns.push(column);
};

/**
 * Add a column to the table by the column's name and the column's type
 * @param {string} columnName - The column's name
 * @param {string} columnType - The column's type
 * @returns {ColumnMetadata} - The column's object that has been added
 */
TableMetadata.prototype.addColumnByNameAndType = function addColumnByNameAndType(
  columnName,
  columnType) {
  const column = new ColumnMetadata(columnName, columnType);
  this.columns.push(column);
  return column;
};

/**
 * Returns the column's object by its name or null if it does not exist
 * @param {string} columnName - The column's name
 * @returns {ColumnMetadata} - The column's metadata object
 */
TableMetadata.prototype.getColumnByName = function getColumnByName(columnName) {
  const cols = this.columns.filter(columnMetadata =>
    columnMetadata.name === columnName);
  if (cols.length !== 0) {
    return cols[0];
  }
  return null;
};

/**
 * Returns the column's object index by its name or -1 if it does not exist
 * @param {string} columnName - The column's name
 * @returns {number} - The index of column's object in the <code> columns </code>
 * property array or -1 in case it is not found
 */
TableMetadata.prototype.getColumnIndexByName = function getColumnIndexByName(columnName) {
  return this.columns.findIndex(col => col.name === columnName);
};

module.exports = TableMetadata;
