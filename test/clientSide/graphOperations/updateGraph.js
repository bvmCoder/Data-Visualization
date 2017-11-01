const chai = require('chai');
const sinon = require('sinon');
const axios = require('axios');
const redux = require('redux');
const MockAdapter = require('axios-mock-adapter');

chai.use(require('chai-as-promised'));

chai.should();

const codeUnderTest = require('../../../clientSide/graphOperations/updateGraph');
const errorNotifier = require('../../../clientSide/viewHelpers/errorNotifier');
const generateGraph = require('../../../clientSide/graphOperations/generateGraph');
const rootReducer = require('../../../clientSide/redux/reducers').rootReducer;
const actionGenerators = require('../../../clientSide/redux/actionGenerators');

describe('UpdateGraph', () => {
  let state;
  const baseURL = null;
  const container = null;
  let serverMock;
  let errorNotifierStub;
  let generateGraphStub;
  let replaceAllMetadataActionGeneratorStub;
  let stateDispatchStub;

  beforeEach(() => {
    serverMock = new MockAdapter(axios);
    state = redux.createStore(rootReducer);
    stateDispatchStub = sinon.stub(state, 'dispatch');
    errorNotifierStub = sinon.stub(errorNotifier, 'alertError');
    generateGraphStub = sinon.stub(generateGraph, 'generateGraph');
    replaceAllMetadataActionGeneratorStub =
      sinon.stub(actionGenerators, 'replaceAllMetadataActionGenerator');
  });

  afterEach(() => {
    serverMock.restore();
    errorNotifierStub.restore();
    generateGraphStub.restore();
    replaceAllMetadataActionGeneratorStub.restore();
    stateDispatchStub.restore();
  });

  context('when the server responds with failure', () => {
    const errorResponseStatusMatcher = { status: 500 };
    beforeEach(() => {
      serverMock.onGet().reply(500);
    });
    it('should catch the error and call errorNotifier', () => (
      codeUnderTest.updateGraph(container, baseURL, state)
        .should.be.fulfilled
        .then(() => {
          sinon.assert.calledOnce(errorNotifierStub);
          sinon.assert.calledWithMatch(errorNotifierStub, errorResponseStatusMatcher);
        })
    ));
    it('should not call the replaceAllMetadataActionGenerator', () => (
      codeUnderTest.updateGraph(container, baseURL, state)
        .should.be.fulfilled
        .then(() => {
          sinon.assert.notCalled(replaceAllMetadataActionGeneratorStub);
        })
    ));
    it('should not dispatch an action to the app state', () => (
      codeUnderTest.updateGraph(container, baseURL, state)
        .should.be.fulfilled
        .then(() => {
          sinon.assert.notCalled(stateDispatchStub);
        })
    ));
    it('should not call generateGraph', () => (
       codeUnderTest.updateGraph(container, baseURL, state)
        .should.be.fulfilled
        .then(() => {
          sinon.assert.notCalled(generateGraphStub);
        })
    ));
  });

  context('when the server responds with success', () => {
    const cellsTestString = 'cells';
    const linksTestString = 'links';
    beforeEach(() => {
      serverMock.onGet().reply(200, {
        cells: cellsTestString,
        links: linksTestString,
      });
    });

    it('should call replaceAllMetadataActionGenerator with required params', () => (
      codeUnderTest.updateGraph(container, baseURL, state)
        .then(() => {
          sinon.assert.calledOnce(replaceAllMetadataActionGeneratorStub);
          sinon.assert.alwaysCalledWithExactly(replaceAllMetadataActionGeneratorStub,
            cellsTestString, linksTestString);
        })
    ));
    it('should generate a new graph with the necessary params', () => (
      codeUnderTest.updateGraph(container, baseURL, state)
        .then(() => {
          sinon.assert.calledOnce(generateGraphStub);
          sinon.assert.alwaysCalledWithExactly(
            generateGraphStub, cellsTestString, linksTestString, container, state);
        })
    ));
    it('should not call the error notifier stub', () => (
      codeUnderTest.updateGraph(container, baseURL, state)
        .then(() => {
          sinon.assert.notCalled(errorNotifierStub);
        })
    ));
  });
});
