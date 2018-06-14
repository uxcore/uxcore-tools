'use strict';

var getFromCwd = require('./util').getFromCwd;
var assign = require('object-assign');
var webpackCfg = require('./webpack.dev.js');
var webpack = require('webpack');
var happypack = require('happypack');

module.exports = function (options) {
  var indexSpec = getFromCwd('tests/index.js');
  var files = [
    getFromCwd('node_modules/uxcore-kuma/dist/orange.css'),
    getFromCwd('dist/demo.css'),
    require.resolve('console-polyfill/index.js'),
    require.resolve('babel-polyfill/dist/polyfill.min.js'),
    require.resolve('sinon/pkg/sinon.js'),
    "https://g.alicdn.com/platform/c/rangy/1.3.0/rangy-core.min.js",
    "https://g.alicdn.com/platform/c/tinymce/4.3.12/tinymce.min.js",
    indexSpec,
  ];
  // webpackCfg.entry = [];
  var preprocessors = {};
  preprocessors[indexSpec] = ['webpack', 'sourcemap'];
  var webpackPlugins = [
    new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /zh|en/),
    new happypack({
      loaders: [
        {
          loader: 'babel-loader',
          query: {
            presets: ['react', 'es2015-ie', 'stage-1'].map(function (item) {
              return require.resolve('babel-preset-' + item);
            }),
            plugins: [
              'transform-es3-member-expression-literals',
              'transform-es3-property-literals',
              'add-module-exports',
              ["import", { libraryName: "uxcore", camel2DashComponentName: false }]
            ].map(function (item) {
              if (Array.isArray(item)) {
                return [require.resolve('babel-plugin-' + item[0]), item[1]]
              }
              return require.resolve('babel-plugin-' + item);
            }),
            cacheDirectory: true
          },
        }
      ]
    }),
  ];

  if (!options || options.disableSourceMap !== true) {
    webpackPlugins.push(
      new webpack.SourceMapDevToolPlugin({
        columns: false,
      })
    );
  }
  return {
    reporters: ['mocha'],
    client: {
      mocha: {
        reporter: 'html', // change Karma's debug.html to the mocha web reporter
        ui: 'bdd',
      },
    },
    frameworks: ['mocha'],
    files: files,
    preprocessors: preprocessors,
    webpack: assign(webpackCfg, {
      externals: {
        'sinon': 'var sinon',
        'react/addons': true,
        'react/lib/ExecutionEnvironment': true,
        'react/lib/ReactContext': 'window',
      },
      plugins: webpackPlugins
    }),
    webpackServer: {
      noInfo: true, //please don't spam the console when running in karma!
    },
  };
};
