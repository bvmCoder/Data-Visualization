const databaseController = require('../../../app/controllers/database.controller');
const mysql = require('mysql');
const QueryManager = require('../../../app/controllers/query.manager');
const sinon = require('sinon');
const config = require('../../../config/config');
const ErrorFriendlyMessages = require('../../../app/utility/messages').ErrorFriendlyMessages;
const chai = require('chai');

const expect = chai.expect;
chai.should();

describe('database.controller', () => {
  let createConnection;

  let querySpy;

  let connectionStub;

  let oldConfig;
  let oldDb;

  let sqlQuery;

  const testError = new Error('Test error');
  const testResults = [{
    Database: 'database a',
  }, {
    Database: 'database b',
  }];
  const testDbNames = ['database a', 'database b'];
  const testCurrentDbName = 'database a';

  const req = {};
  let res;

  const ResponseStub = class {
    status() {
      return this;
    }

    send() {
      return this;
    }
  };

  let statusSpy;
  let sendSpy;

  const ConnectionStub = class {
    constructor() {
      this.error = undefined;
      this.results = testResults;
    }

    end() {
      return this;
    }

    query(query, callback) {
      return new Promise(() => {
        callback(this.error, this.results);
      });
    }
  };

  beforeEach(() => {
    res = new ResponseStub();
    statusSpy = sinon.spy(res, 'status');
    sendSpy = sinon.spy(res, 'send');
    connectionStub = new ConnectionStub();
    querySpy = sinon.spy(connectionStub, 'query');
    sqlQuery = new QueryManager().getListOfDatabasesQuery();
    createConnection = sinon.stub(mysql, 'createConnection')
                            .callsFake(() => connectionStub);
    oldConfig = config.dbName;
    config.dbName = testResults[0].Database;
    oldDb = config.db;
    config.db = `mysql://root:root@server/${config.dbName}`;
  });

  afterEach(() => {
    statusSpy.restore();
    sendSpy.restore();
    createConnection.restore();
    querySpy.restore();
    config.dbName = oldConfig;
    config.db = oldDb;
  });

  describe('#getListOfDatabases', () => {
    it('should establish a mySQL connection with the current database', () =>
      databaseController.getListOfDatabases(req, res).should.be.fulfilled.then(() => {
        sinon.assert.calledWith(createConnection, config.db);
      }));

    it('should query the connection with the proper mySQL query', () =>
      databaseController.getListOfDatabases(req, res).should.be.fulfilled.then(() => {
        sinon.assert.calledOnce(querySpy);
        expect(querySpy.args[0][0]).to.eql(sqlQuery);
      }));

    context('if there is not an error with the query', () => {
      it('should send status 200', () =>
        databaseController.getListOfDatabases(req, res).should.be.fulfilled.then(() => {
          sinon.assert.calledOnce(statusSpy);
          sinon.assert.calledWith(statusSpy, 200);
        }));

      it('should send the dbNames and the currentDb', () =>
        databaseController.getListOfDatabases(req, res).should.be.fulfilled.then(() => {
          sinon.assert.calledOnce(sendSpy);
          expect(sendSpy.args[0][0]).to.eql({
            dbNames: testDbNames,
            currentDbName: testCurrentDbName,
          });
        }));
    });

    context('if there is an error with the query', () => {
      beforeEach(() => {
        connectionStub.error = testError;
      });

      it('should send status 500', () =>
        databaseController.getListOfDatabases(req, res).should.be.fulfilled.then(() => {
          sinon.assert.calledOnce(statusSpy);
          sinon.assert.calledWith(statusSpy, 500);
        }));

      it('should send the proper error message and stack', () =>
        databaseController.getListOfDatabases(req, res).should.be.fulfilled.then(() => {
          sinon.assert.calledOnce(sendSpy);
          expect(sendSpy.args[0][0]).to.eql({
            message: ErrorFriendlyMessages.DATABASE_RETRIEVAL_ERROR,
            stack: testError.stack,
          });
        }));
    });
  });
});
