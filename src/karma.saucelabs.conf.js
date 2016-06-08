var karmaCommonConfig = require('./getKarmaCommonConfig');
var assign = require('object-assign');

module.exports = function(config) {
    var customLaunchers = {
        sl_chrome: {
            base: 'SauceLabs',
            browserName: 'chrome',
            platform: 'Windows 7',
        },
        sl_firefox: {
            base: 'SauceLabs',
            browserName: 'firefox',
        },
        sl_safari: {
            base: 'SauceLabs',
            platform: 'OS X 10.11',
            browserName: 'safari',
        },
        sl_ie_11: {
            base: 'SauceLabs',
            browserName: 'internet explorer',
            platform: 'Windows 8.1',
            version: '11',
        },
        sl_ie_10: {
            base: 'SauceLabs',
            browserName: 'internet explorer',
            version: '10',
        },
        sl_ie_9: {
            base: 'SauceLabs',
            browserName: 'internet explorer',
            version: '9',
        },
        sl_ie_8: {
            base: 'SauceLabs',
            browserName: 'internet explorer',
            version: '8',
        },
    };
    // see https://github.com/karma-runner/karma-sauce-launcher
    config.set(assign(karmaCommonConfig(), {
        sauceLabs: {
            testName: 'UXCore cross-broswer util test',
            username: 'uxcore',
            accessKey: '573b8ba6-b2a8-4fec-91df-81f64e059b82',
        },
        customLaunchers: customLaunchers,
        browsers: Object.keys(customLaunchers),
        reporters: ['mocha', 'saucelabs'],
        singleRun: true,
    }));
}