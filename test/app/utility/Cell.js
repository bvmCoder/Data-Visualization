const Cell = require('../../../app/utility/Cell').Cell;
const chai = require('chai');

const expect = chai.expect;

describe('Cell', () => {
  it('should construct a cell with attributes the same as the parameters passed in', () => {
    const cell = new Cell(0, ['label'], 'tableName');
    expect(cell.id).to.equal(0);
    expect(cell.columns).to.deep.equal(['label']);
    expect(cell.tableName).to.equal('tableName');
  });
});
