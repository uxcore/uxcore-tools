// var karmaCommonConfig = require('./getKarmaCommonConfig');
// var assign = require('object-assign');


// // FIXME some module cannot be resolved with current config
// module.exports = function (config) {
//     var commonConfig = assign(karmaCommonConfig(), {
//         browsers: ['Chrome'],
//         // singleRun: true,
//         // electronOpts: {},
//     });
//     commonConfig.files = commonConfig.files.concat([
//         'https://unpkg.com/react@0.14.9/dist/react.min.js',
//         'https://unpkg.com/react-dom@0.14.9/dist/react-dom.min.js',
//     ]);
//     commonConfig.webpack.externals = assign({}, commonConfig.webpack.externals, {
//         react: 'window.React',
//         'react-dom': 'window.ReactDOM',
//     });
//     commonConfig.webpack.resolve.alias = assign({}, commonConfig.webpack.resolve.alias, {
//         'enzyme-adapter-react-16': 'enzyme-adapter-react-14',
//     });
//     config.set(commonConfig);
// };
