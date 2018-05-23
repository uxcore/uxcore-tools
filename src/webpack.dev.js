var fs = require('fs');
var webpack = require('webpack');
var path = require('path');
var happypack = require('happypack');
var ProgressBarPlugin = require('progress-bar-webpack-plugin');
var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
var DuplicatePackageCheckerPlugin = require('duplicate-package-checker-webpack-plugin');

function getLoaderExclude(path) {
  var isNpmModule = !!path.match(/node_modules/);
  return isNpmModule;
}

module.exports = {
  cache: true,
  entry: {
    demo: './demo/index'
  },
  output: {
    path: path.join(process.cwd(), './dist'),
    filename: "[name].js",
    sourceMapFilename: "[name].js.map"
  },
  module: {
    rules: [
      {

        test: /\.js(x)*$/,
        // npm modules 都不需要经过babel解析
        // exclude: getLoaderExclude,
        include: [path.join(process.cwd(), './src'), path.join(process.cwd(), './demo'), path.join(process.cwd(), './test')],
        use: 'happypack/loader',
      },
      {
        test: /\.svg$/,
        loader: 'babel-loader',
        include: [path.join(process.cwd(), './src')],
        query: {
          presets: ['react', 'es2015-ie'].map(function (item) {
            return require.resolve('babel-preset-' + item);
          }),
          cacheDirectory: true
        }
      },
      {
        test: /\.svg$/,
        loader: 'svg2react-loader',
        include: [path.join(process.cwd(), './src')]
      },
      {
        test: /\.less$/,
        use: [
          'style-loader',
          'css-loader',
          'less-loader',
        ],
      },
      {
        test: /\.js(x)*$/,
        loader: 'es3ify-loader',
        enforce: 'post',
      }
    ],
  },
  resolve: {
    modules: [
      path.resolve(__dirname, '../node_modules'),
      path.resolve(__dirname, '../../'),
      process.cwd(),
      'node_modules',
    ],
    extensions: ['.web.ts', '.web.tsx', '.web.js', '.web.jsx', '.ts', '.tsx', '.js', '.jsx', '.json'],
    mainFields: ['main'],
  },
  resolveLoader: {
    modules: [
      path.resolve(__dirname, '../node_modules'),
      path.resolve(__dirname, '../../'),
    ],
  },
  externals: {
    react: 'var React', // 相当于把全局的React作为模块的返回 module.exports = React;
    'react-dom': 'var ReactDOM'
  },
  plugins: [
    // SourceMap plugin will define process.env.NODE_ENV as development
    new webpack.SourceMapDevToolPlugin({
      columns: false,
    }),
    new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /zh|en/),
    new happypack({
      loaders: [
        {
          loader: 'babel-loader',
          query: {
            presets: ['react', 'es2015-ie', 'stage-1'].map(function (item) {
              return require.resolve('babel-preset-' + item);
            }),
            plugins: [
              'transform-es3-member-expression-literals',
              'transform-es3-property-literals',
              'add-module-exports',
              ["import", { libraryName: "uxcore", camel2DashComponentName: false }]
            ].map(function (item) {
              if (Array.isArray(item)) {
                return [require.resolve('babel-plugin-' + item[0]), item[1]]
              }
              return require.resolve('babel-plugin-' + item);
            }),
            cacheDirectory: true
          },
        }
      ]
    }),
    // new DuplicatePackageCheckerPlugin(),
    // new BundleAnalyzerPlugin(),
  ]
};