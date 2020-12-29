const pkg = require('./package.json')
const { dependencies, devDependencies } = pkg
const dep = []
const dev = []
for (let key in dependencies) dep.push(key)
for (let key in devDependencies) dev.push(key)
console.log(`npm i --save ${dep.join(' ')}`);
console.log(`npm i --save-dev ${dev.join(' ')}`);
/*
npm i --save core-js react react-dom  regenerator-runtime whatwg-fetch
npm i --save-dev @babel/cli @babel/core @babel/preset-env @babel/preset-react @babel/preset-typescript @types/lodash @types/react @types/react-dom @types/react-redux @types/react-router-dom @types/redux-logger @typescript-eslint/eslint-plugin @typescript-eslint/parser add-asset-html-webpack-plugin autoprefixer babel-loader babel-plugin-transform-class-properties clean-webpack-plugin css-loader eslint eslint-plugin-react eslint-plugin-react-hooks file-loader html-webpack-plugin ip less less-loader mini-css-extract-plugin optimize-css-assets-webpack-plugin postcss postcss-loader style-loader terser-webpack-plugin typescript url-loader webpack webpack-dev-server webpack-cli

*/