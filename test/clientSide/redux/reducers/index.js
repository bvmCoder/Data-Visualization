const redux = require('redux');
const chai = require('chai');
const rootReducer = require('../../../../clientSide/redux/reducers/index').rootReducer;

chai.should();

describe('root reducer', () => {
  let appState;
  beforeEach(() => {
    appState = redux.createStore(rootReducer);
  });
  context('when calling get state', () => {
    it('should retrieve an all metadata reducer', () => {
      appState.getState().allMetadataReducer.should.be.an('object');
    });
    it('should retrieve a displayed metadata reducer', () => {
      appState.getState().displayedMetadataReducer.should.be.an('object');
    });
  });
});

