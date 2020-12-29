/**
 * webpack 配置
 * dev/dep 环境
 */
const path = require('path')
const process = require('process')
const webpack = require('webpack')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { checkDLL, getDevServer } = require('./webpack/helper')
const { typeScriptRule, javaScriptRule, getModulesStyleRule, getCommonStyleRule, getFileRule } = require('./webpack/loader')
const { terserPlugin, getInlineChunkHtmlPlugin, dllReferencePlugin,getHtmlWebpackPlugin } = require('./webpack/plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin')
const ip = require('ip')
const { appDir } = require('./webpack/config')
// 开发服务器配置
const DEV_SERVER_CONFIG = {
  host: ip.address(),
  port: 8080,
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
    }
  }
}
// 正式环境打包目录
const PRO_FILE_PATH = {
  outputPath: 'build',// build
  assestPath: 'assets', 
  /**
   * publicPath
   * 1. local html file : ''
   * 2. nginx little server : '/'
   * 3. cdn : 'https://cdn.com/xxx'
   */
  publicPath: ''
}
// dep 导出文件配置
module.exports = async (env) => {
  const isDev = env.NODE_ENV === 'dev'
  const mode = isDev ? 'development' : 'production'
  const baseConfig = {
    target: 'web',
    mode,
    entry: { 'app': [path.resolve(appDir, 'app.tsx')] },
    resolve: {
      extensions: [".ts", ".tsx", '.js']
    },
    module: {
      rules: [
        typeScriptRule,
        javaScriptRule,
        getModulesStyleRule(isDev),
        getCommonStyleRule(isDev),
        getFileRule(isDev, PRO_FILE_PATH.assestPath)
      ]
    }
  }
  let config = null
  if (isDev) {
    config = {
      ...baseConfig,
      devServer: getDevServer(DEV_SERVER_CONFIG),
      output: { publicPath: '/' },
      devtool: 'source-map',
      plugins: [
        new webpack.DefinePlugin({ __DEV__: isDev }),
        new webpack.HotModuleReplacementPlugin(),
        getHtmlWebpackPlugin(isDev)
      ],
    }
  }
  else {
    const dllName = checkDLL()
    const { outputPath, assestPath, publicPath } = PRO_FILE_PATH
    if (dllName === null) {
      console.log(`DLL file can't find`)
      return null
    }
    config = {
      ...baseConfig,
      output: {
        path: path.resolve(process.cwd(), outputPath),
        chunkFilename: assestPath + `/[name].[chunkhash:5].js`,
        publicPath: publicPath,
        filename: assestPath + `/[name].[chunkhash:5].js`
      },
      optimization: {
        minimize: true,
        minimizer: [
          terserPlugin,
          new OptimizeCSSAssetsPlugin({})
        ],
        runtimeChunk: { name: 'runtime' },
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: {
              name: 'default',
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
            }
          }
        }
      },
      plugins: [
        dllReferencePlugin,
        new webpack.DefinePlugin({ __DEV__: isDev }),
        new CleanWebpackPlugin(),
        new MiniCssExtractPlugin({ filename: assestPath + `/[name].[chunkhash:5].css` }),
        getHtmlWebpackPlugin(isDev),
        getInlineChunkHtmlPlugin(),
        new AddAssetHtmlPlugin({
          filepath: `./dll/${dllName}`,
          outputPath: assestPath,
          publicPath: `${publicPath}${assestPath}`
        }),
      ]
    }
  }
  return config
}