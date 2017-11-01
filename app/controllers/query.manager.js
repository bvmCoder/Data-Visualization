const mysql = require('mysql');

/**
 * Query Manager is a class for easily retrieve and manage SQL queries
 * @param {string} databaseName - The database (schema) name
 * @constructor
 */
function QueryManager(databaseName) {
  this.databaseName = databaseName;
}

/**
 * Returns a SQL Query to retrieve column's metadata for a specific table.
 * @param {string} tableName - The name of the table
 * @returns {string} - a SQL query to retrieve the passed table metadata from the database.
 */
QueryManager.prototype.getTableMetadataQuery = function getTableMetadataQuery(tableName) {
  return `SELECT
    C.COLUMN_NAME,
    C.COLUMN_TYPE,
    N.CONSTRAINT_TYPE,
    K.REFERENCED_TABLE_NAME,
    K.REFERENCED_COLUMN_NAME
FROM
    INFORMATION_SCHEMA.COLUMNS C
        LEFT JOIN
    INFORMATION_SCHEMA.KEY_COLUMN_USAGE K USING (TABLE_SCHEMA , TABLE_NAME , COLUMN_NAME)
        LEFT JOIN
    INFORMATION_SCHEMA.TABLE_CONSTRAINTS N USING (TABLE_SCHEMA , TABLE_NAME , CONSTRAINT_NAME)
WHERE
    TABLE_SCHEMA = ${mysql.escape(this.databaseName)}
    AND TABLE_NAME = ${mysql.escape(tableName)}`;
};

/**
 * Returns a SQL Query to retrieve all tables' metadata from the database.
 * @returns {string} - A SQL query to retrieve metadata for all database tables.
 */
QueryManager.prototype.getAllTableMetadataQuery = function getAllTableMetadataQuery() {
  return `SELECT
    T.TABLE_NAME,
    C.COLUMN_NAME,
    C.COLUMN_TYPE,
    N.CONSTRAINT_TYPE,
    K.REFERENCED_TABLE_NAME,
    K.REFERENCED_COLUMN_NAME
FROM
    INFORMATION_SCHEMA.TABLES T
    LEFT JOIN
    INFORMATION_SCHEMA.COLUMNS C USING (TABLE_SCHEMA , TABLE_NAME)
    LEFT JOIN
    INFORMATION_SCHEMA.KEY_COLUMN_USAGE K USING (TABLE_SCHEMA , TABLE_NAME , COLUMN_NAME)
    LEFT JOIN
    INFORMATION_SCHEMA.TABLE_CONSTRAINTS N USING (TABLE_SCHEMA , TABLE_NAME , CONSTRAINT_NAME)
WHERE
  TABLE_TYPE = 'BASE TABLE'
  AND TABLE_SCHEMA = ${mysql.escape(this.databaseName)}
  ORDER BY T.TABLE_NAME`;
};

/**
 * Returns the SQL query to get the list of databases from the server.
 * @returns {String} - the SQL query to get the list of databases from the server.
 */
QueryManager.prototype.getListOfDatabasesQuery = () => 'SHOW DATABASES';

module.exports = QueryManager;
