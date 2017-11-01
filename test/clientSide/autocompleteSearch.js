const chai = require('chai');
const sinon = require('sinon');
const redux = require('redux');
const rootReducer = require('../../clientSide/redux/reducers/').rootReducer;

const codeUnderTest = require('../../clientSide/autocompleteSearch');

chai.should();

describe('autoCompleteSearch', () => {
  const autocompleteSearch = codeUnderTest.autocompleteSearch;
  let appState;
  let callBack;
  let stubbedGetState;

  const normalState = {
    allMetadataReducer: {
      columnNamesToTableNamesDict: {
        c1: ['t2', 't3', 't4'],
        c2: ['t1', 't3', 't4'],
        c3: ['t1', 't2'],
        c4: ['t4'],
      },
      tableNames: ['t1', 't2', 't3', 't4'],
    },
  };

  const emptyState = {
    allMetadataReducer: {
      columnNamesToTableNamesDict: {},
      tableNames: [],
    },
  };

  beforeEach(() => {
    callBack = sinon.spy();
    appState = redux.createStore(rootReducer);
  });

  afterEach(() => {
    stubbedGetState.restore();
  });

  context('when queryString is empty', () => {
    it('should call the callBack with an empty array', () => {
      stubbedGetState = sinon.stub(appState, 'getState').callsFake(() => normalState);
      autocompleteSearch('', callBack, appState);
      sinon.assert.calledWithExactly(callBack, []);
      sinon.assert.calledOnce(callBack);
    });
  });

  context('when queryString is not a substring of any table or column name', () => {
    it('should call the callBack with an empty array', () => {
      stubbedGetState = sinon.stub(appState, 'getState').callsFake(() => normalState);
      autocompleteSearch('q', callBack, appState);
      sinon.assert.calledWithExactly(callBack, []);
      sinon.assert.calledOnce(callBack);
    });
  });

  context('when queryString is a substring of any table or column name', () => {
    it(`should call the callBack with an array of both table names containing
     the queryString and table names of tables with columns with names that 
     contain the queryString`, () => {
      stubbedGetState =
        sinon.stub(appState, 'getState').callsFake(() => normalState);
      autocompleteSearch('3', callBack, appState);
      // t1 and t2 are selected because they are in the array of c3.
      // t3 is selected because it has a 3 in the name.
      sinon.assert.calledWithExactly(callBack, ['t1', 't2', 't3']);
      sinon.assert.calledOnce(callBack);
    });
  });

  context('when the columnNamesToTableNamesDict and tableNames are empty', () => {
    it('should call the callBack with an empty array', () => {
      stubbedGetState =
        sinon.stub(appState, 'getState').callsFake(() => emptyState);
      autocompleteSearch('1', callBack, appState);
      sinon.assert.calledWithExactly(callBack, []);
      sinon.assert.calledOnce(callBack);
    });
  });
});
