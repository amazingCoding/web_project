const path = require('path')
const fs = require('fs')
// check dll file
const checkDLL = () => {
  let dllName = null
  try {
    const arr = fs.readdirSync(path.resolve(process.cwd(), 'dll'))
    if (arr.length > 0) {
      for (let i = 0; i < arr.length; i++) {
        if (arr[i].endsWith('.js') && arr[i].startsWith('dll.')) {
          dllName = arr[i]
          break
        }
      }
    }
  } catch (error) { 
  }
  return dllName
}

// get dev server config
const getDevServer = ({ port, host, proxy }) => {
  return devServer = {
    port, host,
    compress: true,
    hot: true,
    contentBase: path.resolve(process.cwd(), 'build'),
    historyApiFallback: true,
    proxy
  }
}
// 

module.exports = {
  checkDLL,
  getDevServer
}