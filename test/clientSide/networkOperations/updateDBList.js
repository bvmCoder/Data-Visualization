const dbListUpdater = require('../../../clientSide/networkOperations/updateDBList');
const jsdom = require('mocha-jsdom');
const redux = require('redux');
const axios = require('axios');
const sinon = require('sinon');
const rootReducer = require('../../../clientSide/redux/reducers').rootReducer;
const MockAdapter = require('axios-mock-adapter');
const actionGenerators = require('../../../clientSide/redux/actionGenerators');
const chai = require('chai');
const errorNotifier = require('../../../clientSide/viewHelpers/errorNotifier');
const ErrorMessages = require('../../../app/utility/messages').ErrorMessages;

chai.use(require('chai-as-promised'));

const expect = chai.expect;
chai.should();

describe('updateDBList', () => {
  let appState;

  beforeEach(() => {
    appState = redux.createStore(rootReducer);
  });

  describe('#updateDBList', () => {
    const baseUrl = null;
    let serverMock;
    let stateDispatchStub;
    let errorNotifierStub;
    let replaceCurrentDbNameActionGeneratorStub;
    let replaceDbNamesActionGeneratorStub;

    beforeEach(() => {
      serverMock = new MockAdapter(axios);
      stateDispatchStub = sinon.stub(appState, 'dispatch');
      errorNotifierStub = sinon.stub(errorNotifier, 'alertError');
      replaceCurrentDbNameActionGeneratorStub = sinon.stub(actionGenerators, 'replaceCurrentDbNameActionGenerator');
      replaceDbNamesActionGeneratorStub = sinon.stub(actionGenerators, 'replaceDbNamesActionGenerator');
    });

    afterEach(() => {
      stateDispatchStub.restore();
      errorNotifierStub.restore();
      replaceCurrentDbNameActionGeneratorStub.restore();
      replaceDbNamesActionGeneratorStub.restore();
    });

    context('when the server responds with a failure', () => {
      const errorResponseStatusMatcher = { status: 500 };

      beforeEach(() => {
        serverMock.onGet().reply(500);
      });

      it('should call alertError with the status', () =>
        dbListUpdater.updateDBList(baseUrl, appState).should.be.fulfilled.then(() => {
          sinon.assert.calledOnce(errorNotifierStub);
          sinon.assert.calledWithMatch(errorNotifierStub, errorResponseStatusMatcher);

          sinon.assert.notCalled(replaceCurrentDbNameActionGeneratorStub);
          sinon.assert.notCalled(replaceDbNamesActionGeneratorStub);
          sinon.assert.notCalled(stateDispatchStub);
        }));
    });

    context('when the server responds with success', () => {
      const dbNamesTestString = 'dbNames';
      const currentDbNameTestString = 'currentDb';
      const dbNamesActionResult = 'dbNamesActionResult';
      const currentDbNameActionResult = 'currentDbNameActionResult';

      beforeEach(() => {
        serverMock.onGet().reply(200, {
          dbNames: dbNamesTestString,
          currentDbName: currentDbNameTestString,
        });
        replaceCurrentDbNameActionGeneratorStub.withArgs(currentDbNameTestString)
                                                    .returns(currentDbNameActionResult);
        replaceDbNamesActionGeneratorStub.withArgs(dbNamesTestString)
                                                    .returns(dbNamesActionResult);
      });

      it('should create a replaceCurrentDbNameActionGenerator with the new current database name', () =>
        dbListUpdater.updateDBList(baseUrl, appState).should.be.fulfilled.then(() => {
          sinon.assert.calledOnce(replaceCurrentDbNameActionGeneratorStub);
          sinon.assert.calledWith(replaceCurrentDbNameActionGeneratorStub,
                                  currentDbNameTestString);
        }));

      it('should create a replaceDbNamesActionGenerator with the new current database name', () =>
        dbListUpdater.updateDBList(baseUrl, appState).should.be.fulfilled.then(() => {
          sinon.assert.calledOnce(replaceDbNamesActionGeneratorStub);
          sinon.assert.calledWith(replaceDbNamesActionGeneratorStub,
                                  dbNamesTestString);
        }));

      it('should dispatch the replaceCurrentDbNameAction to the appState', () =>
        dbListUpdater.updateDBList(baseUrl, appState).should.be.fulfilled.then(() => {
          sinon.assert.calledTwice(stateDispatchStub);
          sinon.assert.calledWith(stateDispatchStub, currentDbNameActionResult);
        }));

      it('should dispatch the replaceDbNamesAction to the appState', () =>
        dbListUpdater.updateDBList(baseUrl, appState).should.be.fulfilled.then(() => {
          sinon.assert.calledTwice(stateDispatchStub);
          sinon.assert.calledWith(stateDispatchStub, dbNamesActionResult);
        }));
    });
  });

  describe('#getDbListListener', () => {
    let jquery;
    let select;

    jsdom();

    beforeEach(() => {
      // eslint-disable-next-line global-require
      jquery = require('jquery');
      global.$ = jquery(window);
      select = $('<select></select>');
      select.attr('id', 'database-select');
      $(document.body).append(select);
    });

    afterEach(() => {
      $(document.body).empty();
      global.$ = jquery;
    });

    context('if there is no appState', () => {
      it('should throw the appropriate error', () => {
        expect(() => {
          dbListUpdater.getDbListListener(undefined);
        }).to.throw(Error, ErrorMessages.INVALID_APP_STATE);
      });
    });

    context('if there is an appState', () => {
      let currentDbName;
      let dbNames;
      let currentDbNameActionGenerator;
      let dbNamesActionGenerator;
      let emptyCurrentDbNameActionGenerator;
      let emptyDbNamesActionGenerator;

      beforeEach(() => {
        dbNames = ['database a', 'database b', 'database c'];
        currentDbName = 'database a';
        currentDbNameActionGenerator = actionGenerators
                                              .replaceCurrentDbNameActionGenerator(currentDbName);
        dbNamesActionGenerator = actionGenerators.replaceDbNamesActionGenerator(dbNames);
        appState.dispatch(currentDbNameActionGenerator);
        appState.dispatch(dbNamesActionGenerator);
        emptyCurrentDbNameActionGenerator = actionGenerators.replaceCurrentDbNameActionGenerator('');
        emptyDbNamesActionGenerator = actionGenerators.replaceDbNamesActionGenerator([]);
      });

      describe('should return a listener that', () => {
        it('empties the selector', () => {
          appState.dispatch(emptyCurrentDbNameActionGenerator);
          appState.dispatch(emptyDbNamesActionGenerator);
          select.empty();
          select.append($('<option></option>'));
          expect(select.children().length).to.eql(1);
          dbListUpdater.getDbListListener(appState)();
          expect(select.children().length).to.eql(0);
        });

        it('adds an option for each database to the selector', () => {
          dbListUpdater.getDbListListener(appState)();
          expect(select.children('option').length).to.eql(dbNames.length);
        });

        it('sets the current database as the selected database', () => {
          dbListUpdater.getDbListListener(appState)();
          const selectedChildren = select.children('option:selected');
          expect(selectedChildren.length).to.eql(1);
          expect(selectedChildren.val()).to.eql(currentDbName);
        });
      });
    });
  });
});
