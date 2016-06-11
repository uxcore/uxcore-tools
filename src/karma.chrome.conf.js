var karmaCommonConfig = require('./getKarmaCommonConfig');
var assign = require('object-assign');
var webpack = require('webpack');

module.exports = function(config) {
    var browsers = ['Chrome'];
    var commonConfig = karmaCommonConfig();
    commonConfig.webpack.plugins = [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': '"production"'
        })
    ];
    config.set(assign(commonConfig, {
        browsers: browsers
    }))
};