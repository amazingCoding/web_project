const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const path = require('path')
const { appDir } = require('./config')
const nodeModuleDir = path.resolve(process.cwd(), 'node_module')
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
// to fix some node_modules cant use in es5, like recoil
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

const getCssModuleLoader = (isDev) => {
  return {
    loader: 'css-loader',
    options: {
      modules: {
        localIdentName: isDev ? '[local]__[hash:base64:5]' : '[hash:base64:16]'
      },
    }
  }
}
const getModulesStyleRule = (isDev) => {
  return {
    test: new RegExp(`^(?!.*\\.common).*\\.css`),
    use: [
      isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
      getCssModuleLoader(isDev),
      postCssLoader
    ],
    include: [appDir]
  }
}
const getCommonStyleRule = (isDev) => {
  return {
    test: new RegExp(`^(.*\\.common).*\\.css`),
    use: [
      isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
      getCssModuleLoader(isDev),
      postCssLoader
    ],
    include: [appDir]
  }
}
const getFileRule = (isDev, assestPathName) => {
  return {
    test: /\.(png|svg|jpg|gif|woff|woff2)$/,
    use: [{
      loader: 'url-loader',
      options: isDev ? { limit: 2500 } : { limit: 2500, outputPath: assestPathName, publicPath: `/${assestPathName}` },
    }],
    include: [appDir],
    exclude: [nodeModuleDir]
  }
}

module.exports = {
  typeScriptRule,
  javaScriptRule,
  getModulesStyleRule,
  getCommonStyleRule,
  getFileRule
}