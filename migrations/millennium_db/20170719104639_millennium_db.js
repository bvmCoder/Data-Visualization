exports.up = (knex, Promise) => Promise.all([
  knex.schema.createTable('person', (table) => {
    table.integer('person_id').notNullable().unique().primary();
    table.string('name_first').notNullable();
    table.string('name_last').notNullable();
  }),

  knex.schema.createTable('encounter', (table) => {
    table.integer('encounter_id').notNullable().unique().primary();
    table.string('encounter_type').notNullable();
  }),

  knex.schema.createTable('address', (table) => {
    table.integer('address_id').notNullable().unique().primary();
    table.string('street').notNullable();
    table.string('city').notNullable();
    table.string('state').notNullable();
    table.string('country').notNullable();
    table.string('zip').notNullable();
  }),

  knex.schema.createTable('person_encounter', (table) => {
    table.integer('person_encounter_id').notNullable().unique().primary();
    table.integer('person_id').references('person.person_id');
    table.integer('encounter_id').references('encounter.encounter_id');
  }),

  knex.schema.createTable('person_address', (table) => {
    table.integer('person_address_id').notNullable().unique().primary();
    table.integer('person_id').references('person.person_id');
    table.integer('address_id').references('address.address_id');
  }),
]);

exports.down = (knex, Promise) =>
  Promise.all([
    knex.schema.dropTable('person_encounter'),
    knex.schema.dropTable('person_address'),
    knex.schema.dropTable('person'),
    knex.schema.dropTable('encounter'),
    knex.schema.dropTable('address'),
  ]);
