var path = require("path");
var webpack = require("webpack");

module.exports = {
  entry:[
    "core-js/fn/typed/uint8-array",
    "./src/index.js"
  ],
  output: {
    path: path.join(__dirname, "..", "public"),
    filename: "app.js"
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin()
  ],
  module: {
    loaders: [
      { test: /\.js$/, loader: "babel-loader", exclude: /node_modules/ },
      { test: /\.css$/, loader: "style-loader!css-loader" }
    ]
  }
};
