const chai = require('chai');
const graphElementFactory = require('../../../app/utility/graphElementFactory');
const validCellsStub = require('../../stubs/graphElementStubs/validCells');
const validLinksStub = require('../../stubs/graphElementStubs/validLinks');
const defaultCellAttrs = require('../../../app/utility/defaultCellAttrs').defaultCellAttrs;
const defaultLinkAttrs = require('../../../app/utility/defaultLinkAttrs').defaultLinkAttrs;
const jointjs = require('jointjs');
const sinon = require('sinon');

const expect = chai.expect;

describe('graphElementFactory', () => {
  describe('#createJointJsCell', () => {
    context('when given a null or undefined cell', () => {
      it('should throw an error', () => {
        expect(() => {
          graphElementFactory.createJointJsCell(null);
        }).to.throw();
        expect(() => {
          graphElementFactory.createJointJsCell(undefined);
        }).to.throw();
      });
    });

    context('when given a correctly formatted cell', () => {
      let correctlyFormattedCell;
      beforeEach(() => {
        correctlyFormattedCell = validCellsStub[0];
      });

      it('should return a jointJsCell of the type uml.Class', () => {
        const jointJsCell = graphElementFactory.createJointJsCell(
          correctlyFormattedCell);

        // Check that the type returned was a uml.Class
        expect(jointJsCell.attributes.type).to.eql('uml.Class');
      });

      it('should return a jointJsCell with the default cell attributes', () => {
        const jointJsCell = graphElementFactory.createJointJsCell(
          correctlyFormattedCell);

        // Check that all the values of the jointJs Cell are set to the defaults that were given

        expect(jointJsCell.attributes.position).to.eql(defaultCellAttrs.rectanglePosition);
        expect(jointJsCell.attributes.attrs['.uml-class-name-rect'])
          .to.include(defaultCellAttrs.rectangleHeaderAttributes);
        expect(jointJsCell.attributes.attrs[
            '.uml-class-attrs-rect'])
          .to.include(defaultCellAttrs.rectangleBodyAttributes);
        expect(jointJsCell.attributes.attrs[
            '.uml-class-methods-rect'])
          .to.include(defaultCellAttrs.rectangleMethodsAttributes);
        expect(jointJsCell.attributes.attrs['.uml-class-attrs-text'])
          .to.include(defaultCellAttrs.textAttributes);
        expect(jointJsCell.attributes.z).to.eql(defaultCellAttrs.z);
      });

      context('when given a size parameter', () => {
        it('should set the size property of the returned cell to the given size', () => {
          const size = {
            width: 50,
            height: 100,
          };
          const jointJsCell = graphElementFactory.createJointJsCell(
            correctlyFormattedCell, null, size);
          // Check that the size of the returned jointJs Cell is the size given
          expect(jointJsCell.attributes.size).to.eql(size);
        });
      });

      context('when given a position parameter', () => {
        it(
          'should set the position property of the returned cell to the given position',
          () => {
            const position = {
              x: 50,
              y: 100,
            };
            const jointJsCell = graphElementFactory.createJointJsCell(
              correctlyFormattedCell, position);
            // Check that the size of the returned jointJs Cell is the size given
            expect(jointJsCell.attributes.position).to.eql(position);
          });
      });

      context('when given a cell with a table name shorter than all attribute strings', () => {
        it('should resize the cell to fit the longest attribute', () => {
          const cell = {
            id: 0,
            columns: ['column name longer'],
            tableName: 'table name',
          };
          const jointJsCell = graphElementFactory.createJointJsCell(cell);
          const fontSize = jointJsCell.attributes.attrs['.uml-class-name-text']['font-size'];
          const padding = defaultCellAttrs.resizingAttributes.padding;
          const scale = defaultCellAttrs.resizingAttributes.scale;
          const expectedWidth = (cell.columns[0].length * fontSize * scale) + padding;
          expect(jointJsCell.attributes.size.width).to.eql(expectedWidth);
        });
      });

      context('when given a cell with a table name equal to the longest attribute string', () => {
        it('should resize the cell to fit the table name', () => {
          const cell = {
            id: 0,
            columns: ['equal name'],
            tableName: 'equal name',
          };
          const jointJsCell = graphElementFactory.createJointJsCell(cell);
          const fontSize = jointJsCell.attributes.attrs['.uml-class-name-text']['font-size'];
          const padding = defaultCellAttrs.resizingAttributes.padding;
          const scale = defaultCellAttrs.resizingAttributes.scale;
          const expectedWidth = ((cell.tableName.length + 2) * fontSize * scale) + padding;
          expect(jointJsCell.attributes.size.width).to.eql(expectedWidth);
        });
      });

      context('when given a cell with a table name longer than all attribute strings', () => {
        it('should resize the cell to fit the table name', () => {
          const cell = {
            id: 0,
            columns: ['column name'],
            tableName: 'table name longer',
          };
          const jointJsCell = graphElementFactory.createJointJsCell(cell);
          const fontSize = jointJsCell.attributes.attrs['.uml-class-name-text']['font-size'];
          const padding = defaultCellAttrs.resizingAttributes.padding;
          const scale = defaultCellAttrs.resizingAttributes.scale;
          const expectedWidth = ((cell.tableName.length + 2) * fontSize * scale) + padding;
          expect(jointJsCell.attributes.size.width).to.eql(expectedWidth);
        });
      });
    });
  });

  describe('#createJointJsLink', () => {
    context('when given a null or undefined link', () => {
      it('should throw an error', () => {
        expect(() => {
          graphElementFactory.createJointJsLink(null);
        }).to.throw();
        expect(() => {
          graphElementFactory.createJointJsLink(undefined);
        }).to.throw();
      });
    });

    context('when given a correctly formatted link', () => {
      let correctlyFormattedLink;
      beforeEach(() => {
        correctlyFormattedLink = validLinksStub[0];
      });

      it('should return a jointJsLink of the type link', () => {
        const jointJsLink = graphElementFactory.createJointJsLink(
          correctlyFormattedLink);
        // Check that the type returned was a link
        expect(jointJsLink.attributes.type).to.eql('link');
      });

      it('should return a jointJsLink with the default link attributes', () => {
        const jointJsLink = graphElementFactory.createJointJsLink(
          correctlyFormattedLink);

        // Check that all the values of the jointJs Link are set to the defaults that were given
        expect(jointJsLink.attributes.attrs['.link-tools']).to.include(
          defaultLinkAttrs.linkToolAttributes);
        expect(jointJsLink.attributes.attrs['.connection']).to.include(
          defaultLinkAttrs.connectionAttributes);
        expect(jointJsLink.attributes.attrs['.marker-arrowheads']).to.include(
          defaultLinkAttrs.markerArrowheadAttributes);
        expect(jointJsLink.attributes.z).to.eql(defaultLinkAttrs.z);
      });
    });
  });

  describe('#createJointJsGraph', () => {
    it('should return a jointJsGraph that is an object and has a cells property', () => {
      const jointJsGraph = graphElementFactory.createJointJsGraph();

      // Check if the jointJsGraph object returned is an object
      expect(jointJsGraph).to.be.an('object');
      // Check if the jointJsGraph object returned has the cells property
      expect(jointJsGraph.attributes).to.have.any.key('cells');
    });
  });

  describe('#createJointJsPaper', () => {
    let graph;
    let container;
    const mockConstructor = () => {
      /* Stub the paper constructor (using the default constructor would require jquery - the way
       * the paper interacts with the dom is not of interest in these tests) */
      sinon.stub(jointjs.dia, 'Paper').callsFake(() => {});
    };
    const unmockConstructor = () => {
      jointjs.dia.Paper.restore();
    };

    beforeEach(() => {
      graph = graphElementFactory.createJointJsGraph();
      container = {
        width: 100,
        height: 100,
      };
    });

    context('when given a null graph', () => {
      beforeEach(mockConstructor);

      afterEach(unmockConstructor);

      context('and a null container', () => {
        it('should throw an error', () => {
          expect(() => {
            graphElementFactory.createJointJsPaper(null, null);
          }).to.throw();
        });
      });

      context('and an undefined container', () => {
        it('should throw an error', () => {
          expect(() => {
            graphElementFactory.createJointJsPaper(null, undefined);
          }).to.throw();
        });
      });

      context('and a defined container', () => {
        it('should throw an error', () => {
          expect(() => {
            graphElementFactory.createJointJsPaper(null, container);
          }).to.throw();
        });
      });
    });

    context('when given an undefined graph', () => {
      beforeEach(mockConstructor);

      afterEach(unmockConstructor);

      context('and a null container', () => {
        it('should throw an error', () => {
          expect(() => {
            graphElementFactory.createJointJsPaper(undefined, null);
          }).to.throw();
        });
      });

      context('and an undefined container', () => {
        it('should throw an error', () => {
          expect(() => {
            graphElementFactory.createJointJsPaper(undefined, undefined);
          }).to.throw();
        });
      });

      context('and a defined container', () => {
        it('should throw an error', () => {
          expect(() => {
            graphElementFactory.createJointJsPaper(undefined, container);
          }).to.throw();
        });
      });
    });

    context('when given a defined graph', () => {
      beforeEach(mockConstructor);

      afterEach(unmockConstructor);

      context('and a null container', () => {
        it('should throw an error', () => {
          expect(() => {
            graphElementFactory.createJointJsPaper(graph, null);
          }).to.throw();
        });
      });

      context('and an undefined container', () => {
        it('should throw an error', () => {
          expect(() => {
            graphElementFactory.createJointJsPaper(graph, undefined);
          }).to.throw();
        });
      });

      context('and a defined container', () => {
        it('should not throw any errors', () => {
          expect(() => {
            graphElementFactory.createJointJsPaper(graph, container);
          }).to.not.throw();
        });
      });
    });

    describe('interactive', () => {
      let paperConstructor;
      let interactive;
      let model;

      beforeEach(() => {
        // Stub the constructor for Paper to access the options object
        paperConstructor = sinon.stub(jointjs.dia, 'Paper').callsFake((opts) => {
          // Create a spy for 'interactive'
          interactive = sinon.spy(opts.interactive);
        });
      });

      afterEach(() => {
        paperConstructor.restore();
      });

      context('when given a cell view with a link model', () => {
        before(() => {
          // Make the model a link
          model = graphElementFactory.createJointJsLink(validLinksStub[0]);
        });

        it('should return an object with a property vertexAdd set to false', () => {
          graphElementFactory.createJointJsPaper(true, true);
          interactive({ model: model });
          expect(interactive.returned({ vertexAdd: false })).to.eql(true);
        });
      });

      context('when given a cell view with a model that is not a link', () => {
        before(() => {
          // Make the model a cell
          model = graphElementFactory.createJointJsCell(validCellsStub[0]);
        });

        it('should return true', () => {
          graphElementFactory.createJointJsPaper(true, true);
          interactive({ model: model });
          expect(interactive.returned(true)).to.eql(true);
        });
      });
    });
  });

  describe('#createJointJsPaperPanner', () => {
    context('when given a null paper', () => {
      it('should throw an error', () => {
        expect(() => {
          graphElementFactory.createJointJsPaperPanner(null);
        }).to.throw();
      });
    });

    context('when given an undefined paper', () => {
      it('should throw an error', () => {
        expect(() => {
          graphElementFactory.createJointJsPaperPanner(undefined);
        }).to.throw();
      });
    });

    context('when given a paper', () => {
      it('should return a properly formatted PaperPanner', () => {
        const paperStub = sinon.createStubInstance(jointjs.dia.Paper);
        const panner = graphElementFactory.createJointJsPaperPanner(paperStub);
        expect(panner.hasPaper()).to.eql(true);
      });
    });
  });

  describe('#createJointJsPaperZoomer', () => {
    context('when given a null paper', () => {
      it('should throw an error', () => {
        expect(() => {
          graphElementFactory.createJointJsPaperZoomer(null);
        }).to.throw();
      });
    });

    context('when given an undefined paper', () => {
      it('should throw an error', () => {
        expect(() => {
          graphElementFactory.createJointJsPaperZoomer(undefined);
        }).to.throw();
      });
    });

    context('when given a paper', () => {
      it('should return a properly formatted PaperZoomer', () => {
        const paperStub = sinon.createStubInstance(jointjs.dia.Paper);
        const zoomer = graphElementFactory.createJointJsPaperZoomer(paperStub);
        expect(zoomer.hasPaper()).to.eql(true);
      });
    });
  });
});
