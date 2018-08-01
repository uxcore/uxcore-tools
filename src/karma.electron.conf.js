const assign = require('object-assign');
const karmaCommonConfig = require('./getKarmaCommonConfig');

module.exports = (config) => {
  config.set(assign(karmaCommonConfig({ disableSourceMap: true }), {
    browsers: ['Electron'],
    singleRun: true,
    electronOpts: {},
  }));
};
