const webpack = require('webpack');
const path = require("path");
const fs=require('fs');
const vendors = [
  'react',
  "react-dom",
  "react-router-dom",
  "redux",
  "react-redux",
  "react-router-redux",
  "redux-thunk"
];

module.exports = {

  entry: {
    vendor: vendors,
  },
  output: {
    path: path.join(__dirname+'/build'),
    filename: '[name].[chunkhash].js',
    library: '[name]_[chunkhash]',
  },
  plugins: [
    new webpack.DllPlugin({
      path: path.join(__dirname+"/build"+'/manifest1.json'),
      name: '[name]_[chunkhash]',
      context: __dirname,
    }),
  ],
};
//console.log(path.join(__dirname+"/build"));