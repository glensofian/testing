const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
  entry: './src/views/main.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  module: {
    rules: [
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
      { test: /\.html$/, use: ['html-loader'] },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({ template: './index.html' }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'sw.js', to: '' },
        { from: 'manifest.webmanifest', to: '' },
        { from: 'icons', to: 'icons' },
      ],
    }),
  ],
  devServer: {
    static: './dist',
    open: true,
    port: 3000,
  },
};
