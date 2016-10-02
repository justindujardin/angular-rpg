const webpack = require('webpack');
const SpriteSheetPlugin = require('./../index');

module.exports = function (options) {
  return {
    entry: './test.entry.js',
    module: {
      loaders: [
        {
          test: /\.(jpg|png|gif)$/,
          loader: 'file'
        }
      ]
    },

    plugins: [
      new SpriteSheetPlugin([
        {inputs: 'items/*.png', output: 'items'}
      ])
    ],
    output: {
      path: 'dist',
      filename: '[name].bundle.js'
    }
  }
};
