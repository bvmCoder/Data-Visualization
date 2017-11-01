/**
 * Represents a Cell,
 * which is used to hold table information
 */

module.exports.Cell = class {
  constructor(id, columns, tableName) {
    this.id = id;
    this.columns = columns;
    this.tableName = tableName;
  }
};
