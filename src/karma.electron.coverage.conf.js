const assign = require('object-assign');
const path = require('path');
const { getFromCwd } = require('./util');
const getKarmaCommonConfig = require('./getKarmaCommonConfig');

module.exports = function conf(config) {
  const commonConfig = getKarmaCommonConfig({ disableSourceMap: true });
  const preprocessors = {};
  preprocessors[commonConfig.files[commonConfig.files.length - 1]] = 'webpack'; // remove sourcemap
  let reporters = ['progress', 'coverage'];
  const coverageReporter = {
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
      enforce: 'post',
    },
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
