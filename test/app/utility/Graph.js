const expect = require('chai').expect;
const Graph = require('../../../app/utility/Graph');
const validTables = require('../../stubs/validTables');
const tableWithEmptyTableName = require('../../stubs/emptyTableName');
const tableWithoutTableName = require('../../stubs/missingTableName');
const missingReferenceTable = require('../../stubs/missingReferenceTable');
const columnFormatterCells = require('../../stubs/graphElementStubs/columnFormatterCells');
const ErrorMessages = require('../../../app/utility/messages').ErrorMessages;
const relationshipTypes = require('../../../app/utility/linkConnectionTypes').connectionTypes;

describe('Graph.js class', () => {
  describe('generateCells', () => {
    context('Given a correctly formed array of table objects', () => {
      it('should return a properly formed array of cells', () => {
        const graph = new Graph(validTables);

        expect(JSON.stringify(graph.cells)).to.equal(JSON.stringify(columnFormatterCells));
      });
    });

    context('Given an empty array of table objects', () => {
      it('should throw an error with the corresponding message', () => {
        expect(() => new Graph([])).to.throw(Error, ErrorMessages.NO_TABLES_RETRIEVED);
      });
    });

    context('Given a table with an empty tableName', () => {
      it('should throw an error with the corresponding message', () => {
        expect(() => new Graph(tableWithEmptyTableName)).to.throw(Error,
       ErrorMessages.TABLE_MUST_HAVE_A_NAME);
      });
    });

    context('Given a json object without a tableName as a property', () => {
      it('should throw an error with the corresponding message', () => {
        expect(() => new Graph(tableWithoutTableName)).to.throw(Error,
       ErrorMessages.TABLE_MUST_HAVE_A_NAME);
      });
    });

    context('Given a non-object type', () => {
      it('should throw an error with the corresponding message', () => {
        expect(() => new Graph('bad data')).to.throw(Error,
       ErrorMessages.INVALID_ARGUMENT_ARRAY_EXPECTED);
      });
    });
  });

  describe('generateLinks', () => {
    context('Given an array of table objects', () => {
      it('should correctly link the cells', () => {
        const graph = new Graph(validTables);
        /* These expectedLinks come from the validTables.json files in the stubs folder.
        A helpful reminder that in each link the source and destination field are the index
        of those cells in the cells array created by generateCells. */
        const expectedLinks = [
          {
            source: 1,
            destination: 0,
            sourceRelationshipType: relationshipTypes.MANY,
            destinationRelationshipType: relationshipTypes.ONE,
          },
          {
            source: 3,
            destination: 1,
            sourceRelationshipType: relationshipTypes.ONE,
            destinationRelationshipType: relationshipTypes.ONE,
          },
        ];
        expect(JSON.stringify(graph.links)).to.equal(JSON.stringify(expectedLinks));
      });
    });

    context('Given a table with a referenceTable not in tables', () => {
      it('should throw an error with the corresponding message', () => {
        expect(() => new Graph(missingReferenceTable)).to.throw(Error,
       ErrorMessages.COLUMN_MUST_HAVE_REFERENCE_TABLE_PROPERTY);
      });
    });

    context('Given a table with an empty tableName', () => {
      it('should throw an error with the corresponding message', () => {
        const graph = new Graph(validTables);
        expect(() => graph.generateLinks(tableWithEmptyTableName)).to.throw(Error,
       ErrorMessages.TABLE_MUST_HAVE_A_NAME);
      });
    });

    context('Given a json object without a tableName as a property', () => {
      it('should throw an error with the corresponding message', () => {
        const graph = new Graph(validTables);
        expect(() => graph.generateLinks(tableWithoutTableName)).to.throw(Error,
       ErrorMessages.TABLE_MUST_HAVE_A_NAME);
      });
    });
  });
});
