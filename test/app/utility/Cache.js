const timekeeper = require('timekeeper');

const Cache = require('../../../app/utility/Cache');

const chai = require('chai');

const expect = chai.expect;

describe('Cache', () => {
  let cache;
  const testString = 'testKey';
  const testString2 = 'testKey2';
  const testObject = { value: 1 };
  const testObject2 = { value: 2 };
  const stdTTL = 10;
  const checkperiod = 9;

  beforeEach('set up a new cache', () => {
    cache = new Cache(stdTTL, checkperiod);
  });

  describe('saving and retrieving values', () => {
    context('when saving and retrieving a value', () => {
      it('should save the value and execute the success callback with the value', (done) => {
        cache.set(testString, testObject);
        expect(cache.get(testString, (val) => {
          expect(val).to.deep.equal(testObject);
          done();
        }, () => {
        }));
      });
    });

    context('when saving and retrieving multiple values with different keys', () => {
      it('should execute the success callback with the matching value to each key ', (done) => {
        cache.set(testString, testObject);
        cache.set(testString2, testObject2);
        expect(cache.get(testString, (val) => {
          expect(val).to.deep.equal(testObject);
        }, () => {
        }));
        expect(cache.get(testString2, (val) => {
          expect(val).to.deep.equal(testObject2);
          done();
        }, () => {
        }));
      });
    });

    context('when saving and retrieving multiple values with the same keys', () => {
      it('should execute the success callback with latest corresponding value', (done) => {
        cache.set(testString, testObject);
        cache.set(testString, testObject2);
        expect(cache.get(testString, (val) => {
          expect(val).to.deep.equal(testObject2);
          done();
        }, () => {
        }));
      });
    });

    context(`when a value is set with a key and time 
      passes beyond the max of the expiration time and checkperiod`, () => {
      it('after expiration the failure cb should be called', (done) => {
        cache.set(testString, testObject);
        const setTime = Date.now();
        timekeeper.travel(setTime + (Math.max(stdTTL, checkperiod) * 1001));
        cache.get(testString, () => {
        }, () => {
          timekeeper.reset();
          done();
        });
        timekeeper.reset();
      });
    });

    context('when attempting to retrieve a value with an unused key ', () => {
      it('should call the failure function on a miss', (done) => {
        expect(cache.get(testString, () => {
        }, () => {
          done();
        }));
      });
    });

    context('when an error occurs during a get', () => {
      it('should call the failure function with the error that occurred', (done) => {
        expect(cache.get(testObject, () => {
        }, (err) => {
          expect(err.name).to.deep.equal('EKEYTYPE');
          done();
        }));
      });
    });
  });
});
