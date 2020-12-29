const path = require('path')
const process = require('process')
const webpack = require('webpack')
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { terserPlugin } = require('./webpack/plugin');
module.exports = {
  mode: 'production',
  entry: {
    // DLL 库
    dll: ['react', 'react-dom']
  },
  output: {
    filename: '[name].[chunkhash:5].js',
    path: path.resolve(process.cwd(), 'dll'),
    library: '[name]'
  },
  optimization: {
    minimize: true,
    minimizer: [terserPlugin]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new webpack.DllPlugin({
      name: '[name]',
      path: path.resolve(process.cwd(), 'dll', '[name].manifest.json')
    }),
  ]
}