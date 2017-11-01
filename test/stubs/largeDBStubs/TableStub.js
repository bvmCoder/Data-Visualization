const IntegerColumnStub = require('./IntegerColumnStub');

/**
 * A stub for a knex table object
 */
module.exports = class TableStub {
  /**
   * Contructs a TableStub
   * @param {String} name - the name of the table
   */
  constructor(name) {
    this.name = name;
    this.columns = {};
  }

  /**
   * Gets the IntegerColumnStub instance from the map of columns
   * @param {String} name - the name of the column to get
   * @returns {Object} the IntegerColumnStub instance
   */
  getColumn(name) {
    return this.columns[name];
  }

  /**
   * Returns the number of columns in the table
   * @returns {number} the number of columns
   */
  getColumnCount() {
    return Object.keys(this.columns).length;
  }

  /**
   * Adds an integer column to the table and returns the instance, alias for addColumn
   * @param {String} name - the name of the column to add
   * @returns {Object} the new IntegerColumnStub instance
   */
  integer(name) {
    const newColumn = new IntegerColumnStub(name);
    this.columns[name] = newColumn;
    return newColumn;
  }
};
