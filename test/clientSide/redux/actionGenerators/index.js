const chai = require('chai');
const codeUnderTest = require('../../../../clientSide/redux/actionGenerators/index');

chai.should();

describe('action generators', () => {
  describe('metadata action generators', () => {
    describe('Replace all metadata action generator', () => {
      const replaceAllMetadataActionGenerator =
        codeUnderTest.replaceAllMetadataActionGenerator;
      let returnedObject;
      const newCellsTestParam = 'NEW_CELLS_TEST_PARAM';
      const newLinksTestParam = 'NEW_CELL_TEST_PARAM';
      const expectedTypeString = 'REPLACE_ALL_METADATA';
      beforeEach(() => {
        returnedObject = replaceAllMetadataActionGenerator(newCellsTestParam, newLinksTestParam);
      });
      it('should return the newCells param as a property named cells', () => {
        returnedObject.cells.should.equal(newCellsTestParam); // Identity test
      });
      it('should return the newLinks param as a property named links', () => {
        returnedObject.links.should.equal(newLinksTestParam); // Identity test
      });
      it('should return an object with a property named \'type\', equal to the string REPLACE_ALL_METADATA', () => {
        returnedObject.type.should.equal(expectedTypeString); // Equality test
      });
      it('should return an object with only the properties cells, link, and type', () => {
        Object.getOwnPropertyNames(returnedObject).sort().should.deep.equal(
          ['cells', 'links', 'type'].sort());
      });
    });


    describe('Replace displayed metadata action generator', () => {
      const replaceDisplayedMetadataActionGenerator =
        codeUnderTest.replaceDisplayedMetadataActionGenerator;
      let returnedObject;
      const newCellsTestParam = 'NEW_CELLS_TEST_PARAM';
      const newLinksTestParam = 'NEW_CELL_TEST_PARAM';
      const expectedTypeString = 'REPLACE_DISPLAYED_METADATA';
      beforeEach(() => {
        returnedObject =
          replaceDisplayedMetadataActionGenerator(newCellsTestParam, newLinksTestParam);
      });
      it('should return the newCells param as a property named cells', () => {
        returnedObject.cells.should.equal(newCellsTestParam); // Identity test
      });
      it('should return the newLinks param as a property named links', () => {
        returnedObject.links.should.equal(newLinksTestParam); // Identity test
      });
      it('should return an object with a property named \'type\', equal to the string REPLACE_DISPLAY_METADATA', () => {
        returnedObject.type.should.equal(expectedTypeString); // Equality test
      });
      it('should return an object with only the properties cells, link, and type', () => {
        Object.getOwnPropertyNames(returnedObject).sort().should.deep.equal(
          ['cells', 'links', 'type'].sort());
      });
    });
  });
});
