const assign = require('object-assign');
const karmaCommonConfig = require('./getKarmaCommonConfig');

module.exports = function (config) {
  const browsers = ['Chrome', 'Firefox', 'Safari'];
  if (process.platform === 'win32') {
    browsers.push('IE');
  }
  config.set(assign(karmaCommonConfig(), {
    browsers,
  }));
};
