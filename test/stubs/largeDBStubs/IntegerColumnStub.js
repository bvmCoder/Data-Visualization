/**
 * A stub for a knex integer column
 */
module.exports = class IntegerColumnStub {
  /**
   * Contructs an IntegerColumnStub
   * @param {String} name - the name of the column
   */
  constructor(name) {
    this.name = name;
    this.isNullable = true;
    this.isUnique = false;
    this.isPrimary = false;
    this.refs = [];
  }

  /**
   * Adds a column reference to the list of references
   * @param {String} ref - the column to reference
   * @returns {Object} this IntegerColumnStub instance
   */
  addReference(ref) {
    this.refs.push(ref);
    return this;
  }

  /**
   * Returns true if the column is currently referencing the specified column
   * @param {String} ref - the column to check
   * @returns {boolean} whether the reference is in the list of references
   */
  hasReference(ref) {
    return this.refs.includes(ref);
  }

  /**
   * Sets the column as not nullable
   * @returns {Object} this IntegerColumnStub instance
   */
  notNullable() {
    this.isNullable = false;
    return this;
  }

  /**
   * Sets the column as unique
   * @returns {Object} this IntegerColumnStub instance
   */
  unique() {
    this.isUnique = true;
    return this;
  }

  /**
   * Sets the column as primary
   * @returns {Object} this IntegerColumnStub instance
   */
  primary() {
    this.isPrimary = true;
    return this;
  }
  /**
   * Sets the column as referencing another column
   * @param {String} ref - the column to reference
   * @returns {Object} this IntegerColumnStub instance (returned by addReference)
   */
  references(ref) {
    return this.addReference(ref);
  }
};
