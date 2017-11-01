const sinon = require('sinon');
const chai = require('chai');

const expect = chai.expect;
chai.use(require('chai-as-promised'));

chai.should();

const metadataController = require('./../../../app/controllers/metadata.controller');
const Cache = require('../../../app/utility/Cache');
const ErrorMessages = require('../../../app/utility/messages').ErrorMessages;
const databaseStubs = require('../../stubs/metadata.controller.stubs').databaseStubs;
const queryService = require('../../../app/services/query.service');

describe('Metadata Controller', () => {
  let runQuery;
  let queryYield;
  let expected;

  beforeEach(() => {
    runQuery = sinon.stub(queryService, 'runQuery');
  });

  afterEach(() => {
    runQuery.restore();
  });

  describe('#getAllTableMetadata', () => {
    const dbName = 'DATABASE';
    let cache;

    beforeEach('Set up the cache', () => {
      cache = new Cache();
    });

    context('when not given a cache object', () => {
      context('and not given a database name', () => {
        it('should be rejected with the appropriate error', () =>
          metadataController.getAllTableMetadata(undefined, undefined)
            .should.be.rejectedWith(Error, ErrorMessages.INVALID_OR_MISSING_CACHE_ARGUMENT));
      });

      context('and given a database name', () => {
        it('should be rejected with the appropriate error', () =>
          metadataController.getAllTableMetadata(undefined, dbName)
            .should.be.rejectedWith(Error, ErrorMessages.INVALID_OR_MISSING_CACHE_ARGUMENT));
      });
    });

    context('when given a cache object', () => {
      context('and not given a database name', () => {
        it('should be rejected with the appropriate error', () =>
          metadataController.getAllTableMetadata(cache, undefined)
            .should.be.rejectedWith(Error,
                                    ErrorMessages.INVALID_OR_MISSING_DATABASE_NAME_ARGUMENT));
      });

      context('and given a database name', () => {
        context('when database result is empty', () => {
          beforeEach(() => {
            queryYield = databaseStubs.EMPTY_RESULTS.databaseResultSet;
            expected = databaseStubs.EMPTY_RESULTS.expectedOutcome;
            runQuery.resolves(queryYield);
          });

          it('should return an empty array', () =>
            metadataController.getAllTableMetadata(cache, dbName)
              .should.be.fulfilled
              .then((result) => {
                sinon.assert.calledOnce(runQuery);
                expect(JSON.stringify(result))
                  .to.equal(JSON.stringify(expected));
              }));
        });

        context('when database result is only one tuple', () => {
          beforeEach(() => {
            queryYield = databaseStubs.ONE_RESULT.databaseResultSet;
            expected = databaseStubs.ONE_RESULT.expectedOutcome;
            runQuery.resolves(queryYield);
          });

          it('formats a table object with one column', () =>
            metadataController.getAllTableMetadata(cache, dbName)
              .should.be.fulfilled
              .then((result) => {
                sinon.assert.calledOnce(runQuery);
                expect(JSON.stringify(result))
                  .to.eql(JSON.stringify(expected));
              }));
        });

        context('when database result represents a one-to-one table relationship', () => {
          beforeEach(() => {
            queryYield = databaseStubs.ONE_TO_ONE.databaseResultSet;
            expected = databaseStubs.ONE_TO_ONE.expectedOutcome;
            runQuery.resolves(queryYield);
          });

          it('formats table objects with foreign keys on both relationship sides', () =>
            metadataController.getAllTableMetadata(cache, dbName)
              .should.be.fulfilled
              .then((result) => {
                sinon.assert.calledOnce(runQuery);
                expect(JSON.stringify(result))
                  .to.eql(JSON.stringify(expected));
              }));
        });

        context('when database result represents a one-to-many table relationship', () => {
          beforeEach(() => {
            queryYield = databaseStubs.ONE_TO_MANY.databaseResultSet;
            expected = databaseStubs.ONE_TO_MANY.expectedOutcome;
            runQuery.resolves(queryYield);
          });

          it('formats tables with foreign keys on the many side of relationship', () =>
            metadataController.getAllTableMetadata(cache, dbName)
              .should.be.fulfilled
              .then((result) => {
                sinon.assert.calledOnce(runQuery);
                expect(JSON.stringify(result))
                  .to.eql(JSON.stringify(expected));
              }));
        });

        context('when a query error is thrown', () => {
          let errorMessage;
          beforeEach(() => {
            errorMessage = 'Query Error';
            runQuery.rejects(new Error(errorMessage));
          });

          it('catches the query error and rejects', () =>
            metadataController.getAllTableMetadata(cache, dbName)
              .should.be.rejectedWith(Error, errorMessage));
        });
      });
    });
  });
});
