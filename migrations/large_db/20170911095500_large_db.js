const Random = require('random-js');
const ErrorMessages = require('../../app/utility/messages.js').ErrorMessages;

const NUM_TABLES = 100;
const SEED = 91217;
let randomNumberGenerator;

/**
 * Given a knex table object and its table index, defines columns for the table.
 * If the table index indicates that there are existing tables, connects the table to a random
 *  existing table.
 * @param {Object} table - the table Object
 * @param {number} i - the table index
 */
exports.defineTable = (table, tableIndex) => {
  if (!table) throw new Error(ErrorMessages.INVALID_ARGUMENT_TABLE_EXPECTED);
  if (tableIndex < 0) throw new Error(ErrorMessages.INDEX_OUT_OF_BOUNDS);
  if (!randomNumberGenerator) throw new Error(ErrorMessages.UNDEFINED_RNG);

  table.integer(`table_${tableIndex}_id`).notNullable().unique().primary();

  // If there are any existing tables, add a column that references a random existing table.
  if (tableIndex > 0) {
    const source = Random.integer(0, tableIndex - 1)(randomNumberGenerator);
    table.integer(`table_${source}_id`).references(`table_${source}.table_${source}_id`);
  }
};

/**
 * Given the knex object and the number of tables, generates numTables tables for the current
 * schema
 * @param {Object} knex - the knex library object
 * @param {number} numTables - the number of tables to generate
 * @returns {Promise} the promise for the creation of the tables
 */
exports.generate = (knex, numTables) => {
  if (!knex) return Promise.reject(new Error(ErrorMessages.INVALID_ARGUMENT_KNEX_OBJECT));
  if (numTables < 0) {
    return Promise.reject(new Error(ErrorMessages.NUM_TABLES_MUST_BE_NON_NEGATIVE));
  }

  const promises = [];

  // Seed the random number generator, so the results are the same every time.
  randomNumberGenerator = Random.engines.mt19937();
  randomNumberGenerator.seed(SEED);

  // Create NUM_TABLES tables.
  for (let i = 0; i < numTables; i += 1) {
    promises.push(knex.schema.createTable(`table_${i}`, (table) => {
      exports.defineTable(table, i);
    }));
  }

  return Promise.all(promises);
};

/**
 * Given a knex object and the number of tables, drops the tables from the schema.
 * Chains the promises returned by dropTable to ensure that the tables are deleted safely.
 * @param {Object} knex - the knex library object
 * @param {number} numTables - the number of tables to drop
 * @returns {Promise} the promise for the dropping of the tables
 */
exports.destroy = (knex, numTables) => {
  if (!knex) return Promise.reject(new Error(ErrorMessages.INVALID_ARGUMENT_KNEX_OBJECT));
  if (numTables < 0) {
    return Promise.reject(new Error(ErrorMessages.NUM_TABLES_MUST_BE_NON_NEGATIVE));
  }

  // Fake promise, to initialize the promise chain
  let promise = { then: init => init() };

  for (let i = numTables - 1; i >= 0; i -= 1) {
    promise = promise.then(() => knex.schema.dropTable(`table_${i}`));
  }

  return promise;
};

exports.up = knex => exports.generate(knex, NUM_TABLES);

exports.down = knex => exports.destroy(knex, NUM_TABLES);
