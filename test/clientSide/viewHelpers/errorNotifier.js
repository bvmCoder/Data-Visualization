const jsdom = require('mocha-jsdom');
const expect = require('chai').expect;
const sinon = require('sinon');
const jquery = require('jquery');

const errorNotifier = require('../../../clientSide/viewHelpers/errorNotifier');

describe('errorNotifier', () => {
  describe('alertError', () => {
    let errorDiv;
    let errorDivId;
    jsdom();

    const errorObject = {
      message: 'testing_message',
    };

    before(() => {
      // eslint-enable-next-line global-require
      global.$ = jquery(window);
    });

    after(() => {
      delete global.$;
    });

    beforeEach(() => {
      // Simulate error-dock on document body
      errorDivId = 'error-dock';
      errorDiv = $(`<div id="${errorDivId}"></div>`);
      $('body').append(errorDiv);

      // There ought to be zero child elements upon initialization.
      expect($(errorDiv).children().length).to.equal(0);
    });

    afterEach(() => {
      $(errorDiv).remove();
    });

    describe('alert content', () => {
      context('the error has a message', () => {
        let errorMessage;
        beforeEach(() => {
          errorNotifier.alertError(errorObject, errorDivId);
          errorMessage = $(errorDiv).find('strong').text();
        });
        afterEach(() => {
          errorMessage = undefined;
        });
        it('should append an alert with the error\'s message to the error-dock', () => {
          expect(errorMessage).to.equal(errorObject.message);
        });
      });

      context('the error object parameter does not have a message', () => {
        let errorWithoutMessage;
        let foundErrorMessage;
        let defaultErrorMessage;
        beforeEach(() => {
          errorWithoutMessage = Object.assign({}, errorObject);
          delete errorWithoutMessage.message;
          errorNotifier.alertError(errorWithoutMessage, errorDivId);
          foundErrorMessage = $(errorDiv).find('strong').text();
          defaultErrorMessage = 'No message supplied.';
        });
        afterEach(() => {
          errorWithoutMessage = undefined;
          foundErrorMessage = undefined;
          defaultErrorMessage = undefined;
        });
        it('should append an alert with a missing message blurb to the error-dock', () => {
          expect(foundErrorMessage).to.equal(defaultErrorMessage);
        });
      });
    });

    describe('disappearance with time behavior', () => {
      let clock;
      const alertDuration = 1000; // in milliseconds
      beforeEach(() => {
        clock = sinon.useFakeTimers();
        errorNotifier.alertError(errorObject, errorDivId, alertDuration);
      });
      afterEach(() => {
        clock.restore();
      });
      context('time passed, since appending the alert, is less than the alert\'s duration', () => {
        beforeEach(() => {
          clock.tick(alertDuration - 1);
        });
        it('should still have the alert appended', () => {
          expect($(errorDiv).children().length).to.equal(1);
        });
      });

      context('time passed, since appending the alert, is equal to the alert\'s duration', () => {
        beforeEach(() => {
          clock.tick(alertDuration);
        });
        it('should no longer have the alert appended', () => {
          expect($(errorDiv).children().length).to.equal(0);
        });
      });

      context('time passed, since appending the alert, is greater than the alert\'s duration', () => {
        beforeEach(() => {
          clock.tick(alertDuration + 1);
        });
        it('should no longer have the alert appended', () => {
          expect($(errorDiv).children().length).to.equal(0);
        });
      });
    });
    describe('multiple calls behavior', () => {
      context('an alert is appended and before it disappears, another alert is appended', () => {
        const errorObject2 = {
          message: 'testing_message_2',
        };
        let clock;
        const alertDuration = 1000; // in milliseconds
        beforeEach(() => {
          clock = sinon.useFakeTimers();
          errorNotifier.alertError(errorObject, errorDivId, alertDuration);
          clock.tick(alertDuration / 2);
          errorNotifier.alertError(errorObject2, errorDivId, alertDuration);
        });
        afterEach(() => {
          clock.restore();
        });

        it('should only have one error displaying at a time', () => {
          expect($(errorDiv).children().length).to.equal(1);
        });
        it('should show the error message of the last error alertError was called with', () => {
          const errorMessage = $(errorDiv).find('strong').text();
          expect(errorMessage).to.equal(errorObject2.message);
        });
        it('should not remove the second alert prematurely', () => {
          clock.tick(alertDuration - 1);
          expect($(errorDiv).children().length).to.equal(1);
        });
        it('should remove the second alert after the alertDuration is met', () => {
          clock.tick(alertDuration);
          expect($(errorDiv).children().length).to.equal(0);
        });
      });
    });
  });
});
