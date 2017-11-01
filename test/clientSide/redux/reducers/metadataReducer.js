const chai = require('chai');
const contractErrorStringGenerator =
  require('../../../testing_utils').contractErrorStringGenerator;
const codeUnderTest =
  require('../../../../clientSide/redux/reducers/metadataReducer');

chai.should();
const expect = chai.expect;

describe('metadataReducers', () => {
  const wellFormedCells = [
    {
      tableName: 't1',
      columns: ['c2 : int', 'c3 : int'],
    },
    {
      tableName: 't2',
      columns: ['c1 : int', 'c3 : int'],
    },
    {
      tableName: 't3',
      columns: ['c1 : int', 'c2 : int'],
    },
    {
      tableName: 't4',
      columns: ['c1 : int', 'c2 : int', 'c4 : int'],
    },
  ];

  const columnNamesToTableNamesDictForWellFormedCells =
    {
      c1: ['t2', 't3', 't4'],
      c2: ['t1', 't3', 't4'],
      c3: ['t1', 't2'],
      c4: ['t4'],
    };

  describe('allMetadataReducer', () => {
    const allMetadataReducer = codeUnderTest.allMetadataReducer;
    const replaceAllMetadataTestString = 'REPLACE_ALL_METADATA';
    context('When the current state is not an object', () => {
      it('should throw an exception regarding that fact', () => {
        const allMetadataReducerCaller = () => allMetadataReducer(null, null);
        allMetadataReducerCaller.should.throw(TypeError,
          contractErrorStringGenerator('currentState', 'Object', 'Null', 'null'));
      });
    });

    context('When the action type is not known', () => {
      it('should return a state identical to the previous state', () => {
        const prevState = { testString: 'previousState' };
        const newState = allMetadataReducer(prevState, { type: '_UNKNOWN_TYPE_' });
        expect(newState).to.deep.equal(prevState);
      });
    });

    context('When the input action\'s type is the string REPLACE_ALL_METADATA', () => {
      context('when action.cells is not an array', () => {
        it('should throw an exception regarding that fact', () => {
          const allMetadataReducerCaller = () => allMetadataReducer({},
            {
              type: replaceAllMetadataTestString,
              cells: null,
            });
          allMetadataReducerCaller.should.throw(TypeError,
            contractErrorStringGenerator('action.cells', 'Array', 'Null', 'null'));
        });
      });
      context('when action.links is not an array', () => {
        it('should throw an exception regarding that fact', () => {
          const allMetadataReducerCaller = () => allMetadataReducer({},
            {
              type: replaceAllMetadataTestString,
              cells: [],
              links: null,
            });
          allMetadataReducerCaller.should.throw(TypeError,
            contractErrorStringGenerator('action.links', 'Array', 'Null', 'null'));
        });
      });
      context('when action.cells and action.links are empty', () => {
        const newState = allMetadataReducer({},
          {
            type: replaceAllMetadataTestString,
            cells: [],
            links: [],
          });
        it('should return a new state with empty arrays for cells', () => {
          expect(newState.cells).to.deep.equal([]);
        });

        it('should return a new state with empty array for table names', () => {
          expect(newState.tableNames).to.deep.equal([]);
        });

        it('should return a new state with links from the action', () => {
          expect(newState.links).to.deep.equal([]);
        });

        it('should return a new state with an empty columnNamesToTableNamesDict', () => {
          expect(newState.columnNamesToTableNamesDict).to.deep.equal({});
        });
      });
      context('when action.cells is an empty array and action.links is not empty', () => {
        const links = ['1', '2', '3'];
        const newState = allMetadataReducer({},
          {
            type: replaceAllMetadataTestString,
            cells: [],
            links: links,
          });
        it('should return a new state with empty arrays for cells', () => {
          expect(newState.cells).to.deep.equal([]);
        });

        it('should return a new state with empty array for table names', () => {
          expect(newState.tableNames).to.deep.equal([]);
        });

        it('should return a new state with links from the action', () => {
          expect(newState.links).to.deep.equal(links);
        });

        it('should return a new state with an empty columnNamesToTableNamesDict', () => {
          expect(newState.columnNamesToTableNamesDict).to.deep.equal({});
        });
      });
      context('when action.links is an empty array and action.cells is not empty', () => {
        const cellsAndLinks = {
          cells: wellFormedCells,
          links: [],
        };
        const resultingNewState = allMetadataReducer(
          {}, Object.assign({}, cellsAndLinks, { type: replaceAllMetadataTestString }));

        it('should return a state with a dictionary that maps the cells\' columns\' names\
          to the names of tables that contain those columns', () => {
          expect(resultingNewState.columnNamesToTableNamesDict).to.deep.equal(
            columnNamesToTableNamesDictForWellFormedCells);
        });
        it('should return a state with the cells that the action had', () => {
          expect(resultingNewState.cells).to.deep.equal(cellsAndLinks.cells);
        });
        it('should return a state with the links that the action had', () => {
          expect(resultingNewState.links).to.deep.equal(cellsAndLinks.links);
        });
        it('should return a state with the tables names of the cells of the action', () => {
          expect(resultingNewState.tableNames).to.deep.equal(['t1', 't2', 't3', 't4']);
        });
      });
      context('when action.links and action.cells are both not empty', () => {
        const cellsAndLinks = {
          cells: wellFormedCells,
          links: ['a', 'b', 'c'],
        };
        const resultingNewState = allMetadataReducer(
          {}, Object.assign({}, cellsAndLinks, { type: replaceAllMetadataTestString }));

        it(`should return a state with a dictionary that maps the cells' columns' names
      to the names of tables that contain those columns`, () => {
          expect(resultingNewState.columnNamesToTableNamesDict).to.deep.equal(
            columnNamesToTableNamesDictForWellFormedCells);
        });
        it('should return a state with the cells that the action had', () => {
          expect(resultingNewState.cells).to.deep.equal(cellsAndLinks.cells);
        });
        it('should return a state with the links that the action had', () => {
          expect(resultingNewState.links).to.deep.equal(cellsAndLinks.links);
        });
        it('should return a state with the tables names of the cells of the action', () => {
          expect(resultingNewState.tableNames).to.deep.equal(['t1', 't2', 't3', 't4']);
        });
      });
      context('when the cells columns do not have a colon', () => {
        const cellsAndLinks = {
          cells: [
            {
              tableName: 't1',
              columns: ['c2 int', 'c3 : int'],
            },
            {
              tableName: 't2',
              columns: ['c1 : int', 'c3 : int'],
            },
            {
              tableName: 't3',
              columns: ['c1 : int', 'c2 int'],
            },

          ],
          links: [],
        };
        const resultingNewState = allMetadataReducer(
          {}, Object.assign({}, cellsAndLinks, { type: replaceAllMetadataTestString }));
        const expectedColumnNamesToTableNamesDict = {
          c1: ['t2', 't3'],
          c3: ['t1', 't2'],
        };
        it(`should return a state with a dict that maps column names, if they 
      did have colon, to the names of tables that contain those columns`, () => {
          expect(resultingNewState.columnNamesToTableNamesDict).to.deep.equal(
            expectedColumnNamesToTableNamesDict);
        });
        it('should return a state with the cells that the action had', () => {
          expect(resultingNewState.cells).to.deep.equal(cellsAndLinks.cells);
        });
        it('should return a state with the links that the action had', () => {
          expect(resultingNewState.links).to.deep.equal(cellsAndLinks.links);
        });
        it('should return a state with the tables names of the cells of the action', () => {
          expect(resultingNewState.tableNames).to.deep.equal(['t1', 't2', 't3']);
        });
      });
    });
  });

  describe('displayedMetadataReducer', () => {
    const displayedMetadataReducer = codeUnderTest.displayedMetadataReducer;
    const replaceDisplayedMetadataTestString = 'REPLACE_DISPLAYED_METADATA';
    context('When the current state is not an object', () => {
      it('should throw an exception regarding that fact', () => {
        const displayedMetadataReducerCaller = () => displayedMetadataReducer(null, null);
        displayedMetadataReducerCaller.should.throw(TypeError,
          contractErrorStringGenerator('currentState', 'Object', 'Null', 'null'));
      });
    });

    context('When the action type is not known', () => {
      it('should return a state identical to the previous state', () => {
        const prevState = { testString: 'previousState' };
        const newState = displayedMetadataReducer(prevState, { type: '_UNKNOWN_TYPE_' });
        expect(newState).to.deep.equal(prevState);
      });
    });

    context('When the input action\'s type is the string REPLACE_DISPLAYED_METADATA', () => {
      context('when action.cells is not an array', () => {
        it('should throw an exception regarding that fact', () => {
          const displayedMetadataReducerCaller = () => displayedMetadataReducer({},
            {
              type: replaceDisplayedMetadataTestString,
              cells: null,
            });
          displayedMetadataReducerCaller.should.throw(TypeError,
            contractErrorStringGenerator('action.cells', 'Array', 'Null', 'null'));
        });
      });
      context('when action.links is not an array', () => {
        it('should throw an exception regarding that fact', () => {
          const displayedMetadataReducerCaller = () => displayedMetadataReducer({},
            {
              type: replaceDisplayedMetadataTestString,
              cells: [],
              links: null,
            });
          displayedMetadataReducerCaller.should.throw(TypeError,
            contractErrorStringGenerator('action.links', 'Array', 'Null', 'null'));
        });
      });
      context('when action.cells and action.links are empty', () => {
        const newState = displayedMetadataReducer({},
          {
            type: replaceDisplayedMetadataTestString,
            cells: [],
            links: [],
          });
        it('should return a new state with empty arrays for cells', () => {
          expect(newState.cells).to.deep.equal([]);
        });

        it('should return a new state with empty array for table names', () => {
          expect(newState.tableNames).to.deep.equal([]);
        });

        it('should return a new state with links from the action', () => {
          expect(newState.links).to.deep.equal([]);
        });
      });
      context('when action.cells is an empty array and action.links is not empty', () => {
        const links = ['1', '2', '3'];
        const newState = displayedMetadataReducer({},
          {
            type: replaceDisplayedMetadataTestString,
            cells: [],
            links: links,
          });
        it('should return a new state with empty arrays for cells', () => {
          expect(newState.cells).to.deep.equal([]);
        });

        it('should return a new state with empty array for table names', () => {
          expect(newState.tableNames).to.deep.equal([]);
        });

        it('should return a new state with links from the action', () => {
          expect(newState.links).to.deep.equal(links);
        });
      });
      context('when action.links is an empty array and action.cells is not empty', () => {
        const cellsAndLinks = {
          cells: wellFormedCells,
          links: [],
        };
        const resultingNewState = displayedMetadataReducer(
            {}, Object.assign({}, cellsAndLinks, { type: replaceDisplayedMetadataTestString }));
        it('should return a state with the cells that the action had', () => {
          expect(resultingNewState.cells).to.deep.equal(cellsAndLinks.cells);
        });
        it('should return a state with the links that the action had', () => {
          expect(resultingNewState.links).to.deep.equal(cellsAndLinks.links);
        });
        it('should return a state with the tables names of the cells of the action', () => {
          expect(resultingNewState.tableNames).to.deep.equal(['t1', 't2', 't3', 't4']);
        });
      });
      context('when action.links and action.cells are both not empty', () => {
        const cellsAndLinks = {
          cells: wellFormedCells,
          links: ['a', 'b', 'c'],
        };
        const resultingNewState = displayedMetadataReducer(
          {}, Object.assign({}, cellsAndLinks, { type: replaceDisplayedMetadataTestString }));
        it('should return a state with the cells that the action had', () => {
          expect(resultingNewState.cells).to.deep.equal(cellsAndLinks.cells);
        });
        it('should return a state with the links that the action had', () => {
          expect(resultingNewState.links).to.deep.equal(cellsAndLinks.links);
        });
        it('should return a state with the tables names of the cells of the action', () => {
          expect(resultingNewState.tableNames).to.deep.equal(['t1', 't2', 't3', 't4']);
        });
      });
    });
  });
});
