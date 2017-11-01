const Knex = require('knex');
const sinon = require('sinon');
const Random = require('random-js');
const largeDB = require('../../../migrations/large_db/20170911095500_large_db');
const TableStub = require('../../stubs/largeDBStubs/TableStub');
const expect = require('chai').expect;
const ErrorMessages = require('../../../app/utility/messages').ErrorMessages;

describe('large_db', () => {
  let knexStub;
  let randomInteger;
  let tableStub;
  let randomNumberGenerator;
  let mt19937;
  const NUM_TABLES = 10;
  const ACTUAL_NUM_TABLES = 100;
  const DEFAULT_I = NUM_TABLES - 1;
  const SEED = 91217;

  const expectErrorSucc = errorMessage => () => Promise.reject(
    new Error(`Expected to throw ${errorMessage}`));

  const expectErrorFail = errorMessage => (reason) => {
    if (reason.message !== errorMessage) {
      return Promise.reject(
        new Error(
          `Expected to throw ${errorMessage}. Instead threw ${reason.message}`));
    }
    return Promise.resolve();
  };

  beforeEach(() => {
    tableStub = new TableStub(`table_${DEFAULT_I}`);
    knexStub = sinon.createStubInstance(Knex);
    knexStub.schema = {};
    knexStub.schema.createTable = sinon.spy((name, callback) => {
      callback(tableStub);
      return Promise.resolve();
    });
    knexStub.schema.dropTable = sinon.spy(() => Promise.resolve());
    randomInteger = sinon.stub(Random, 'integer')
                          .callsFake(() => () => 0);
    randomNumberGenerator = {};
    randomNumberGenerator.seed = sinon.spy(() => {});
    mt19937 = sinon.stub(Random.engines, 'mt19937')
                    .callsFake(() => randomNumberGenerator);
  });

  afterEach(() => {
    randomInteger.restore();
    mt19937.restore();
  });

  describe('#defineTable', () => {
    context('if the table is undefined', () => {
      context('if the index is negative', () => {
        it('should throw the appropriate error', () => {
          expect(() => {
            largeDB.defineTable(undefined, -1);
          }).to.throw(Error, ErrorMessages.INVALID_ARGUMENT_TABLE_EXPECTED);
        });
      });

      context('if the index is zero', () => {
        it('should throw the appropriate error', () => {
          expect(() => {
            largeDB.defineTable(undefined, 0);
          }).to.throw(Error, ErrorMessages.INVALID_ARGUMENT_TABLE_EXPECTED);
        });
      });

      context('if the index is positive', () => {
        it('should throw the appropriate error', () => {
          expect(() => {
            largeDB.defineTable(undefined, DEFAULT_I);
          }).to.throw(Error, ErrorMessages.INVALID_ARGUMENT_TABLE_EXPECTED);
        });
      });
    });

    context('if the table is defined', () => {
      context('if the index is negative', () => {
        it('should throw the appropriate error', () => {
          expect(() => {
            largeDB.defineTable(tableStub, -1);
          }).to.throw(Error, ErrorMessages.INDEX_OUT_OF_BOUNDS);
        });
      });

      context('if the index is non-negative', () => {
        context('if the random number generator is undefined', () => {
          it('should throw the appropriate error', () => {
            expect(() => {
              largeDB.defineTable(tableStub, DEFAULT_I);
            }).to.throw(Error, ErrorMessages.UNDEFINED_RNG);
          });
        });

        context('if the random number generator is defined', () => {
          beforeEach(() => largeDB.generate(knexStub, 0));

          it('should define an integer id', () => {
            largeDB.defineTable(tableStub, DEFAULT_I);
            expect(tableStub.getColumn(`table_${DEFAULT_I}_id`)).to.not.eql(undefined);
          });

          context('should define the id as', () => {
            it('not nullable', () => {
              largeDB.defineTable(tableStub, DEFAULT_I);
              expect(tableStub.getColumn(`table_${DEFAULT_I}_id`).isNullable).to.eql(false);
            });

            it('unique', () => {
              largeDB.defineTable(tableStub, DEFAULT_I);
              expect(tableStub.getColumn(`table_${DEFAULT_I}_id`).isUnique).to.eql(true);
            });

            it('primary', () => {
              largeDB.defineTable(tableStub, DEFAULT_I);
              expect(tableStub.getColumn(`table_${DEFAULT_I}_id`).isPrimary).to.eql(true);
            });
          });

          context('if the index is positive', () => {
            it('should randomly select a table to reference', () => {
              largeDB.defineTable(tableStub, DEFAULT_I);
              sinon.assert.calledOnce(randomInteger);
              expect(tableStub.getColumnCount()).to.eql(2);
            });
          });

          context('if the index is zero', () => {
            it('should not select a table to reference', () => {
              largeDB.defineTable(tableStub, 0);
              sinon.assert.notCalled(randomInteger);
              expect(tableStub.getColumnCount()).to.eql(1);
            });
          });
        });
      });
    });
  });

  describe('#generate', () => {
    let defineTable;

    beforeEach(() => {
      defineTable = sinon.stub(largeDB, 'defineTable')
                          .callsFake(() => {});
    });

    afterEach(() => {
      defineTable.restore();
    });

    context('if the knex object is undefined', () => {
      context('if the number of tables is negative', () => {
        it('should throw the appropriate error',
          () => largeDB.generate(undefined, -1)
                .then(expectErrorSucc(ErrorMessages.INVALID_ARGUMENT_KNEX_OBJECT),
                      expectErrorFail(ErrorMessages.INVALID_ARGUMENT_KNEX_OBJECT)));
      });

      context('if the number of tables is zero', () => {
        it('should throw the appropriate error',
          () => largeDB.generate(undefined, 0)
                .then(expectErrorSucc(ErrorMessages.INVALID_ARGUMENT_KNEX_OBJECT),
                      expectErrorFail(ErrorMessages.INVALID_ARGUMENT_KNEX_OBJECT)));
      });

      context('if the number of tables is positive', () => {
        it('should throw the appropriate error',
          () => largeDB.generate(undefined, DEFAULT_I)
                .then(expectErrorSucc(ErrorMessages.INVALID_ARGUMENT_KNEX_OBJECT),
                      expectErrorFail(ErrorMessages.INVALID_ARGUMENT_KNEX_OBJECT)));
      });
    });

    context('if the knex object is defined', () => {
      context('if the number of tables is negative', () => {
        it('should throw the appropriate error',
          () => largeDB.generate(knexStub, -1)
                .then(expectErrorSucc(ErrorMessages.NUM_TABLES_MUST_BE_NON_NEGATIVE),
                      expectErrorFail(ErrorMessages.NUM_TABLES_MUST_BE_NON_NEGATIVE)));
      });

      context('if the number of tables is non-negative', () => {
        it('should seed the random number generator', (done) => {
          largeDB.generate(knexStub, 0).then(() => {
            sinon.assert.calledOnce(randomNumberGenerator.seed);
            sinon.assert.calledWith(randomNumberGenerator.seed, SEED);
            done();
          }, (reason) => {
            done(reason);
          });
        });

        context('if the number of tables is zero', () => {
          it('should never call createTable', (done) => {
            largeDB.generate(knexStub, 0).then(() => {
              sinon.assert.notCalled(knexStub.schema.createTable);
              done();
            }, (reason) => {
              done(reason);
            });
          });

          it('should never call defineTable', (done) => {
            largeDB.generate(knexStub, 0).then(() => {
              sinon.assert.notCalled(defineTable);
              done();
            }, (reason) => {
              done(reason);
            });
          });
        });

        context('if the number of tables is positive', () => {
          it('should call createTable once for every requested table', (done) => {
            largeDB.generate(knexStub, NUM_TABLES).then(() => {
              sinon.assert.callCount(knexStub.schema.createTable, NUM_TABLES);
              done();
            }, (reason) => {
              done(reason);
            });
          });

          it('should call #defineTable once for every requested table', (done) => {
            largeDB.generate(knexStub, NUM_TABLES).then(() => {
              sinon.assert.callCount(defineTable, NUM_TABLES);
              done();
            }, (reason) => {
              done(reason);
            });
          });
        });
      });
    });
  });

  describe('#destroy', () => {
    context('if the knex object is undefined', () => {
      context('if the number of tables is negative', () => {
        it('should throw the appropriate error',
          () => largeDB.destroy(undefined, -1)
                .then(expectErrorSucc(ErrorMessages.INVALID_ARGUMENT_KNEX_OBJECT),
                      expectErrorFail(ErrorMessages.INVALID_ARGUMENT_KNEX_OBJECT)));
      });

      context('if the number of tables is zero', () => {
        it('should throw the appropriate error',
          () => largeDB.destroy(undefined, 0)
                .then(expectErrorSucc(ErrorMessages.INVALID_ARGUMENT_KNEX_OBJECT),
                      expectErrorFail(ErrorMessages.INVALID_ARGUMENT_KNEX_OBJECT)));
      });

      context('if the number of tables is positive', () => {
        it('should throw the appropriate error',
          () => largeDB.destroy(undefined, DEFAULT_I)
                .then(expectErrorSucc(ErrorMessages.INVALID_ARGUMENT_KNEX_OBJECT),
                      expectErrorFail(ErrorMessages.INVALID_ARGUMENT_KNEX_OBJECT)));
      });
    });

    context('if the knex object is undefined', () => {
      context('if the number of tables is negative', () => {
        it('should throw the appropriate error',
          () => largeDB.destroy(knexStub, -1)
                .then(expectErrorSucc(ErrorMessages.NUM_TABLES_MUST_BE_NON_NEGATIVE),
                      expectErrorFail(ErrorMessages.NUM_TABLES_MUST_BE_NON_NEGATIVE)));
      });

      context('if the number of tables is zero', () => {
        it('should never call dropTable', (done) => {
          largeDB.destroy(knexStub, 0).then(() => {
            sinon.assert.notCalled(knexStub.schema.dropTable);
            done();
          }, (reason) => {
            done(reason);
          });
        });
      });

      context('if the number of tables is positive', () => {
        it('should call dropTable once for every requested table', (done) => {
          largeDB.destroy(knexStub, NUM_TABLES).then(() => {
            sinon.assert.callCount(knexStub.schema.dropTable, NUM_TABLES);
            done();
          }, (reason) => {
            done(reason);
          });
        });
      });
    });
  });

  describe('#up', () => {
    let generate;
    let generateResults;

    beforeEach(() => {
      generateResults = 'generate results';
      generate = sinon.stub(largeDB, 'generate')
                      .callsFake(() => generateResults);
    });

    afterEach(() => {
      generate.restore();
    });

    it('should call #generate with the proper arguments', () => {
      largeDB.up(knexStub);
      sinon.assert.calledOnce(generate);
      sinon.assert.calledWith(generate, knexStub, ACTUAL_NUM_TABLES);
    });

    it('should return the results of #generate', () => {
      expect(largeDB.up(knexStub)).to.eql(generateResults);
    });
  });

  describe('#down', () => {
    let destroy;
    let destroyResults;

    beforeEach(() => {
      destroyResults = 'destroy results';
      destroy = sinon.stub(largeDB, 'destroy')
                      .callsFake(() => destroyResults);
    });

    afterEach(() => {
      destroy.restore();
    });

    it('should call #destroy with the proper arguments', () => {
      largeDB.down(knexStub);
      sinon.assert.calledOnce(destroy);
      sinon.assert.calledWith(destroy, knexStub, ACTUAL_NUM_TABLES);
    });

    it('should return the results of #destroy', () => {
      expect(largeDB.down(knexStub)).to.eql(destroyResults);
    });
  });
});
