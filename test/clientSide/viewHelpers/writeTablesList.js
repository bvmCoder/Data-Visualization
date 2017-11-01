const jsdom = require('mocha-jsdom');
const jquery = require('jquery');
const redux = require('redux');
const sinon = require('sinon');
const chai = require('chai');

chai.should();

const errorNotifier = require('../../../clientSide/viewHelpers/errorNotifier');
const codeUnderTest = require('../../../clientSide/viewHelpers/writeTablesList');

describe('writeTablesList', () => {
  const writeTablesList = codeUnderTest.writeTablesList;
  const tableModalId = 'testTableListModal';
  const tableModalIdentifier = `#${tableModalId}`;
  const expectedErrorMessage = 'An error occurred when trying to list the database\'s tables.\
      Try refreshing from the database as browser data may not exist.';
  const noTablesInDatabaseMessage = 'The database has no tables.';
  let testAppState;
  let stubbedGetState;
  let errorNotifierAlertErrorStub;
  jsdom();
  let modalSpy;
  beforeEach(() => {
    global.$ = jquery(window);
    sinon.stub(global, '$');
    global.$.callThrough();
    modalSpy = sinon.spy();
    global.$.withArgs(tableModalIdentifier).returns({ modal: modalSpy });
    errorNotifierAlertErrorStub = sinon.stub(errorNotifier, 'alertError');
    $('body').append(`
    <div id='${tableModalId}' class="modal fade" role="dialog">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header text-center">
            <h3 class="modal-title">Tables in Database</h3>
            <button type="button" class="close" data-dismiss="modal">&times;</button>
          </div>
          <div class="modal-body">
            <ul></ul>
          </div>
        </div>
      </div>
    </div>`);
    testAppState = redux.createStore(() => {});
  });
  afterEach(() => {
    global.$.restore();
    $('body').empty();
    errorNotifierAlertErrorStub.restore();
  });
  /*
   * Testing is based on 6 meaningful state combinations. 2 meaningful states come from the table
   * name list: empty and not-empty. 3 meaningful states comes from the modal/function
   * history: never called, called before with an empty table name list, and called before with a
   * non-empty table name list. This gives 3 * 2 combinations. What occurs during an error is also
   * tested. The results of an error are very unpredictable so an error occurring before is not
   * considered one of the meaningful input states.
   */
  context('When the list of table names is empty for the first call', () => {
    beforeEach(() => {
      stubbedGetState = sinon.stub(testAppState, 'getState').returns({ allMetadataReducer: { tableNames: [] } });
      writeTablesList(testAppState, tableModalIdentifier);
    });
    afterEach(() => {
      stubbedGetState.restore();
    });
    it('should show a message about the lack of database tables via the modal', () => {
      $(`${tableModalIdentifier} p`).text().should.equal(noTablesInDatabaseMessage);
    });
    it('should only show one message regarding the lack of tables', () => {
      $(`${tableModalIdentifier} p`).length.should.equal(1);
    });
    it('should not add any list items in the modal as no table names should be shown', () => {
      $(`${tableModalIdentifier} li`).length.should.equal(0);
    });
    it('should not call the error notifier', () => {
      sinon.assert.notCalled(errorNotifierAlertErrorStub);
    });
    it('should display the modal', () => {
      sinon.assert.calledOnce(modalSpy);
      sinon.assert.alwaysCalledWithExactly(modalSpy, 'show');
    });
  });
  context('When the list of table names is not empty for the first call', () => {
    const unsortedTableNamesList = ['encounter', 'person', '2 ^%', 'Person', 'purchase', 'person_', '@mail'];
    const sortedTableNamesList = ['2 ^%', '@mail', 'Person', 'encounter', 'person', 'person_', 'purchase'];
    beforeEach(() => {
      stubbedGetState = sinon.stub(testAppState, 'getState').returns(
        { allMetadataReducer: { tableNames: unsortedTableNamesList } });
      writeTablesList(testAppState, tableModalIdentifier);
    });
    afterEach(() => {
      stubbedGetState.restore();
    });
    it('should not show a message about the lack of database tables via the modal', () => {
      $(`${tableModalIdentifier} p`).length.should.equal(0);
    });
    it('should display the table names in alphanumeric order as list items', () => {
      $(`${tableModalIdentifier} li`).get().map(
        li => li.innerHTML).should.deep.equal(sortedTableNamesList);
    });
    it('should not call the error notifier', () => {
      sinon.assert.notCalled(errorNotifierAlertErrorStub);
    });
    it('should display the modal', () => {
      sinon.assert.calledOnce(modalSpy);
      sinon.assert.alwaysCalledWithExactly(modalSpy, 'show');
    });
  });
  context('When the list of table names is empty for two calls', () => {
    beforeEach(() => {
      stubbedGetState = sinon.stub(testAppState, 'getState').returns({ allMetadataReducer: { tableNames: [] } });
      writeTablesList(testAppState, tableModalIdentifier);
      writeTablesList(testAppState, tableModalIdentifier);
    });
    afterEach(() => {
      stubbedGetState.restore();
    });
    it('should show a message about the lack of database tables via the modal', () => {
      $(`${tableModalIdentifier} p`).text().should.equal(noTablesInDatabaseMessage);
    });
    it('should only show one message regarding the lack of tables', () => {
      $(`${tableModalIdentifier} p`).length.should.equal(1);
    });
    it('should not add any list items in the modal, as no table names should be shown', () => {
      $(`${tableModalIdentifier} li`).length.should.equal(0);
    });
    it('should not call the error notifier', () => {
      sinon.assert.notCalled(errorNotifierAlertErrorStub);
    });
    it('should display the modal twice', () => {
      sinon.assert.calledTwice(modalSpy);
      sinon.assert.alwaysCalledWithExactly(modalSpy, 'show');
    });
  });
  context('When the list of table names is not empty for two calls', () => {
    const unsortedTableNamesList1 = ['make', 'model', 'year'];
    const unsortedTableNamesList2 = ['encounter', 'person', '2 ^%', 'Person', 'purchase', 'person_', '@mail'];
    const sortedTableNamesList = ['2 ^%', '@mail', 'Person', 'encounter', 'person', 'person_', 'purchase'];
    beforeEach(() => {
      stubbedGetState = sinon.stub(testAppState, 'getState').returns(
        { allMetadataReducer: { tableNames: unsortedTableNamesList1 } });
      writeTablesList(testAppState, tableModalIdentifier);
      stubbedGetState.restore();
      stubbedGetState = sinon.stub(testAppState, 'getState').returns(
        { allMetadataReducer: { tableNames: unsortedTableNamesList2 } });
      writeTablesList(testAppState, tableModalIdentifier);
    });
    afterEach(() => {
      stubbedGetState.restore();
    });
    it('should not show a message about the lack of database tables via the modal', () => {
      $(`${tableModalIdentifier} p`).length.should.equal(0);
    });
    it('should display the table names in alphanumeric order as list items', () => {
      $(`${tableModalIdentifier} li`).get().map(
        li => li.innerHTML).should.deep.equal(sortedTableNamesList);
    });
    it('should not call the error notifier', () => {
      sinon.assert.notCalled(errorNotifierAlertErrorStub);
    });
    it('should display the modal', () => {
      sinon.assert.calledTwice(modalSpy);
      sinon.assert.alwaysCalledWithExactly(modalSpy, 'show');
    });
  });
  context('When the list of table names is empty and then not empty for two calls', () => {
    beforeEach(() => {
      stubbedGetState = sinon.stub(testAppState, 'getState').returns({ allMetadataReducer: { tableNames: [] } });
      writeTablesList(testAppState, tableModalIdentifier);
    });
    afterEach(() => {
      stubbedGetState.restore();
    });
    it('should show a message about the lack of database tables via the modal', () => {
      $(`${tableModalIdentifier} p`).text().should.equal(noTablesInDatabaseMessage);
    });
    it('should only show one message regarding the lack of tables', () => {
      $(`${tableModalIdentifier} p`).length.should.equal(1);
    });
    it('should not add any list items in the modal as no table names should be shown', () => {
      $(`${tableModalIdentifier} li`).length.should.equal(0);
    });
    it('should not call the error notifier', () => {
      sinon.assert.notCalled(errorNotifierAlertErrorStub);
    });
    it('should display the modal', () => {
      sinon.assert.calledOnce(modalSpy);
      sinon.assert.alwaysCalledWithExactly(modalSpy, 'show');
    });
  });
  context('When the list of table names is not empty and then empty for two calls', () => {
    const unsortedTableNamesList = ['encounter', 'person', '2 ^%', 'Person', 'purchase', 'person_', '@mail'];
    const sortedTableNamesList = ['2 ^%', '@mail', 'Person', 'encounter', 'person', 'person_', 'purchase'];
    beforeEach(() => {
      stubbedGetState = sinon.stub(testAppState, 'getState').returns(
        { allMetadataReducer: { tableNames: unsortedTableNamesList } });
      writeTablesList(testAppState, tableModalIdentifier);
    });
    afterEach(() => {
      stubbedGetState.restore();
    });
    it('should not show a message about the lack of database tables via the modal', () => {
      $(`${tableModalIdentifier} p`).length.should.equal(0);
    });
    it('should display the table names in alphanumeric order as list items', () => {
      $(`${tableModalIdentifier} li`).get().map(
        li => li.innerHTML).should.deep.equal(sortedTableNamesList);
    });
    it('should not call the error notifier', () => {
      sinon.assert.notCalled(errorNotifierAlertErrorStub);
    });
    it('should display the modal', () => {
      sinon.assert.calledOnce(modalSpy);
      sinon.assert.alwaysCalledWithExactly(modalSpy, 'show');
    });
  });
  context('When an error occurs', () => {
    beforeEach(() => {
      stubbedGetState = sinon.stub(testAppState, 'getState').throws();
      writeTablesList(testAppState, tableModalIdentifier);
    });
    afterEach(() => {
      stubbedGetState.restore();
    });
    it('should call the error notifier with a helpful error message', () => {
      sinon.assert.calledOnce(errorNotifierAlertErrorStub);
      sinon.assert.alwaysCalledWithExactly(
        errorNotifierAlertErrorStub, { message: expectedErrorMessage });
    });
  });
});
