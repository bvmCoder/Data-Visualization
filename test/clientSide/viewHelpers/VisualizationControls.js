const VisualizationControls = require('../../../clientSide/viewHelpers/VisualizationControls');
const chai = require('chai');
const jsdom = require('mocha-jsdom');
const jquery = require('jquery');
const sinon = require('sinon');
const ErrorMessages = require('../../../app/utility/messages').ErrorMessages;

const expect = chai.expect;

describe('VisualizationControls', () => {
  const VALID_CONTAINER_ID = 'visualization-wrapper';
  const VALID_CONTAINER = `#${VALID_CONTAINER_ID}`;
  const INVALID_CONTAINER = '#invalid-container';
  let container;
  let controls;

  jsdom();

  before(() => {
    global.$ = jquery(window);
  });

  after(() => {
    delete global.$;
  });

  beforeEach(() => {
    container = $('<div></div>');
    container.attr('id', VALID_CONTAINER_ID);
    $(document.body).append(container);
    controls = new VisualizationControls(VALID_CONTAINER);
  });

  afterEach(() => {
    $(document.body).empty();
  });

  describe('#constructor', () => {
    context('when a falsy container is provided', () => {
      it('should throw the appropriate error', () => {
        expect(() => {
          controls = new VisualizationControls(undefined);
        }).to.throw(Error, ErrorMessages.INVALID_OR_MISSING_CONTAINER);
      });
    });

    context('when a container is provided that does not exist in the page', () => {
      it('should throw the appropriate error', () => {
        expect(() => {
          controls = new VisualizationControls(INVALID_CONTAINER);
        }).to.throw(Error, ErrorMessages.INVALID_OR_MISSING_CONTAINER);
      });
    });

    context('when a valid container is provided', () => {
      it('should define the button', () => {
        expect(controls).to.have.property('button');
        /* eslint-disable no-unused-expressions */
        expect(controls.button.hasClass('btn')).to.be.true;
        expect(controls.button.hasClass('settings')).to.be.true;
        expect(controls.button.hasClass('dropdown-toggle')).to.be.true;
        /* eslint-enable no-unused-expressions */
        expect(controls.button.attr('data-toggle')).to.eql('dropdown');
      });

      it('should define the menu', () => {
        expect(controls).to.have.property('menu');
        /* eslint-disable no-unused-expressions */
        expect(controls.menu.hasClass('dropdown-menu')).to.be.true;
        expect(controls.menu.hasClass('dropdown-menu-right')).to.be.true;
        /* eslint-enable no-unused-expressions */
      });

      it('should define the menu list', () => {
        expect(controls).to.have.property('ul');
      });

      it('should append the menu list to the menu', () => {
        // eslint-disable-next-line no-unused-expressions
        expect(controls.menu.children('ul').length).to.eql(1);
      });

      it('should not add the GUI to the container', () => {
        expect($(VALID_CONTAINER).children('div#visualization-controls').length).to.eql(0);
      });
    });
  });

  describe('#createControlsElement', () => {
    let controlsElement;

    beforeEach(() => {
      controlsElement = controls.createControlsElement();
    });

    it('should add the GUI to the container', () => {
      expect(controls.container.children('div#visualization-controls').length).to.eql(1);
    });

    it('should append the button to the GUI', () => {
      expect(controlsElement.children('button.btn').length).to.eql(1);
    });

    it('should append the menu to the GUI', () => {
      expect(controlsElement.children('div.dropdown-menu').length).to.eql(1);
    });

    it('should return the GUI', () => {
      expect(controlsElement.attr('id')).to.eql('visualization-controls');
    });
  });

  describe('#addItem', () => {
    context('when falsy text is provided', () => {
      it('should throw the appropriate error', () => {
        expect(() => {
          controls.addItem(undefined);
        }).to.throw(Error, ErrorMessages.INVALID_OR_MISSING_MENU_TEXT);
      });
    });

    context('when valid text is provided', () => {
      const VALID_TEXT = 'Menu item';
      const VALID_ONCLICK = () => {};
      let createControlsElement;

      let jqueryStub;
      let ulAppendStub;
      let liClickSpy;
      const liStub = {
        text: () => {},
        click: () => {},
      };

      const liStubSetup = () => {
        controls.el = $('<div></div>');
        liClickSpy = sinon.spy(liStub, 'click');
        ulAppendStub = sinon.stub(controls.ul, 'append');
        jqueryStub = sinon.stub(global, '$');
        jqueryStub.withArgs('<li></li>').returns(liStub);
      };

      const liStubTeardown = () => {
        liClickSpy.restore();
        ulAppendStub.restore();
        jqueryStub.restore();
      };

      beforeEach(() => {
        createControlsElement = sinon.spy(controls, 'createControlsElement');
      });

      afterEach(() => {
        createControlsElement.restore();
      });

      context('if the controls element has not been defined', () => {
        it('should call createControlsElement', () => {
          controls.addItem(VALID_TEXT, VALID_ONCLICK);
          sinon.assert.calledOnce(createControlsElement);
        });
      });

      context('if the controls element has been defined', () => {
        beforeEach(() => {
          controls.el = $('<div></div>');
        });

        it('should not call createControlsElement', () => {
          controls.addItem(VALID_TEXT, VALID_ONCLICK);
          sinon.assert.notCalled(createControlsElement);
        });
      });

      it('should append a list item to the list', () => {
        controls.addItem(VALID_TEXT, VALID_ONCLICK);
        expect(controls.ul.children('li').length).to.eql(1);
      });

      it('should apply the text to the list item', () => {
        const li = controls.addItem(VALID_TEXT, VALID_ONCLICK);
        expect(li.text()).to.eql(VALID_TEXT);
      });

      context('and a falsy onClick parameter is provided', () => {
        beforeEach(liStubSetup);

        afterEach(liStubTeardown);

        it('should not attach an onClick method to the list item', () => {
          controls.addItem(VALID_TEXT, undefined);
          sinon.assert.notCalled(liClickSpy);
        });
      });

      context('and a valid onClick method is provided', () => {
        beforeEach(liStubSetup);

        afterEach(liStubTeardown);

        it('should attach the onClick method to the list item', () => {
          controls.addItem(VALID_TEXT, VALID_ONCLICK);
          sinon.assert.calledOnce(liClickSpy);
          sinon.assert.calledWith(liClickSpy, VALID_ONCLICK);
        });
      });

      it('should return the list item', () => {
        liStubSetup();
        expect(controls.addItem(VALID_TEXT, VALID_ONCLICK)).to.eql(liStub);
        liStubTeardown();
      });
    });
  });

  context('#addSearch', () => {
    const VALID_PLACEHOLDER = 'Search...';

    context('when a falsy placeholder is provided', () => {
      it('should throw the appropriate error', () => {
        expect(() => {
          controls.addSearch(undefined);
        }).to.throw(Error, ErrorMessages.INVALID_OR_MISSING_PLACEHOLDER_TEXT);
      });
    });

    context('when a valid placeholder is provided', () => {
      context('if the controls element has not been defined', () => {
        let createControlsElement;

        beforeEach(() => {
          createControlsElement = sinon.spy(controls, 'createControlsElement');
        });

        afterEach(() => {
          createControlsElement.restore();
        });

        it('should call createControlsElement', () => {
          controls.addSearch(VALID_PLACEHOLDER);
          sinon.assert.calledOnce(createControlsElement);
        });
      });

      context('if the controls element has been defined', () => {
        let createControlsElement;

        beforeEach(() => {
          controls.el = $('<div></div>');
          createControlsElement = sinon.spy(controls, 'createControlsElement');
        });

        afterEach(() => {
          createControlsElement.restore();
        });

        it('should call createControlsElement', () => {
          controls.addSearch(VALID_PLACEHOLDER);
          sinon.assert.notCalled(createControlsElement);
        });
      });

      it('should append a text input to the menu', () => {
        controls.addSearch(VALID_PLACEHOLDER);
        expect(controls.menu.children('input').length).to.eql(1);
        expect(controls.menu.children('input').attr('type')).to.eql('text');
      });

      it('should apply the placeholder to the input', () => {
        const input = controls.addSearch(VALID_PLACEHOLDER);
        expect(input.attr('placeholder')).to.eql(VALID_PLACEHOLDER);
      });

      it('should return the input', () => {
        controls.el = $('<div></div>');
        const fakeInput = {
          attr: () => {},
        };
        const jqueryStub = sinon.stub(global, '$');
        jqueryStub.withArgs('<input></input>').returns(fakeInput);
        expect(controls.addSearch(VALID_PLACEHOLDER)).to.eql(fakeInput);
        jqueryStub.restore();
      });
    });
  });
});
