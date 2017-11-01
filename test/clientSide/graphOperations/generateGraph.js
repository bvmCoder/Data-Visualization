const chai = require('chai');
const sinon = require('sinon');
const redux = require('redux');
const generateGraph = require('../../../clientSide/graphOperations/generateGraph');
const graphElementFactory = require('../../../app/utility/graphElementFactory');
const validCellsStub = require('../../stubs/graphElementStubs/validCells.json');
const validLinksStub = require('../../stubs/graphElementStubs/validLinks');
const GraphStub = require('../../stubs/GraphStub');
const jointjs = require('jointjs');
const errorNotifier = require('../../../clientSide/viewHelpers/errorNotifier');
const actionGenerators = require('../../../clientSide/redux/actionGenerators');

const expect = chai.expect;
describe('generateGraph', () => {
  const container = {};
  const replaceDisplayedMetadataActionTestString = 'REPLACE_DISPLAYED_METADATA_TEST_STRING';
  let addCells;
  let createPaper;
  let createGraph;
  let createPanner;
  let createZoomer;
  let directedGraph;
  let alertError;
  let mockGraph;
  let replaceDisplayedMetadataActionGeneratorStub;
  let testAppState;
  let testAppStateDispatchStub;
  beforeEach(() => {
    // Stub the addCells method to spy on the values passed in
    addCells = sinon.stub(GraphStub.prototype, 'addCells');

    // Stub the createJointJsPaper method to avoid errors with instantiating a paper object
    createPaper = sinon.stub(graphElementFactory, 'createJointJsPaper')
                        .callsFake(() => {});

    mockGraph = new GraphStub();

    // Stub the createJointJsGraph method to return a graph stub for spying
    createGraph = sinon.stub(graphElementFactory, 'createJointJsGraph')
                        .callsFake(() => mockGraph);

    // Stub the createJointJsPaperPanner method to avoid errors with undefined paper object
    createPanner = sinon.stub(graphElementFactory, 'createJointJsPaperPanner')
                        .callsFake(() => {});

    // Stub the createJointJsPaperZoomer method to avoid errors with an undefined paper object
    createZoomer = sinon.stub(graphElementFactory, 'createJointJsPaperZoomer')
                        .callsFake(() => {});
    // Stub errorNotifier's alertError method to avoid errors with jquery
    alertError = sinon.stub(errorNotifier, 'alertError')
                      .callsFake(() => {});

    // Stub directed graph plugin
    directedGraph = sinon.stub(jointjs.layout.DirectedGraph, 'layout')
                          .callsFake(() => {});

    replaceDisplayedMetadataActionGeneratorStub = sinon.stub(actionGenerators,
      'replaceDisplayedMetadataActionGenerator').callsFake(
      () => replaceDisplayedMetadataActionTestString);

    testAppState = redux.createStore(() => {});
    testAppStateDispatchStub = sinon.stub(testAppState, 'dispatch');
  });

  afterEach(() => {
    // Restore stubbed methods to the originals
    addCells.restore();
    createPaper.restore();
    createGraph.restore();
    createPanner.restore();
    createZoomer.restore();
    alertError.restore();
    directedGraph.restore();
    replaceDisplayedMetadataActionGeneratorStub.restore();
    testAppStateDispatchStub.restore();
  });

  context('When no error occurs', () => {
    beforeEach(() => {
      // Generate the graph with the stubbed data
      generateGraph.generateGraph(validCellsStub, validLinksStub, container, testAppState);
    });

    it('should generate jointJs links and cells with properties of original links and cells', () => {
      // The cells that were generated and passed into the graph.addCells method
      const finalCellsPassedIn = addCells.getCall(0).args[0];
      // The links that were generated and passed into the graph.addCells method
      const finalLinksPassedIn = addCells.getCall(1).args[0];

      // Map the cell names that were generated to verify with original names passed in
      const cellNameMap = finalCellsPassedIn.map(cell => cell.attributes.name);

      // Ensure that final cells have the same name property of originals
      validCellsStub.forEach((cell, cellIndex) => {
        expect(cell.tableName).to.eql(cellNameMap[cellIndex]);
      });

      // Ensure that the final links have the same source and destination cell as originals
      finalLinksPassedIn.forEach((link, linkIndex) => {
        // Final cell id created by jointJs corresponding to original cell listed as source
        const correspondingSourceCellId =
          finalCellsPassedIn[validLinksStub[linkIndex].source].id;
        // Final cell id created by jointJs corresponding to original cell listed as destination
        const correspondingDestinationCellId =
          finalCellsPassedIn[validLinksStub[linkIndex].destination].id;

        // Check that the jointJS id of the source and destination cells are equal to the cells' ids
        // at the source and destination index from the original link
        expect(link.attributes.source.id).to.eql(correspondingSourceCellId);
        expect(link.attributes.target.id).to.eql(correspondingDestinationCellId);
      });
    });

    it('should generate the same number of jointJs links and cells as were passed in', () => {
      // The cells that were generated and passed into the graph.addCells method
      const finalCellsPassedIn = addCells.getCall(0).args[0];
      // The links that were generated and passed into the graph.addCells method
      const finalLinksPassedIn = addCells.getCall(1).args[0];

      expect(finalCellsPassedIn.length).to.eql(validCellsStub.length);
      expect(finalLinksPassedIn.length).to.eql(validLinksStub.length);
    });

    it('should call the directedGraph plugin to spread out tables', () => {
      sinon.assert.calledOnce(directedGraph);
      sinon.assert.calledWith(directedGraph, mockGraph, { setLinkVertices: false });
    });
    it('should call replaceDisplayedMetadataActionGenerator with the valid cells and links lists', () => {
      sinon.assert.calledOnce(replaceDisplayedMetadataActionGeneratorStub);
      sinon.assert.calledWithExactly(
        replaceDisplayedMetadataActionGeneratorStub, validCellsStub, validLinksStub);
    });
    it('should call app state\'s dispatch with replaceDisplayMetadataActionGenerator\'s result', () => {
      sinon.assert.calledOnce(testAppStateDispatchStub);
      sinon.assert.calledWithExactly(
        testAppStateDispatchStub, replaceDisplayedMetadataActionTestString);
    });
  });

  context('when there is any error', () => {
    let error;
    let generateGraphError;

    before(() => {
      error = new Error('addCells error');
      generateGraphError = new Error(`Error generating the graph: ${error.message}`);
    });
    it('should call alertError with the appropriate error', () => {
      addCells.restore();
      addCells = sinon.stub(GraphStub.prototype, 'addCells')
                      .throws(error);

      generateGraph.generateGraph(validCellsStub, validLinksStub, container);

      expect(alertError.args[0][0]).to.eql(generateGraphError);
    });
  });
});
