const file = require('html-wiring');
const path = require('path');

const pkg = JSON.parse(file.readFileAsString('package.json'));
const eslintCfg = JSON.parse(file.readFileAsString(`${__dirname}/eslintrc.json`));
let userLintCfg;
const Promise = require('promise');
const git = require('git-rev');
const semver = require('semver');

try {
  userLintCfg = JSON.parse(file.readFileAsString(path.join(process.cwd(), './.eslintrc.json')));
} catch (e) { }

const utils = {
  runCmd(cmd, args, fn, stdoutFn) {
    console.log(`Run CMD: ${cmd} ${args.join(' ')}`);
    args = args || [];
    const runner = require('child_process').spawn(cmd, args, {
      // keep color
      stdio: stdoutFn ? 'pipe' : 'inherit',
      shell: true,
    });
    if (stdoutFn) {
      runner.stdout.on('data', (data) => {
        stdoutFn(data.toString());
      });
    }
    runner.on('close', (code) => {
      if (fn) {
        fn(code);
      }
    });
  },
  getFromCwd() {
    const args = [].slice.call(arguments, 0);
    args.unshift(process.cwd());
    return path.join(...args);
  },
  getPkg() {
    return pkg;
  },
  getEslintCfg() {
    return userLintCfg || eslintCfg;
  },
  getPackages() {
    const commands = [];
    for (var item in pkg.dependencies) {
      commands.push(`${item}@${pkg.dependencies[item]}`);
    }
    for (var item in pkg.devDependencies) {
      if (item !== 'uxcore-tools') {
        commands.push(`${item}@${pkg.devDependencies[item]}`);
      }
    }
    return commands;
  },
  getQuestions() {
    const me = this;
    return new Promise(((resolve, reject) => {
      git.branch((branch) => {
        const defaultBranch = branch;
        const defaultNpm = /@ali/.test(pkg.name) ? 'tnpm' : 'npm';
        const questions = [
          {
            type: 'input',
            name: 'version',
            message: 'please enter the package version to publish (should be xx.xx.xx)',
            default: pkg.version,
            validate(input) {
              if (semver.valid(input)) {
                if (semver.gt(input, pkg.version)) {
                  return true;
                }
                return 'the version you entered should be larger than now';
              }
              return 'the version you entered is not valid';
            },
          },
          {
            type: 'input',
            name: 'branch',
            message: 'which branch you want to push',
            default: defaultBranch,
          },
          {
            type: 'input',
            name: 'npm',
            message: 'which npm you want to publish',
            default: defaultNpm,
            validate(input) {
              if (/npm/.test(input)) {
                return true;
              }

              return 'it seems not a valid npm';
            },
          },
        ];
        resolve(questions);
      });
    }));
  },
};

module.exports = utils;
