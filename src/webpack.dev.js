var fs = require('fs');
var webpack = require('webpack');
var path = require('path');

function getLoaderExclude(path) {
    var isNpmModule = !!path.match(/node_modules/);
    // var isUxcore = !!path.match(/node_modules[\/\\](@ali[\/\\])?uxcore/);
    return isNpmModule;
}

module.exports = {
    cache: false,
    entry: {
        demo: './demo/index'
    },
    output: {
        path: path.join(process.cwd(), './dist'),
        filename: "[name].js",
        sourceMapFilename: "[name].js.map"
    },
    devtool: 'cheap-module-eval-source-map', // 这个配置要和output.sourceMapFilename一起使用
    module: {
        loaders: [
            {

                test: /\.js(x)*$/,
                // uxcore以外的modules都不需要经过babel解析
                exclude: getLoaderExclude,
                loader: 'babel-loader',
                query: {
                    presets: ['react', 'es2015-ie', 'stage-1'].map(function(item) {
                        return require.resolve('babel-preset-' + item);
                    }),
                    plugins: [
                        'add-module-exports'
                    ].map(function(item) {
                        return require.resolve('babel-plugin-' + item);
                    }),
                    cacheDirectory: true
                }
            }
        ]
    },
    resolveLoader: {
        root: [
            path.join(__dirname, '../node_modules')
        ]
    },
    externals: {
        react: 'var React', // 相当于把全局的React作为模块的返回 module.exports = React;
        'react-dom': 'var ReactDOM'
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': '"development"'
        })
    ]
};