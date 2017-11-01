/**
 * Webpack configuration in production mode
 */
const path = require('path');

module.exports = {
  entry: './clientSide/index.js',
  cache: true,
  output: {
    path: path.resolve(__dirname, './public/js/'),
    filename: 'bundle.js',
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['env'],
        },
      },
    ],
  },
  target: 'web',
};
