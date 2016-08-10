// Staging config. Also the default config that prod and dev are based off of.

var path = require('path');
var webpack = require('webpack');
var bourbon = require('bourbon').includePaths;
var neat = require('bourbon-neat').includePaths;
var ExtractTextPlugin = require('extract-text-webpack-plugin');
require('babel-polyfill');

var configGenerator = (options) => {
  const baseConfig = {
    entry: {
       hca: './src/js/hca/hca-entry.jsx',
       'non-react': './src/js/non-react-entry.js',
     },
    output: {
      path: path.join(__dirname, `../build/${options.buildtype}/generated`),
      publicPath: '/generated/',
      filename: '[name].entry.js'
    },
    module: {
      loaders: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'babel',
          query: {
            // Speed up compilation.
            cacheDirectory: true
          }
        },
        {
          test: /\.jsx$/,
          exclude: /node_modules/,
          loader: 'babel',
          query: {
            presets: ['react'],

            // Speed up compilation.
            cacheDirectory: true
          }
        },
        {
          // components.js is effectively a hand-rolled bundle.js. Break it apart.
          test: /components\.js$/,
          loader: 'imports?this=>window'
        },
        {
          test: /foundation\.js$/,
          loader: 'imports?this=>window'
        },
        {
          test: /\modernizrrc/,
          loader: 'modernizr'
        },
        {
          test: /wow\.js$/,
          loaders: [ 'imports?this=>window', 'exports?this.WOW' ]
        },
        {
          test: /\.scss$/,
          loader: ExtractTextPlugin.extract('style-loader', 'css!resolve-url!sass?includePaths[]=' + bourbon + '&includePaths[]=' + neat + '&includePaths[]=' + '~/uswds/src/stylesheets' + '&sourceMap')
        },
        { test: /\.(jpe?g|png|gif|svg)$/i,
          loader: 'url?limit=10000!img?progressive=true&-minimize'
        },
        {
          test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
          loader: 'url-loader?limit=10000&minetype=application/font-woff'
        },
        {
          test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
          loader: 'file-loader'
        }
      ]
    },
    resolve: {
      alias: {
        modernizr$: path.resolve(__dirname, "./modernizrrc"),
        jquery: "jquery/src/jquery"
      },
      extensions: ['', '.js', '.jsx']
    },
    plugins: [
      new webpack.DefinePlugin({
          __BUILDTYPE__: JSON.stringify(options.buildtype)
      }),

      // See http://stackoverflow.com/questions/28969861/managing-jquery-plugin-dependency-in-webpack
      new webpack.ProvidePlugin({
        "$": "jquery",
        jQuery: "jquery",
        "window.jQuery": "jquery"
      }),

      new ExtractTextPlugin('bundle.css'),
    ],
  };

  if (process.env.NODE_ENV === 'production') {
    baseConfig.devtool = '#source-map';
    baseConfig.plugins.push(new webpack.optimize.DedupePlugin());
    baseConfig.plugins.push(new webpack.optimize.OccurrenceOrderPlugin(true));
    baseConfig.plugins.push(new webpack.optimize.UglifyJsPlugin());
  } else {
    baseConfig.devtool = '#cheap-module-eval-source-map';
  }


  return baseConfig;
};

module.exports = configGenerator;
