'use strict';

var getFromCwd = require('./util').getFromCwd;
var getKarmaCommonConfig = require('./getKarmaCommonConfig');
var assign = require('object-assign');
var path = require('path');

module.exports = function conf(config) {
  var commonConfig = getKarmaCommonConfig({disableSourceMap: true});
  var preprocessors = {};
  preprocessors[commonConfig.files[commonConfig.files.length - 1]] = 'webpack'; // remove sourcemap
  var reporters = ['progress', 'coverage'];
  var coverageReporter = {
    reporters: [
      {
        type: 'lcov',
        subdir: '.',
      },
      {
        type: 'text',
      },
    ],
    dir: getFromCwd('coverage/'),
  };
  if (process.env.TRAVIS_JOB_ID) {
    reporters = ['coverage', 'coveralls'];
  }
  commonConfig.webpack.module.rules.push(
    {
      test: /\.jsx?$/,
      include: [path.join(process.cwd(), './src')],
      loader: 'istanbul-instrumenter-loader',
      enforce: 'post'
    }
  );
  config.set(assign(commonConfig, {
    preprocessors,
    webpack: commonConfig.webpack,
    reporters,
    coverageReporter,
    browsers: ['Electron'],
    singleRun: true,
  }));
};