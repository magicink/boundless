module.exports = {
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
    libraryTarget: 'commonjs2'
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
