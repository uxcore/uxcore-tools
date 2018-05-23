var karmaCommonConfig = require('./getKarmaCommonConfig');
var assign = require('object-assign');
var webpack = require('webpack');
var happypack = require('happypack');

module.exports = function(config) {
    var browsers = ['Chrome'];
    var commonConfig = karmaCommonConfig();
    config.set(assign(commonConfig, {
        browsers: browsers
    }))
};