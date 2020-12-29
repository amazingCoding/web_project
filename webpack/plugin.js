const webpack = require('webpack')
const path = require('path')
const { appDir } = require('./config')
const TerserPlugin = require('terser-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const InlineChunkHtmlPlugin = require('./inline_chunk_html_plugin')
// html Plugin base config
const baseHtmlWebpackPluginConfig = {
  filename: `index.html`,
  template: path.join(appDir, 'app.html'),
  inject: true
}
const terserPlugin = new TerserPlugin({
  extractComments: false,
  parallel: true,
  terserOptions: {
    format: { comments: false },
    compress: { drop_console: true, drop_debugger: true },
  }
})
const getHtmlWebpackPlugin = (isDev) => {

  if (isDev) {
    return new HtmlWebpackPlugin({
      ...baseHtmlWebpackPluginConfig,
      chunks: ['app']
    })
  }
  return new HtmlWebpackPlugin({
    ...baseHtmlWebpackPluginConfig,
    minify: {
      collapseWhitespace: true,
      conservativeCollapse: true
    },
    chunks: ['default', 'app']
  })
}
const getInlineChunkHtmlPlugin = () => {
  return new InlineChunkHtmlPlugin(HtmlWebpackPlugin, [/runtime/])
}
const dllReferencePlugin = new webpack.DllReferencePlugin({
  context: process.cwd(),
  manifest: require('../dll/dll.manifest.json')
})

module.exports = {
  getHtmlWebpackPlugin,
  getInlineChunkHtmlPlugin,
  terserPlugin,
  dllReferencePlugin
}