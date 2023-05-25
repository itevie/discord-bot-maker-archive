const path = require('path');
module.exports = {
  entry: './src/view/js/script.ts',
  output: {
    filename: 'bundle.js', // all js files are bundled into this single file
    path: path.resolve(__dirname, 'build/src/view/js/'),
  },
  devtool: 'source-map',
  devServer: {
    static: './dist',
    port: 9000, //default port: 8080
  },
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader', // TypeScript loader
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
};
