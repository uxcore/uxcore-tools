var karmaCommonConfig = require('./getKarmaCommonConfig');
var assign = require('object-assign');

module.exports = function (config) {
    config.set(assign(karmaCommonConfig({ disableSourceMap: true }), {
        browsers: ['Electron'],
        singleRun: true,
        electronOpts: {},
    }))
};