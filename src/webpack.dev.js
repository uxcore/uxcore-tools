var fs = require('fs');
var webpack = require('webpack');
var path = require('path');

function getLoaderExclude(path) {
    var isNpmModule = !!path.match(/node_modules/);
    var isUxcore = !!path.match(/node_modules[\/\\](@ali[\/\\])?uxcore/);
    return isNpmModule & !isUxcore;
}

console.log(path.join(__dirname, '../node_modules'));
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
    devtool: '#source-map', // 这个配置要和output.sourceMapFilename一起使用
    module: {
        loaders: [
            {
                test: /\.js(x)*$/,
                // uxcore以外的modules都不需要经过babel解析
                exclude: getLoaderExclude,
                loader: 'es3ify-loader'
            },
            {

                test: /\.js(x)*$/,
                // uxcore以外的modules都不需要经过babel解析
                exclude: getLoaderExclude,
                loader: 'babel-loader',
                query: {
                    presets: ['babel-preset-react', 'babel-preset-es2015-loose', 'babel-preset-stage-1'].map(require.resolve),
                    plugins: [
                        'babel-plugin-add-module-exports'
                    ].map(require.resolve)
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