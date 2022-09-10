const dotenv = require('dotenv')
const webpack = require('webpack')
const { WebpackManifestPlugin } = require('webpack-manifest-plugin')

dotenv.config()

const { DEV_PORT = 9000, NODE_ENV = 'production' } = process.env

const devConfigs = {}
const plugins = [
  new WebpackManifestPlugin({
    publicPath: ''
  })
]
if (NODE_ENV === 'development') {
  devConfigs.devServer = {
    devMiddleware: {
      index: true,
      publicPath: '/',
      writeToDisk: true
    },
    hot: true,
    liveReload: true,
    port: DEV_PORT,
    watchFiles: ['src/**/*'],
    webSocketServer: false
  }
  devConfigs.devtool = 'inline-source-map'
  plugins.push(new webpack.HotModuleReplacementPlugin())
}

module.exports = {
  ...devConfigs,
  entry: {
    scripts: './src/index.js'
  },
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM'
  },
  externalsType: 'window',
  output: {
    filename: '[name].js',
    iife: true
  },
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  },
  performance: {
    hints: false
  },
  plugins
}
