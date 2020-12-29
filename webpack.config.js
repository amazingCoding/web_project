/**
 * webpack 配置
 * dev/dep 环境
 */
const path = require('path')
const fs = require('fs')
const process = require('process')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const InlineChunkHtmlPlugin = require('./webpack/InlineChunkHtmlPlugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin')
const appDir = path.resolve(process.cwd(), 'app')
const nodeModuleDir = path.resolve(process.cwd(), 'node_module')
// 开发服务器配置
const ip = require('ip')

const port = 8080
const host = ip.address()
const proxy = {
  '/api': {
    target: 'http://localhost:3000',
    changeOrigin: true,
  }
}
const devServer = {
  port, host,
  compress: true,
  hot: true,
  contentBase: path.resolve(process.cwd(), 'build'),
  historyApiFallback: true,
  proxy
}
// dep 导出文件配置
const outputPathName = 'build'// 打包目录
const assestPathName = 'assets' // 静态文件目录
const publicPath = '/' // 线上静态URL
const outputPath = path.resolve(process.cwd(), outputPathName)
// 检查是否打包了 dll 文件 
const checkDLL = () => {
  let dllName = null
  try {
    const arr = fs.readdirSync('dll')
    if (arr.length > 0) {
      for (let i = 0; i < arr.length; i++) {
        if (arr[i].endsWith('.js') && arr[i].startsWith('dll.')) {
          dllName = arr[i]
          break
        }
      }
    }
  } catch (error) { }
  return dllName
}
// postCss 配置
const postCssLoader = {
  loader: 'postcss-loader',
  options: { postcssOptions: { plugins: [['autoprefixer']] } }
}
// ts/js rule
const presets = [
  "@babel/preset-react",
  [
    "@babel/preset-env",
    {
      "useBuiltIns": "usage",
      "corejs": "3.0.0"
    }
  ]
]
const typeScriptRule = {
  test: /\.ts(x?)$/,
  use: {
    loader: 'babel-loader',
    options: {
      presets: [
        "@babel/preset-typescript",
        ...presets
      ],
      "plugins": [
        "@babel/plugin-proposal-class-properties"
      ]
    }
  },
  include: [appDir],
}
const javaScriptRule = {
  test: /\.js(x?)$/,
  use: {
    loader: 'babel-loader',
    options: {
      presets,
      "plugins": [
        "@babel/plugin-proposal-class-properties"
      ]
    }
  },
  include: [path.resolve(process.cwd(), 'node_modules/recoil')],
}
// html Plugin 配置
const baseHtmlWebpackPluginConfig = {
  filename: `index.html`,
  title: 'title',
  template: path.join(appDir, 'app.html'),
  inject: true
}

module.exports = async (env) => {
  const isDev = env.NODE_ENV === 'dev'
  // webpack mode 设置
  const mode = isDev ? 'development' : 'production'
  // 根据 isDev 配置 css / file 的 Rule
  const cssModuleLoader = {
    loader: 'css-loader',
    options: {
      modules: {
        // 开发环境 local name 需要展示出来才方便调试
        localIdentName: isDev ? '[local]__[hash:base64:5]' : '[hash:base64]'
      },
    }
  }
  const modulesStyleRule = {
    test: new RegExp(`^(?!.*\\.common).*\\.css`),
    use: [
      isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
      cssModuleLoader,
      postCssLoader
    ],
    include: [appDir]
  }
  const commonStyleRule = {
    test: new RegExp(`^(.*\\.common).*\\.css`),
    use: [
      isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
      'css-loader',
      postCssLoader
    ],
    include: [appDir]
  }
  const fileRule = {
    test: /\.(png|svg|jpg|gif|woff|woff2)$/,
    use: [{
      loader: 'url-loader',
      options: isDev ? { limit: 2500 } : {
        limit: 2500,
        outputPath: assestPathName,
        publicPath: `/${assestPathName}`
      },
    }],
    include: [appDir],
    exclude: [nodeModuleDir]
  }
  // 基础配置
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
        modulesStyleRule,
        commonStyleRule,
        fileRule
      ]
    }
  }
  let config = null
  if (isDev) {
    config = {
      ...baseConfig,
      devServer,
      output: { publicPath: '/' },
      devtool: 'source-map',
      plugins: [
        new webpack.DefinePlugin({ __DEV__: isDev }),
        new webpack.HotModuleReplacementPlugin(),
        new HtmlWebpackPlugin({
          ...baseHtmlWebpackPluginConfig,
          chunks: ['app']
        })
      ],
    }
  }
  else {
    const dllName = checkDLL()
    if (!dllName) {
      console.log('请先打包 DLL  文件');
      return null
    }
    const dllReferencePlugin = new webpack.DllReferencePlugin({
      context: process.cwd(),
      manifest: require('./dll/dll.manifest.json')
    })
    config = {
      ...baseConfig,
      // devtool: 'source-map',
      output: {
        path: outputPath,
        chunkFilename: assestPathName + `/[name].[chunkhash:5].js`,
        publicPath,
        filename: assestPathName + `/[name].[chunkhash:5].js`
      },
      optimization: {
        minimize: true,
        minimizer: [
          new TerserPlugin({
            extractComments: false,
            parallel: true,
            terserOptions: {
              format: {
                comments: false,
              },
              compress: {
                drop_console: true,
                drop_debugger: true,
              },
            }
          }),
          new OptimizeCSSAssetsPlugin({})
        ],
        runtimeChunk: { name: 'runtime' },
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            // vendors: {
            //   name: 'vendors',
            //   test: /[\/]node_modules[\/]/,
            //   priority: -10
            // },
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
        new MiniCssExtractPlugin({ filename: assestPathName + `/[name].[chunkhash:5].css` }),
        new HtmlWebpackPlugin({
          ...baseHtmlWebpackPluginConfig,
          minify: {
            collapseWhitespace: true,
            conservativeCollapse: true
          },
          chunks: ['default', 'app']
        }),
        new InlineChunkHtmlPlugin(HtmlWebpackPlugin, [/runtime/]),
        new AddAssetHtmlPlugin({
          filepath: `./dll/${dllName}`,
          // 文件输出目录
          outputPath: assestPathName,
          // 脚本或链接标记的公共路径
          publicPath: `${publicPath}${assestPathName}`
        }),
      ]
    }
  }
  return config
}