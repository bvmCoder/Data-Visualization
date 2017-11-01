/**
 * Created by TA053139 on 3/30/2017.
 */

const ColumnMetadata = require('../../../app/models/metadata.column');
const chai = require('chai');

const expect = chai.expect;

describe('ColumnMetadata', () => {
  it('should load', () => {
    expect(ColumnMetadata).to.be.a('function');
  });

  describe('Constructor and default values', () => {
    it('should have the same corresponding column name value' +
      ' passed to the constructor',
      () => {
        const colName = 'aColumnName';
        const colType = 'anyType';
        const column = new ColumnMetadata(colName, colType);

        expect(column.name).to.be.equal(colName);
      });

    it('should have the same corresponding column type value' +
      ' passed to the constructor',
      () => {
        const colName = 'anyName';
        const colType = 'aColumnType';
        const column = new ColumnMetadata(colName, colType);

        expect(column.type).to.be.equal(colType);
      });

    it('should have the correct default value for isPk field',
      () => {
        const colName = 'aColumnName';
        const colType = 'aColumnType';
        const column = new ColumnMetadata(colName, colType);

        expect(column.isPK).to.be.equal(false);
      });

    it('should have the correct default value for referenceTable field',
      () => {
        const colName = 'aColumnName';
        const colType = 'aColumnType';
        const column = new ColumnMetadata(colName, colType);

        expect(column.referenceTable).to.be.equal('');
      });

    it('should have the correct default value for referenceColumn field',
      () => {
        const colName = 'aColumnName';
        const colType = 'aColumnType';
        const column = new ColumnMetadata(colName, colType);

        expect(column.referenceColumn).to.be.equal('');
      });
  });
});
