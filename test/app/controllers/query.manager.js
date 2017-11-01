const QueryManager = require('./../../../app/controllers/query.manager');
const chai = require('chai');

// Using chai extension for dealing with strings
chai.use(require('chai-string'));

const expect = chai.expect;
let queryManager;

describe('QueryManager', () => {
  beforeEach(() => {
    queryManager = new QueryManager('aDatabase');
  });

  it('should load', () => {
    expect(QueryManager).to.be.a('function');
  });

  it('should have the same corresponding database name passed to the constructor', () => {
    const dbName = 'aDatabase';
    expect(queryManager.databaseName).to.be.equal(dbName);
  });

  describe('#getTableMetadataQuery', () => {
    it('should return the expected query to get the metadata from a specific table', () => {
      let expectedSQL = `SELECT
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
        TABLE_SCHEMA = 'aDatabase'
        AND TABLE_NAME = 'aTable'`;
      let sql = queryManager.getTableMetadataQuery('aTable');

      // Normalize both queries before comparing i.e, ignore extra whitespace
      sql = sql.replace(/\s+/g, ' ').trim();
      expectedSQL = expectedSQL.replace(/\s+/g, ' ').trim();

      expect(sql).to.equalIgnoreCase(expectedSQL);
    });
  });

  describe('#getAllTableMetadataQuery', () => {
    it('should return the expected query to get all tables metadata', () => {
      let expectedSQL = `SELECT
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
        AND TABLE_SCHEMA = 'aDatabase'
        ORDER BY T.TABLE_NAME`;

      let sql = queryManager.getAllTableMetadataQuery();
      // Normalize both queries before comparing i.e, ignore extra whitespace
      sql = sql.replace(/\s+/g, ' ').trim();
      expectedSQL = expectedSQL.replace(/\s+/g, ' ').trim();
      expect(sql).to.equalIgnoreCase(expectedSQL);
    });
  });

  describe('#getListOfDatabasesQuery', () => {
    it('should return the expected query to get the list of databases from the server', () => {
      let expectedSQL = 'SHOW DATABASES';

      let sql = queryManager.getListOfDatabasesQuery();

      sql = sql.replace(/\s+/g, ' ').trim();
      expectedSQL = expectedSQL.replace(/\s+/g, ' ').trim();

      expect(sql).to.equalIgnoreCase(expectedSQL);
    });
  });
});
