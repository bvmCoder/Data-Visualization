/**
 * This stub is for use in mocking the jointjs.dia.graph class during testing
 */

function GraphStub() {}

GraphStub.prototype.addCells = (elements) => {
  this.elements = elements;
};

module.exports = GraphStub;
