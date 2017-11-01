/**
 * This is a container for database connection types to visualize detailed
 * connections, such as one-to-many, many-to-one, etc; These are written in
 * a jointJS format
 */

// a function to create a circle path
const generateCircle = (cx, cy, r) => `M ${cx} ${cy} m -${r}, 0 a ${r},${r} 0 1,0 ${(r * 2)},0 a ${r},${r} 0 1,0 -${(r * 2)},0`;

module.exports.connectionTypes = {
  MANY: {
    name: 'MANY',
    stroke: 'black',
    fill: 'transparent',
    d: 'M 0 0 L 20 10 L 0 20 M 20 10 L 0 10',
  },
  ONE: {
    name: 'ONE',
    stroke: 'black',
    fill: 'transparent',
    d: 'M 10 0 L 10 20 M 10 10 L 0 10',
  },
  ONE_AND_ONLY_ONE: {
    name: 'ONE_AND_ONLY_ONE',
    stroke: 'black',
    fill: 'transparent',
    d: 'M 10 0 L 10 20 M 20 0 L 20 20 M 20 10 L 0 10',
  },
  ONE_OR_MANY: {
    name: 'ONE_OR_MANY',
    stroke: 'black',
    fill: 'transparent',
    d: 'M 0 0 L 20 10 L 0 20 M 0 10 L 20 10 L 20 0 L 20 20',
  },
  ZERO_OR_ONE: {
    name: 'ZERO_OR_ONE',
    stroke: 'black',
    fill: 'transparent',
    d: `M 10 0 L 10 20 M 15 10 L 0 10 ${generateCircle(25, 10, 10)}`,
  },
  ZERO_OR_MANY: {
    name: 'ZERO_OR_MANY',
    stroke: 'black',
    fill: 'transparent',
    d: `M 0 0 L 20 10 L 0 20 M 25 10 L 0 10 ${generateCircle(35, 10, 10)}`,
  },
};

