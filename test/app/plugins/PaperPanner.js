const chai = require('chai');
const PaperPanner = require('../../../app/plugins/PaperPanner').PaperPanner;
const EventStub = require('../../../test/stubs/EventStub');
const sinon = require('sinon');
const jointjs = require('jointjs');
const ErrorMessages = require('../../../app/utility/messages').ErrorMessages;

const expect = chai.expect;

describe('PaperPanner', () => {
  let paperStub;
  let panner;
  // eslint-disable-next-line no-unused-vars
  let evt;

  const setup = () => {
    paperStub = sinon.createStubInstance(jointjs.dia.Paper);
    panner = new PaperPanner(paperStub);
    evt = new EventStub();
  };

  describe('#constructor', () => {
    beforeEach(setup);

    context('when given a paper', () => {
      it('should call setPaper with the paper', () => {
        const setPaper = sinon.spy(PaperPanner.prototype, 'setPaper');
        const otherPaperStub = sinon.createStubInstance(jointjs.dia.Paper);
        // eslint-disable-next-line no-new
        new PaperPanner(otherPaperStub);
        sinon.assert.calledOnce(setPaper);
        sinon.assert.calledWith(setPaper, otherPaperStub);
        setPaper.restore();
      });

      it('should call addEvents', () => {
        const addEvents = sinon.spy(PaperPanner.prototype, 'addEvents');
        const otherPaperStub = sinon.createStubInstance(jointjs.dia.Paper);
        // eslint-disable-next-line no-new
        new PaperPanner(otherPaperStub);
        sinon.assert.calledOnce(addEvents);
        addEvents.restore();
      });
    });

    context('when given a null paper', () => {
      it('should throw the appropriate error', () => {
        expect(() => {
          new PaperPanner(null).addEvents();
        }).to.throw(Error, ErrorMessages.INVALID_PAPER.PANNER);
      });
    });

    context('when given an undefined paper', () => {
      it('should throw an error', () => {
        expect(() => {
          new PaperPanner(undefined).addEvents();
        }).to.throw(Error, ErrorMessages.INVALID_PAPER.PANNER);
      });
    });
  });

  describe('#addEvents', () => {
    beforeEach(() => {
      setup();

      const addEvents = sinon.stub(PaperPanner.prototype, 'addEvents')
                        .callsFake(() => {});
      panner = new PaperPanner(paperStub);
      addEvents.restore();
    });

    context('when the paper is null', () => {
      it('should throw an error', () => {
        panner.paper = null;

        expect(() => {
          panner.addEvents();
        }).to.throw(Error, ErrorMessages.INVALID_PAPER.PANNER);
      });
    });

    context('when the paper is undefined', () => {
      it('should throw an error', () => {
        panner.paper = undefined;

        expect(() => {
          panner.addEvents();
        }).to.throw(Error, ErrorMessages.INVALID_PAPER.PANNER);
      });
    });

    context('when there is a paper', () => {
      it('should attach startPanning to the paper\'s pointerdown event', () => {
        panner.addEvents();

        sinon.assert.calledWith(paperStub.on, 'blank:pointerdown', panner.startPanning);
      });

      it('should attach stopPanning to the paper\'s pointerup event', () => {
        panner.addEvents();

        sinon.assert.calledWith(paperStub.on, 'blank:pointerup', panner.stopPanning);
      });
    });
  });

  describe('#setPaper', () => {
    before(setup);

    it('should set the paper', () => {
      const otherPaperStub = sinon.createStubInstance(jointjs.dia.Paper);
      otherPaperStub.testValue = true;
      panner.setPaper(otherPaperStub);
      expect(panner.paper).to.eql(otherPaperStub);
    });
  });

  describe('#getPaper', () => {
    before(setup);

    it('should get the paper', () => {
      const otherPaperStub = sinon.createStubInstance(jointjs.dia.Paper);
      otherPaperStub.testValue = true;
      panner.paper = otherPaperStub;
      expect(panner.getPaper()).to.eql(otherPaperStub);
    });
  });

  describe('#hasPaper', () => {
    beforeEach(setup);

    context('when the paper is null', () => {
      it('should return false', () => {
        const otherPanner = new PaperPanner(paperStub);
        otherPanner.paper = null;
        expect(otherPanner.hasPaper()).to.eql(false);
      });
    });

    context('when the paper is undefined', () => {
      it('should return false', () => {
        const otherPanner = new PaperPanner(paperStub);
        otherPanner.paper = undefined;
        expect(otherPanner.hasPaper()).to.eql(false);
      });
    });

    context('when there is a paper', () => {
      it('should return true', () => {
        expect(panner.hasPaper()).to.eql(true);
      });
    });
  });

  describe('#setStartOrigin', () => {
    beforeEach(setup);

    context('if the paper is null', () => {
      it('should throw an error', () => {
        panner.paper = null;
        expect(() => {
          panner.setStartOrigin();
        }).to.throw(Error, ErrorMessages.INVALID_PAPER.PANNER);
      });
    });

    context('if the paper is undefined', () => {
      it('should throw an error', () => {
        panner.paper = undefined;
        expect(() => {
          panner.setStartOrigin();
        }).to.throw(Error, ErrorMessages.INVALID_PAPER.PANNER);
      });
    });

    context('when there is a paper', () => {
      it('should set the startOrigin to the current origin of the paper', () => {
        const TX = 0;
        const TY = 0;
        paperStub.translate.returns({ tx: TX, ty: TY });
        panner.setStartOrigin();
        expect(panner.startOrigin).to.eql({
          x: TX,
          y: TY,
        });
      });
    });
  });


  describe('#updateOrigin', () => {
    before(setup);

    context('if the paper is null', () => {
      it('should throw an error', () => {
        panner.paper = null;
        expect(() => {
          panner.updateOrigin();
        }).to.throw(Error, ErrorMessages.INVALID_PAPER.PANNER);
      });
    });

    context('if the paper is undefined', () => {
      it('should throw an error', () => {
        panner.paper = undefined;
        expect(() => {
          panner.updateOrigin();
        }).to.throw(Error, ErrorMessages.INVALID_PAPER.PANNER);
      });
    });

    context('when there is a paper', () => {
      let oldMouse;
      let newMouse;
      let oldOrigin;
      let newOrigin;
      let difference;

      beforeEach(() => {
        setup();
        oldMouse = { x: 0, y: 0 };
        newMouse = { x: 0, y: 0 };
        oldOrigin = { x: 0, y: 0 };
        newOrigin = { x: 0, y: 0 };
        difference = 10;
      });

      context('when the difference between new and old mouse x is positive', () => {
        it('should decrease the paper origin x by the difference', () => {
          newMouse.x = oldMouse.x + difference;
          newOrigin.x = oldOrigin.x + difference;
          newOrigin.y = oldOrigin.y;
          panner.mousePosition = oldMouse;
          panner.startOrigin = oldOrigin;
          paperStub.translate.returns({
            tx: oldOrigin.x,
            ty: oldOrigin.y,
          });
          panner.updateOrigin(newMouse.x, newMouse.y);
          sinon.assert.calledWith(paperStub.translate, newOrigin.x, newOrigin.y);
        });
      });

      context('when the difference between new and old mouse x is negative', () => {
        it('should increase the paper origin x by the difference', () => {
          newMouse.x = oldMouse.x - difference;
          newOrigin.x = oldOrigin.x - difference;
          newOrigin.y = oldOrigin.y;
          panner.mousePosition = oldMouse;
          panner.startOrigin = oldOrigin;
          paperStub.translate.returns({
            tx: oldOrigin.x,
            ty: oldOrigin.y,
          });
          panner.updateOrigin(newMouse.x, newMouse.y);
          sinon.assert.calledWith(paperStub.translate, newOrigin.x, newOrigin.y);
        });
      });

      context('when new and old mouse x are the same', () => {
        it('the paper origin x should stay the same', () => {
          newMouse.x = oldMouse.x;
          newOrigin.x = oldOrigin.x;
          newOrigin.y = oldOrigin.y;
          panner.mousePosition = oldMouse;
          panner.startOrigin = oldOrigin;
          paperStub.translate.returns({
            tx: oldOrigin.x,
            ty: oldOrigin.y,
          });
          panner.updateOrigin(newMouse.x, newMouse.y);
          sinon.assert.calledWith(paperStub.translate, newOrigin.x, newOrigin.y);
        });
      });

      context('when the difference between new and old mouse y is positive', () => {
        it('should decrease the paper origin y by the difference', () => {
          newMouse.y = oldMouse.y + difference;
          newOrigin.x = oldOrigin.x;
          newOrigin.y = oldOrigin.y + difference;
          panner.mousePosition = oldMouse;
          panner.startOrigin = oldOrigin;
          paperStub.translate.returns({
            tx: oldOrigin.x,
            ty: oldOrigin.y,
          });
          panner.updateOrigin(newMouse.x, newMouse.y);
          sinon.assert.calledWith(paperStub.translate, newOrigin.x, newOrigin.y);
        });
      });

      context('when the difference between new and old mouse y is negative', () => {
        it('should increase the paper origin y by the difference', () => {
          newMouse.y = oldMouse.y - difference;
          newOrigin.x = oldOrigin.x;
          newOrigin.y = oldOrigin.y - difference;
          panner.mousePosition = oldMouse;
          panner.startOrigin = oldOrigin;
          paperStub.translate.returns({
            tx: oldOrigin.x,
            ty: oldOrigin.y,
          });
          panner.updateOrigin(newMouse.x, newMouse.y);
          sinon.assert.calledWith(paperStub.translate, newOrigin.x, newOrigin.y);
        });
      });

      context('when new and old mouse y are the same', () => {
        it('the paper origin y should stay the same', () => {
          newMouse.y = oldMouse.y;
          newOrigin.x = oldOrigin.x;
          newOrigin.y = oldOrigin.y;
          panner.mousePosition = oldMouse;
          panner.startOrigin = oldOrigin;
          paperStub.translate.returns({
            tx: oldOrigin.x,
            ty: oldOrigin.y,
          });
          panner.updateOrigin(newMouse.x, newMouse.y);
          sinon.assert.calledWith(paperStub.translate, newOrigin.x, newOrigin.y);
        });
      });
    });
  });

  describe('#setMousePosition', () => {
    before(setup);

    it('should set the mouse position', () => {
      const expectedPosition = {
        x: 100,
        y: 200,
      };
      panner.setMousePosition(expectedPosition.x, expectedPosition.y);
      expect(panner.mousePosition).to.eql(expectedPosition);
    });
  });

  describe('#startPanning', () => {
    let setMousePosition;
    let setStartOrigin;
    let svgAddEventListener;
    beforeEach(() => {
      setup();

      setMousePosition = sinon.spy(panner, 'setMousePosition');
      setStartOrigin = sinon.stub(panner, 'setStartOrigin')
                              .callsFake(() => {});
      paperStub.svg = { addEventListener: () => {} };
      svgAddEventListener = sinon.spy(paperStub.svg, 'addEventListener');
    });

    afterEach(() => {
      setMousePosition.restore();
      setStartOrigin.restore();
      svgAddEventListener.restore();
    });

    context('if the paper is undefined', () => {
      it('should throw an error', () => {
        panner.paper = undefined;

        expect(() => {
          panner.startPanning();
        }).to.throw(Error, ErrorMessages.INVALID_PAPER.PANNER);
      });
    });

    context('if the paper is null', () => {
      it('should throw an error', () => {
        panner.paper = null;

        expect(() => {
          panner.startPanning();
        }).to.throw(Error, ErrorMessages.INVALID_PAPER.PANNER);
      });
    });

    context('if there is a paper', () => {
      context('if the evt object is undefined', () => {
        it('should throw an error', () => {
          expect(() => {
            panner.startPanning(undefined);
          }).to.throw(Error, ErrorMessages.INVALID_EVT_OBJECT);
        });
      });

      context('if the evt object is null', () => {
        it('should throw an error', () => {
          expect(() => {
            panner.startPanning(null);
          }).to.throw(Error, ErrorMessages.INVALID_EVT_OBJECT);
        });
      });

      context('given an evt object', () => {
        it('should call setMousePosition with the clientX and clientY', () => {
          panner.startPanning(evt);
          sinon.assert.calledOnce(setMousePosition);
          sinon.assert.calledWith(setMousePosition, evt.clientX, evt.clientY);
        });

        it('should call setStartOrigin', () => {
          panner.startPanning(evt);
          sinon.assert.calledOnce(setStartOrigin);
        });

        it('should attach \'pan\' to the mousemove event of the paper\'s svg element', () => {
          panner.startPanning(evt);
          sinon.assert.calledOnce(svgAddEventListener);
          sinon.assert.calledWith(svgAddEventListener, 'mousemove', panner.pan);
        });
      });
    });
  });

  describe('#pan', () => {
    let preventDefault;
    let normalizeEvent;
    let updateOrigin;

    beforeEach(() => {
      setup();

      preventDefault = sinon.spy(evt, 'preventDefault');
      normalizeEvent = sinon.spy(jointjs.util, 'normalizeEvent');
      updateOrigin = sinon.stub(panner, 'updateOrigin')
                          .callsFake(() => {});
    });

    afterEach(() => {
      preventDefault.restore();
      normalizeEvent.restore();
      updateOrigin.restore();
    });

    context('if the paper is undefined', () => {
      it('should throw an error', () => {
        panner.paper = undefined;

        expect(() => {
          panner.pan();
        }).to.throw(Error, ErrorMessages.INVALID_PAPER.PANNER);
      });
    });

    context('if the paper is null', () => {
      it('should throw an error', () => {
        panner.paper = null;

        expect(() => {
          panner.pan();
        }).to.throw(Error, ErrorMessages.INVALID_PAPER.PANNER);
      });
    });

    context('if there is a paper', () => {
      context('if the evt object is undefined', () => {
        it('should throw an error', () => {
          expect(() => {
            panner.pan(null);
          }).to.throw(Error, ErrorMessages.INVALID_EVT_OBJECT);
        });
      });

      context('if the evt object is null', () => {
        it('should throw an error', () => {
          expect(() => {
            panner.pan(null);
          }).to.throw(Error, ErrorMessages.INVALID_EVT_OBJECT);
        });
      });

      context('given an evt object', () => {
        it('should call preventDefault on the evt object', () => {
          panner.pan(evt);

          sinon.assert.calledOnce(preventDefault);
        });

        it('should call the jointjs normalizeEvent utility', () => {
          panner.pan(evt);

          sinon.assert.calledOnce(normalizeEvent);
          sinon.assert.calledWith(normalizeEvent, evt);
        });

        it('should call updateOrigin with the clientX and clientY', () => {
          panner.pan(evt);

          sinon.assert.calledOnce(updateOrigin);
          sinon.assert.calledWith(updateOrigin, evt.clientX, evt.clientY);
        });
      });
    });
  });

  describe('#stopPanning', () => {
    let removeEventListener;

    beforeEach(() => {
      setup();

      paperStub.svg = { removeEventListener: () => {} };
      removeEventListener = sinon.spy(paperStub.svg, 'removeEventListener');
    });

    afterEach(() => {
      removeEventListener.restore();
    });

    context('if the paper is undefined', () => {
      it('should throw an error', () => {
        panner.paper = undefined;

        expect(() => {
          panner.stopPanning();
        }).to.throw(Error, ErrorMessages.INVALID_PAPER.PANNER);
      });
    });

    context('if the paper is null', () => {
      it('should throw an error', () => {
        panner.paper = null;

        expect(() => {
          panner.stopPanning();
        }).to.throw(Error, ErrorMessages.INVALID_PAPER.PANNER);
      });
    });

    context('if there is a paper', () => {
      it('should remove the event listener from the paper\'s svg', () => {
        panner.stopPanning();

        sinon.assert.calledOnce(removeEventListener);
        sinon.assert.calledWith(removeEventListener, 'mousemove', panner.pan);
      });
    });
  });
});
