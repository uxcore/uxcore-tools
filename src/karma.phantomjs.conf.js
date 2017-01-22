var karmaCommonConfig = require('./getKarmaCommonConfig');
var assign = require('object-assign');

module.exports = function (config) {
    config.set(assign(karmaCommonConfig({ disableSourceMap: true }), {
        browsers: ['PhantomJS_custom'],
        singleRun: true,
        customLaunchers: {
            'PhantomJS_custom': {
                base: 'PhantomJS',
                options: {
                    viewportSize: {
                        width: 1920,
                        height: 1080,
                    },
                    scrollPosition: {
                        top: 100,
                        left: 0
                    },
                },
                flags: ['--load-images=true'],
                debug: true
            }
        },
        phantomjsLauncher: {
            // Have phantomjs exit if a ResourceError is encountered
            // (useful if karma exits without killing phantom)
            exitOnResourceError: true,
        },
    }))
};