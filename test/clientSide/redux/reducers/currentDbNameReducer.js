const chai = require('chai');

chai.should();
const expect = chai.expect;

const contractErrorStringGenerator =
  require('../../../testing_utils').contractErrorStringGenerator;

const currentDbNameReducer =
  require('../../../../clientSide/redux/reducers/currentDbNameReducer')
          .currentDbNameReducer;

describe('dbNamesReducer', () => {
  context('when the current state is not an object', () => {
    it('should throw the appropriate error', () => {
      expect(() => {
        currentDbNameReducer(null, null);
      }).to.throw(TypeError,
        contractErrorStringGenerator('currentState', 'Object', 'Null', 'null'));
    });
  });

  context('when the action type is not known', () => {
    it('should return a state identical to the previous state', () => {
      const prevState = { testString: 'previousState' };
      const newState = currentDbNameReducer(prevState, { type: ' _UNKNOWN_TYPE_' });
      expect(newState).to.eql(prevState);
    });
  });

  context('when the action is of type REPLACE_CURRENT_DATABASE_NAME', () => {
    const prevState = {};
    const typeObj = { type: 'REPLACE_CURRENT_DATABASE_NAME' };
    let dbInfo;
    let expectedCurrentDbName;

    context('and action.currentDbName is not a string', () => {
      beforeEach(() => {
        expectedCurrentDbName = null;
        dbInfo = {};
        dbInfo.currentDbName = expectedCurrentDbName;
      });

      it('should throw the appropriate error', () => {
        expect(() => {
          currentDbNameReducer(prevState, Object.assign({}, dbInfo, typeObj));
        }).to.throw(contractErrorStringGenerator('action.currentDbName', 'String', 'Null', 'null'));
      });
    });

    context('and action.currentDbName is an empty string', () => {
      beforeEach(() => {
        expectedCurrentDbName = '';
        dbInfo = {};
        dbInfo.currentDbName = expectedCurrentDbName;
      });

      it('should return a state with currentDb as an empty string', () => {
        const newState = currentDbNameReducer(prevState, Object.assign({}, dbInfo, typeObj));
        expect(newState.currentDbName).to.eql(expectedCurrentDbName);
      });
    });

    context('and action.currentDbName is a database name', () => {
      beforeEach(() => {
        expectedCurrentDbName = 'database a';
        dbInfo = {};
        dbInfo.currentDbName = expectedCurrentDbName;
      });

      it('should return a state with currentDb as a database name', () => {
        const newState = currentDbNameReducer(prevState, Object.assign({}, dbInfo, typeObj));
        expect(newState.currentDbName).to.eql(expectedCurrentDbName);
      });
    });
  });
});
