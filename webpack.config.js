const dotenv = require('dotenv')
dotenv.config()

const { DEV_PORT = 9000, NODE_ENV = 'production' } = process.env

const devConfigs = {}
if (NODE_ENV === 'development') {
  devConfigs.devServer = {
    devMiddleware: {
      index: true,
      publicPath: '/'
    },
    port: DEV_PORT
  }
  devConfigs.devtool = 'inline-source-map'
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
  }
}
