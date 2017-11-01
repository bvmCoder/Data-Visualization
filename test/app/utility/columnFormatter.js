const chai = require('chai');
const columnFormatter = require('../../../app/utility/columnFormatter').formatColumns;
const validFormattedColumns = require('../../stubs/graphElementStubs/columnFormatterCells.json');
const validTablesStub = require('../../stubs/validTables.json');

const expect = chai.expect;

describe('columnFormatter', () => {
  context('when formatColumns is passed a table', () => {
    it('should return the properly formatted columns', () => {
      expect(columnFormatter(validTablesStub[0])).to.deep.equal(validFormattedColumns[0].columns);
    });
  });
});
