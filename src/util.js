var file = require('html-wiring');
var pkg = JSON.parse(file.readFileAsString('package.json'));
var eslintCfg = JSON.parse(file.readFileAsString(__dirname + '/eslintrc.json'));

var utils = {
    versionCompare: function(a, b) {
        var aArr = a.split('.');
        var bArr = b.split('.');
        var larger = false;
        for (var i = 0; i < 3; i++) {
            if (parseInt(aArr[i]) === parseInt(bArr[i])) {

            }
            else {
                larger = parseInt(aArr[i]) > parseInt(bArr[i]);
                break;
            }
        }
        return larger;
    },
    getPkg: function() {
        return pkg;
    },
    getEslintCfg: function() {
        return eslintCfg;
    },
    getQuestions: function() {
        var me = this;
        return [
            {
                type: 'input',
                name: 'version',
                message: 'please enter the package version to publish (should be xx.xx.xx)',
                default: pkg.version,
                validate: function(input) {
                    if (/^\d+\.\d+\.\d+$/.test(input)) {
                        if (me.versionCompare(input, pkg.version)) {
                            return true;
                        }
                        else {
                            return "the version you entered should be larger than now"
                        }
                    }
                    else {
                        return "the version you entered is not valid"
                    }
                }
            },
            {
                type: 'input',
                name: 'branch',
                message: 'which branch you want to push',
                default: 'master'
            },
            {
                type: 'input',
                name: 'npm',
                message: 'which npm you want to publish',
                default: 'npm',
                validate: function(input) {
                    if (/npm/.test(input)) {
                        return true;
                    }
                    else {
                        return "it seems not a valid npm"
                    }
                }
            }
        ];
    }
}

module.exports = utils;