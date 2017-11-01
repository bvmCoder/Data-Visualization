const chai = require('chai');
const PaperZoomer = require('../../../app/plugins/PaperZoomer').PaperZoomer;
const EventStub = require('../../../test/stubs/EventStub');
const sinon = require('sinon');
const jointjs = require('jointjs');
const ErrorMessages = require('../../../app/utility/messages').ErrorMessages;

const expect = chai.expect;

describe('PaperZoomer', () => {
  let paperStub;
  let zoomer;
  let evt;
  const SCALING_FACTOR = 0.05;
  const MIN_SCALE = 0.25;
  const MAX_SCALE = 2;
  const setup = () => {
    paperStub = sinon.createStubInstance(jointjs.dia.Paper);
    zoomer = new PaperZoomer(paperStub);
    evt = new EventStub();
  };

  describe('#constructor', () => {
    beforeEach(setup);

    context('when given a paper', () => {
      let addEvents;
      let setPaper;

      beforeEach(() => {
        addEvents = sinon.spy(PaperZoomer.prototype, 'addEvents');
        setPaper = sinon.spy(PaperZoomer.prototype, 'setPaper');
        zoomer = new PaperZoomer(paperStub);
      });

      afterEach(() => {
        addEvents.restore();
        setPaper.restore();
      });

      it('should call setPaper with the paper', () => {
        sinon.assert.calledOnce(setPaper);
        sinon.assert.calledWith(setPaper, paperStub);
      });

      it('should properly set the scaling factor', () => {
        expect(zoomer.SCALING_FACTOR).to.eql(SCALING_FACTOR);
      });

      it('should properly set the minimum scale', () => {
        expect(zoomer.MIN_SCALE).to.eql(MIN_SCALE);
      });

      it('should properly set the maximum scale', () => {
        expect(zoomer.MAX_SCALE).to.eql(MAX_SCALE);
      });

      it('should call addEvents', () => {
        sinon.assert.calledOnce(addEvents);
      });
    });

    context('when given a null paper', () => {
      it('should throw an error', () => {
        expect(() => {
          zoomer = new PaperZoomer(null);
        }).to.throw(Error, ErrorMessages.INVALID_PAPER.ZOOMER);
      });
    });

    context('when given an undefined paper', () => {
      it('should throw an error', () => {
        expect(() => {
          zoomer = new PaperZoomer(undefined);
        }).to.throw(Error, ErrorMessages.INVALID_PAPER.ZOOMER);
      });
    });
  });

  describe('#addEvents', () => {
    beforeEach(() => {
      const addEvents = sinon.stub(PaperZoomer.prototype, 'addEvents')
                              .callsFake(() => {});
      zoomer = new PaperZoomer(paperStub);
      addEvents.restore();
    });

    context('if the paper is null', () => {
      it('should throw an error', () => {
        zoomer.paper = null;
        expect(() => {
          zoomer.addEvents();
        }).to.throw(Error, ErrorMessages.INVALID_PAPER.ZOOMER);
      });
    });

    context('if the paper is undefined', () => {
      it('should throw an error', () => {
        zoomer.paper = undefined;
        expect(() => {
          zoomer.addEvents();
        }).to.throw(Error, ErrorMessages.INVALID_PAPER.ZOOMER);
      });
    });

    context('if there is a paper', () => {
      it('should attach the blankMouseWheelHandler to the paper', () => {
        zoomer.addEvents();
        sinon.assert.calledWith(paperStub.on, 'blank:mousewheel', zoomer.blankMouseWheelHandler);
      });

      it('should attach the cellMouseWheelHandler to the paper', () => {
        zoomer.addEvents();
        sinon.assert.calledWith(paperStub.on, 'cell:mousewheel', zoomer.cellMouseWheelHandler);
      });
    });
  });

  describe('#setPaper', () => {
    before(setup);

    it('should set the paper', () => {
      paperStub = sinon.createStubInstance(jointjs.dia.Paper);
      paperStub.testValue = true;
      zoomer.setPaper(paperStub);
      expect(zoomer.paper).to.eql(paperStub);
    });
  });

  describe('#getPaper', () => {
    before(setup);

    it('should get the paper', () => {
      paperStub = sinon.createStubInstance(jointjs.dia.Paper);
      paperStub.testValue = true;
      zoomer.paper = paperStub;
      expect(zoomer.getPaper()).to.eql(paperStub);
    });
  });

  describe('#hasPaper', () => {
    beforeEach(setup);

    context('when the paper is null', () => {
      it('should return false', () => {
        zoomer = new PaperZoomer(paperStub);
        zoomer.paper = null;
        expect(zoomer.hasPaper()).to.eql(false);
      });
    });

    context('when the paper is undefined', () => {
      it('should return false', () => {
        zoomer = new PaperZoomer(paperStub);
        zoomer.paper = undefined;
        expect(zoomer.hasPaper()).to.eql(false);
      });
    });

    context('when the zoomer has a paper', () => {
      it('should return true', () => {
        expect(zoomer.hasPaper()).to.eql(true);
      });
    });
  });

  describe('#zoom', () => {
    let preventDefault;
    let scale;
    let delta;

    beforeEach(() => {
      setup();

      preventDefault = sinon.spy(evt, 'preventDefault');
      delta = 1;
      scale = { x: 1, y: 1 };
      paperStub.scale.returns({ sx: scale.x, sy: scale.y });
    });

    context('if the paper is null', () => {
      it('should throw an error', () => {
        zoomer.paper = null;
        expect(() => {
          zoomer.zoom();
        }).to.throw(Error, ErrorMessages.INVALID_PAPER.ZOOMER);
      });
    });

    context('if the paper is undefined', () => {
      it('should throw an error', () => {
        zoomer.paper = undefined;
        expect(() => {
          zoomer.zoom();
        }).to.throw(Error, ErrorMessages.INVALID_PAPER.ZOOMER);
      });
    });

    context('if the zoomer has a paper', () => {
      context('if the evt object is null', () => {
        it('should throw an error', () => {
          expect(() => {
            zoomer.zoom(null, 1);
          }).to.throw(Error, ErrorMessages.INVALID_EVT_OBJECT);
        });
      });

      context('if the evt object is undefined', () => {
        it('should throw an error', () => {
          expect(() => {
            zoomer.zoom(undefined, 1);
          }).to.throw(Error, ErrorMessages.INVALID_EVT_OBJECT);
        });
      });

      context('if an evt object is given', () => {
        it('should call preventDefault', () => {
          zoomer.zoom(evt, -1);
          sinon.assert.calledOnce(preventDefault);
        });

        context('when the delta is negative', () => {
          context('and the scale is going to be greater than the minimum', () => {
            it('should decrease the scale by the scaling factor', () => {
              zoomer.zoom(evt, -1);
              sinon.assert.calledWith(paperStub.scale,
                                      scale.x - (delta * zoomer.SCALING_FACTOR),
                                      scale.y - (delta * zoomer.SCALING_FACTOR));
            });
          });

          context('and the scale is going to meet the minimum', () => {
            it('should be set equal to the minimum', () => {
              zoomer.zoom(evt, (zoomer.MIN_SCALE - scale.x) / zoomer.SCALING_FACTOR);
              sinon.assert.calledWith(paperStub.scale,
                                      zoomer.MIN_SCALE,
                                      zoomer.MIN_SCALE);
            });
          });

          context('and the scale is going to be less than the minimum', () => {
            it('should be set equal to the minimum', () => {
              zoomer.zoom(evt, -(scale.x / zoomer.SCALING_FACTOR));
              sinon.assert.calledWith(paperStub.scale,
                                      zoomer.MIN_SCALE,
                                      zoomer.MIN_SCALE);
            });
          });
        });

        context('when the delta is zero', () => {
          it('should not change the scale', () => {
            zoomer.zoom(evt, 0);
            sinon.assert.calledWith(paperStub.scale,
                                    scale.x,
                                    scale.y);
          });
        });

        context('when the delta is positive', () => {
          context('and the scale is going to be less than the maximum', () => {
            it('should increase the scale by the scaling factor', () => {
              zoomer.zoom(evt, 1);
              sinon.assert.calledWith(paperStub.scale,
                                      scale.x + (delta * zoomer.SCALING_FACTOR),
                                      scale.y + (delta * zoomer.SCALING_FACTOR));
            });
          });

          context('and the scale is going to meet the maximum', () => {
            it('should be set equal to the maximum', () => {
              zoomer.zoom(evt, (zoomer.MAX_SCALE - scale.x) / zoomer.SCALING_FACTOR);
              sinon.assert.calledWith(paperStub.scale,
                                      zoomer.MAX_SCALE,
                                      zoomer.MAX_SCALE);
            });
          });

          context('and the scale is going to exceed the maximum', () => {
            it('should be set equal to the maximum', () => {
              zoomer.zoom(evt, zoomer.MAX_SCALE / zoomer.SCALING_FACTOR);
              sinon.assert.calledWith(paperStub.scale,
                                      zoomer.MAX_SCALE,
                                      zoomer.MAX_SCALE);
            });
          });
        });
      });
    });
  });

  describe('#blankMouseWheelHandler', () => {
    let zoom;
    let delta;

    beforeEach(() => {
      setup();

      zoom = sinon.stub(zoomer, 'zoom');
      delta = 1;
    });

    afterEach(() => {
      zoom.restore();
    });

    it('should invoke the zoom function', () => {
      zoomer.blankMouseWheelHandler(evt, 0, 0, delta);
      sinon.assert.calledOnce(zoom);
      sinon.assert.calledWith(zoom, evt, delta);
    });
  });

  describe('#cellMouseWheelHandler', () => {
    let zoom;
    let delta;

    beforeEach(() => {
      setup();

      zoom = sinon.stub(zoomer, 'zoom');
      delta = 1;
    });

    afterEach(() => {
      zoom.restore();
    });

    it('should invoke the zoom function', () => {
      zoomer.cellMouseWheelHandler({}, evt, 0, 0, delta);
      sinon.assert.calledOnce(zoom);
      sinon.assert.calledWith(zoom, evt, delta);
    });
  });
});
