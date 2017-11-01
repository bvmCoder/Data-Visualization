/**
 * Represents the column's metadata information.
 * @param {string} name - The name of the column in the database
 * @param {string} type - The database data-type of the column
 * @constructor
 */
function ColumnMetadata(name, type) {
  // The column's name
  this.name = name;

  // The column's database type
  this.type = type;

  // Determine if this column is a primary key or not
  this.isPK = false;

  // The table's name this foreign key column references
  this.referenceTable = '';

  // The primary key column referenced by this foreign key column
  this.referenceColumn = '';
}

module.exports = ColumnMetadata;
