const chai = require('chai');
const sinon = require('sinon');
const migrationFile = require('../../../migrations/millennium_db/20170719104639_millennium_db');

const expect = chai.expect;
const schema = {
  createTable: () => {},
  dropTable: () => {},
};
const knex = {
  schema: schema,
};

describe('20170719104639_millennium_db.js migration test', () => {
  context('when the database is migrated to the latest', () => {
    it('should call createTable with the correct table names', () => {
      const knexCreateTableStub = sinon.stub(knex.schema, 'createTable');

      // Call the up method, which is called when the migration is migrated to the latest
      migrationFile.up(knex, Promise);

      knexCreateTableStub.restore();

      expect(knexCreateTableStub.callIds.length).to.eql(5);
      expect(knexCreateTableStub.getCall(0).args[0]).to.eql('person');
      expect(knexCreateTableStub.getCall(1).args[0]).to.eql('encounter');
      expect(knexCreateTableStub.getCall(2).args[0]).to.eql('address');
      expect(knexCreateTableStub.getCall(3).args[0]).to.eql('person_encounter');
      expect(knexCreateTableStub.getCall(4).args[0]).to.eql('person_address');
    });

    it('should call the correct table methods to create columns in the callback method passed in', () => {
      const knexCreateTableStub = sinon.stub(knex.schema, 'createTable');

      migrationFile.up(knex, Promise);

      knexCreateTableStub.restore();

      // Check when creating the person table
      expect(knexCreateTableStub.getCall(0).args[1].toString()).to.contain('table.integer(\'person_id\').notNullable().unique().primary()');
      expect(knexCreateTableStub.getCall(0).args[1].toString()).to.contain('table.string(\'name_first\').notNullable()');
      expect(knexCreateTableStub.getCall(0).args[1].toString()).to.contain('table.string(\'name_last\').notNullable()');

      // Check when creating the encounter table
      expect(knexCreateTableStub.getCall(1).args[1].toString()).to.contain('table.integer(\'encounter_id\').notNullable().unique().primary()');
      expect(knexCreateTableStub.getCall(1).args[1].toString()).to.contain('table.string(\'encounter_type\').notNullable()');

      // Check when creating the address table
      expect(knexCreateTableStub.getCall(2).args[1].toString()).to.contain('table.integer(\'address_id\').notNullable().unique().primary()');
      expect(knexCreateTableStub.getCall(2).args[1].toString()).to.contain('table.string(\'street\').notNullable()');
      expect(knexCreateTableStub.getCall(2).args[1].toString()).to.contain('table.string(\'city\').notNullable()');
      expect(knexCreateTableStub.getCall(2).args[1].toString()).to.contain('table.string(\'state\').notNullable()');
      expect(knexCreateTableStub.getCall(2).args[1].toString()).to.contain('table.string(\'country\').notNullable()');
      expect(knexCreateTableStub.getCall(2).args[1].toString()).to.contain('table.string(\'zip\').notNullable()');

      // Check when creating the person_encounter table
      expect(knexCreateTableStub.getCall(3).args[1].toString()).to.contain('table.integer(\'person_encounter_id\').notNullable().unique().primary()');
      expect(knexCreateTableStub.getCall(3).args[1].toString()).to.contain('table.integer(\'encounter_id\').references(\'encounter.encounter_id\')');
      expect(knexCreateTableStub.getCall(3).args[1].toString()).to.contain('table.integer(\'person_id\').references(\'person.person_id\')');

      // Check when creating the person_address table
      expect(knexCreateTableStub.getCall(4).args[1].toString()).to.contain('table.integer(\'person_address_id\').notNullable().unique().primary()');
      expect(knexCreateTableStub.getCall(4).args[1].toString()).to.contain('table.integer(\'address_id\').references(\'address.address_id\')');
      expect(knexCreateTableStub.getCall(4).args[1].toString()).to.contain('table.integer(\'person_id\').references(\'person.person_id\')');
    });
  });

  context('when the database is rolled back', () => {
    it('should call dropTable with the correct table names', () => {
      const knexDropTableStub = sinon.stub(knex.schema, 'dropTable');

      // Call the down method, which is called when the migration is rolled back
      migrationFile.down(knex, Promise);

      knexDropTableStub.restore();

      expect(knexDropTableStub.callIds.length).to.eql(5);
      expect(knexDropTableStub.getCall(0).args[0]).to.eql('person_encounter');
      expect(knexDropTableStub.getCall(1).args[0]).to.eql('person_address');
      expect(knexDropTableStub.getCall(2).args[0]).to.eql('person');
      expect(knexDropTableStub.getCall(3).args[0]).to.eql('encounter');
      expect(knexDropTableStub.getCall(4).args[0]).to.eql('address');
    });
  });
});
