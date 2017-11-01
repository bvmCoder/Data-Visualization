const chai = require('chai');
const sinon = require('sinon');
const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');

chai.use(require('chai-as-promised'));

chai.should();

const updateGraph = require('../../../clientSide/graphOperations/updateGraph');
const errorNotifier = require('../../../clientSide/viewHelpers/errorNotifier');
const codeUnderTest = require('../../../clientSide/networkOperations/refreshFromDB');

describe('clearDBCache', () => {
  const testBaseUrl = 'URL';
  const testContainer = 'TEST CONTAINER';
  const testAppState = 'TEST APP STATE';
  let serverMock;
  let errorNotifierStub;
  let updateGraphStub;

  beforeEach(() => {
    serverMock = new MockAdapter(axios);
    errorNotifierStub = sinon.stub(errorNotifier, 'alertError');
    updateGraphStub = sinon.stub(updateGraph, 'updateGraph');
  });

  afterEach(() => {
    serverMock.restore();
    errorNotifierStub.restore();
    updateGraphStub.restore();
  });

  context('When the server responds with failure', () => {
    it('should catch the error and call errorNotifierr with the error', () => {
      const testServerError = 'TEST SERVER ERROR MESSAGE';
      serverMock.onDelete().reply(404, testServerError);

      return codeUnderTest.refreshFromDB(testContainer, testBaseUrl, testAppState)
        .should.be.fulfilled.then(() => {
          sinon.assert.calledOnce(errorNotifierStub);
          sinon.assert.notCalled(updateGraphStub);
        });
    });
  });

  context('when the server responds with success', () => {
    it('should call updateGraph, with the container and base URL parameters', () => {
      serverMock.onDelete().reply(200);

      return codeUnderTest.refreshFromDB(testContainer, testBaseUrl, testAppState)
        .should.be.fulfilled.then(() => {
          sinon.assert.calledOnce(updateGraphStub);
          sinon.assert.alwaysCalledWithExactly(
            updateGraphStub, testContainer, testBaseUrl, testAppState);
          sinon.assert.notCalled(errorNotifierStub);
        });
    });
  });
});
