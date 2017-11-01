// This is a container for default attributes for creating new jointJS links

module.exports.defaultLinkAttrs = {
  linkToolAttributes: {
    display: 'none',
  },
  connectionAttributes: {
    stroke: 'black',
    fill: 'transparent',
  },
  connectionWrapAttributes: {
    fill: 'transparent',
  },
  markerArrowheadAttributes: {
    display: 'none',
  },
  // The z for links is set to 0, so that they render below cells (z = 1)
  z: 0,
};
