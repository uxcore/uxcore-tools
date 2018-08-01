const assign = require('object-assign');
const karmaCommonConfig = require('./getKarmaCommonConfig');

module.exports = (config) => {
  const browsers = ['Chrome'];
  const commonConfig = karmaCommonConfig();
  config.set(assign(commonConfig, {
    browsers,
  }));
};
