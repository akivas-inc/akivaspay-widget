const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'akivaspay-widget.min.js',
    path: path.resolve(__dirname, 'dist'),
  },
};