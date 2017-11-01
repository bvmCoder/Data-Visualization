const TableMetadata = require('../models/metadata.table');
const ColumnMetadata = require('../models/metadata.column');
const QueryManager = require('./query.manager');
const queryService = require('../services/query.service');
const ErrorMessages = require('../utility/messages').ErrorMessages;

// Constraint Types enum
const ConstraintType = {
  PRIMARY_KEY: 'PRIMARY KEY',
  FOREIGN_KEY: 'FOREIGN KEY',
};


/**
 * Utility function to set the corresponding constraints for the provided column
 * @param {ColumnMetadata} columnMetadata - The ColumnMetadata object
 * @param {RowDataPacket} row - the database row that has the column's information
 * @return {ColumnMetadata} Return the column metadata after assigning constraints, if any
 */
function setConstraints(columnMetadata, row) {
  const columnMetadataWithConstraints = columnMetadata;
  if (row.CONSTRAINT_TYPE === ConstraintType.PRIMARY_KEY) {
    columnMetadataWithConstraints.isPK = true;
  }

  if (row.CONSTRAINT_TYPE === ConstraintType.FOREIGN_KEY) {
    columnMetadataWithConstraints.referenceTable = row.REFERENCED_TABLE_NAME;
    columnMetadataWithConstraints.referenceColumn = row.REFERENCED_COLUMN_NAME;
  }

  return columnMetadataWithConstraints;
}


/**
 * Utility function to process list of RowDataPackets into TableMetadata objects.
 *
 * @param {Array<RowDataPacket>} sqlData SQL result to format
 * @returns {Array<TableMetadata>} List of formatted TableMetadata objects.
 */
function processRows(sqlData) {
  const tables = [];

  // a variable to store the previous table name so once it differs from
  // the current, we create a new TableMetadata object for the new table
  let previouslyProcessedTableName = '';
  let table;
  let column;
  sqlData.forEach((rowDataPacket) => {
    /**
     * Check if the current results iterator has moved into a raw that has a different
     * table's name (recall results are ordered by table's name).
     * In other words, check whether this is the first traversed db row for this table.
     */
    if (previouslyProcessedTableName !== rowDataPacket.TABLE_NAME) {
      previouslyProcessedTableName = rowDataPacket.TABLE_NAME;
      table = new TableMetadata(rowDataPacket.TABLE_NAME);
      column = new ColumnMetadata(rowDataPacket.COLUMN_NAME, rowDataPacket.COLUMN_TYPE);
      table.addColumn(column);
      tables.push(table);
    } else {
      // Then, it is the same table so search if the column already exists
      column = table.getColumnByName(rowDataPacket.COLUMN_NAME);

      // In case it does not exit, create it and add it to the table.
      if (column === null) {
        column = new ColumnMetadata(rowDataPacket.COLUMN_NAME, rowDataPacket.COLUMN_TYPE);
        table.addColumn(column);
      }
    }

    // Set foreign and primary key constraints if any
    column = setConstraints(column, rowDataPacket);
  });
  return tables;
}

/**
 * Retrieves & formats the metadata of all database tables.
 * @param {Object} dbCache Cache to r/w to/from db calls. Must be provided, and cannot be falsy.
 * @param {String} dbName The name of the database to get tables from. Must be provided, and cannot
 *  be falsy.
 * @returns {Promise<Array<TableMetadata>, Error>} A Promise that resolves with a formatted list of
 *  all tables in database. Is rejected with an error if dbCache or dbName is not provided or is
 *  falsy, and is also rejected if there is an error with the query.
 */
module.exports.getAllTableMetadata = function getAllTableMetadata(dbCache, dbName) {
  return new Promise((resolve, reject) => {
    if (!dbCache) return reject(new Error(ErrorMessages.INVALID_OR_MISSING_CACHE_ARGUMENT));
    if (!dbName) return reject(new Error(ErrorMessages.INVALID_OR_MISSING_DATABASE_NAME_ARGUMENT));
    const queryManager = new QueryManager(dbName);
    const query = queryManager.getAllTableMetadataQuery();
    return queryService.runQuery(query, dbCache)
      .then((queryResult) => {
        const processedRows = processRows(queryResult);
        resolve(processedRows);
      })
      .catch((error) => {
        reject(error);
      });
  });
};
