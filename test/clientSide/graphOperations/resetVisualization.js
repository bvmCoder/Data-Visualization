const chai = require('chai');
const sinon = require('sinon');
const redux = require('redux');
const networkGenerator = require('../../../clientSide/graphOperations/generateGraph');
const errorNotifier = require('../../../clientSide/viewHelpers/errorNotifier');
const codeUnderTest =
  require('../../../clientSide/graphOperations/resetVisualization');
const rootReducer = require('../../../clientSide/redux/reducers/').rootReducer;

chai.should();

describe('resetVisualization', () => {
  const resetVisualization = codeUnderTest.resetVisualization;
  let testAppState;
  let stubbedGetState;
  let errorNotifierAlertErrorStub;
  let generateGraphNetworkGeneratorStub;
  const testStateData = {
    allMetadataReducer: {
      cells: 'TEST_CELLS',
      links: 'TEST_LINKS',
    },
  };
  const testContainer = 'TEST_CONTAINER';
  const errorMessage = 'An error occurred when trying to reset the visualization.\
        Try refreshing from the database as browser data may not exist.';
  beforeEach(() => {
    testAppState = redux.createStore(rootReducer);
    errorNotifierAlertErrorStub = sinon.stub(errorNotifier, 'alertError');
    generateGraphNetworkGeneratorStub = sinon.stub(networkGenerator, 'generateGraph');
  });
  afterEach(() => {
    errorNotifierAlertErrorStub.restore();
    generateGraphNetworkGeneratorStub.restore();
  });
  context('When no error occurs', () => {
    beforeEach(() => {
      stubbedGetState = sinon.stub(testAppState, 'getState').callsFake(() => testStateData);
      resetVisualization(testContainer, testAppState);
    });
    afterEach(() => {
      stubbedGetState.restore();
    });
    it('should call generateGraph with appState\'s allMetadataReducer\'s cells & links\
      the container and the appState', () => {
      sinon.assert.calledOnce(generateGraphNetworkGeneratorStub);
      sinon.assert.calledWithExactly(generateGraphNetworkGeneratorStub,
        testStateData.allMetadataReducer.cells,
        testStateData.allMetadataReducer.links,
        testContainer, testAppState);
    });
    it('should not call the error notifier', () => {
      sinon.assert.notCalled(errorNotifierAlertErrorStub);
    });
  });
  context('When any error occurs during the call to generateGraph', () => {
    beforeEach(() => {
      stubbedGetState = sinon.stub(testAppState, 'getState').throws();
      resetVisualization(testContainer, testAppState);
    });
    afterEach(() => {
      stubbedGetState.restore();
    });
    it('should call the error notifier with an appropriate message', () => {
      sinon.assert.calledOnce(errorNotifierAlertErrorStub);
      sinon.assert.calledWithExactly(
        errorNotifierAlertErrorStub, { message: errorMessage });
    });
  });
});
