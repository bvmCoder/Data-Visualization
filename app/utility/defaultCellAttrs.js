// This class is a container for default values to use when creating new jointJS cells

module.exports.defaultCellAttrs = {
  rectanglePosition: {
    x: 630,
    y: 190,
  },
  rectangleSize: {
    width: 'auto',
    height: 'auto',
  },
  rectangleHeaderAttributes: {
    fill: '#4caf43', // Cerner Green (subject to change)
    stroke: '#000000', // Border color
    'stroke-width': 0.5, // Border weight
  },
  rectangleBodyAttributes: {
    fill: '#1795d2', // Cerner Blue (suject to change)
    stroke: '#000000', // Border color
    'stroke-width': 0.5, // Border weight
  },
  rectangleMethodsAttributes: {
    display: 'none',
  },
  nameAttributes: {
    'font-family': 'sans-serif',
  },
  textAttributes: {
    fill: '#ffffff',
    'ref-y': 0.5,
    'y-alignment': 'middle',
    'font-family': 'sans-serif',
  },
  cursorAttributes: {
    cursor: 'move',
  },
  resizingAttributes: {
    padding: 10,
    scale: 0.5,
  },
  // The z for cells is set to 1, so that they render on top of links (z = 0)
  z: 1,
};
