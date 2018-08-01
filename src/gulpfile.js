
// dependency
const fs = require('fs');
const inquirer = require('inquirer');
const spawn = require('cross-spawn');
const file = require('html-wiring');
const colors = require('colors/safe');
const path = require('path');
const express = require('express');
const livereload = require('connect-livereload');
const lr = require('tiny-lr');

const lrServer = lr();
const shelljs = require('shelljs');
const ip = require('ip');
const portscanner = require('portscanner');
const open = require('open');
const assign = require('object-assign');

// gulp & gulp plugin
const gulp = require('gulp');
const babel = require('gulp-babel');
const less = require('gulp-less');
const LessPluginAutoPrefix = require('less-plugin-autoprefix');
const LessPluginFunctions = require('less-plugin-functions');
const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');
const replace = require('gulp-just-replace');
const es3ify = require('gulp-es3ify');
const eslint = require('gulp-eslint');

// webpack
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackCfg = require('./webpack.dev.js');
const serveStatic = require('./serveStatic');
const util = require('./util');

// doc generator
const docWriter = require('./docWriter');

let url = '';

colors.setTheme({
  info: ['bold', 'green'],
});

const autoprefix = new LessPluginAutoPrefix({
  browsers: ['last 2 versions', 'IE >= 8'],
});

gulp.task('pack_build', ['style_transfer'], (cb) => {
  console.log(colors.info('###### pack_build start ######'));
  gulp.src([path.join(process.cwd(), './src/**/*.js'), path.join(process.cwd(), './src/**/*.jsx')])
    .pipe(babel({
      presets: ['react', 'es2015-ie', 'stage-1'].map(item => require.resolve(`babel-preset-${item}`)),
      plugins: [
        'add-module-exports',
        ['import', { libraryName: 'uxcore', camel2DashComponentName: false }],
      ].map((item) => {
        if (Array.isArray(item)) {
          return [require.resolve(`babel-plugin-${item[0]}`), item[1]];
        }
        return require.resolve(`babel-plugin-${item}`);
      }),
    }))
    .pipe(es3ify())
    .pipe(gulp.dest('build'))
    .on('end', () => {
      console.log(colors.info('###### pack_build done ######'));
      cb();
    });
});

gulp.task('style_transfer', (cb) => {
  console.log(colors.info('###### style_transfer start ######'));
  gulp.src([path.join(process.cwd(), './src/**/*.less')])
    .pipe(gulp.dest('build'))
    .on('end', () => {
      console.log(colors.info('###### style_transfer done ######'));
      cb();
    });
});

gulp.task('debug', (cb) => {
  const webpackBin = require.resolve('webpack');
  util.runCmd('node', ['--debug', webpackBin, '--config', path.join(__dirname, './webpack.dev.js')]);
  cb();
});

gulp.task('less_demo', (cb) => {
  gulp.src([path.join(process.cwd(), './demo/**/*.less')])
    .pipe(sourcemaps.init())
    .pipe(less({
      plugins: [autoprefix, new LessPluginFunctions()],
    }).on('error', function (error) {
      console.log(error);
      this.emit('end');
    }))
    .pipe(concat('demo.css'))
    .pipe(replace([{
      search: /\/\*#\ssourceMappingURL=([^*/]+)\.map\s\*\//g,
      replacement: '/* end for `$1` */\n',
    }]))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./dist'))
    .on('end', () => {
      console.info(colors.info('###### less_demo done ######'));
      cb();
    });
});

gulp.task('lint', () => {
  const eslintCfg = util.getEslintCfg();
  gulp.src([
    path.join(process.cwd(), './src/**/*.js'),
    path.join(process.cwd(), './src/**/*.jsx'),
    path.join(process.cwd(), './demo/**/*.js'),
    path.join(process.cwd(), './demo/**/*.jsx'),
  ])
    .pipe(eslint(eslintCfg))
    .pipe(eslint.format('table'))
    .pipe(eslint.failAfterError());
});

gulp.task('reload_by_js', ['pack_demo'], () => {
  lrServer.changed({ body: { files: ['.'] } });
});

gulp.task('reload_by_component_css', ['less_component'], () => {
  lrServer.changed({ body: { files: ['.'] } });
});

gulp.task('reload_by_demo_css', ['less_demo'], () => {
  lrServer.changed({ body: { files: ['.'] } });
});

gulp.task('test', ['less_demo'], (done) => {
  const karmaBin = require.resolve('karma/bin/karma');
  const karmaConfig = path.join(__dirname, './karma.phantomjs.conf.js');
  const args = [karmaBin, 'start', karmaConfig];
  util.runCmd('node', args, done);
});

// gulp.task('test14', ['less_demo'], function(done) {
//   var karmaBin = require.resolve('karma/bin/karma');
//   var karmaConfig = path.join(__dirname, './karma.electron.react14.conf.js');
//   var args = [karmaBin, 'start', karmaConfig];
//   util.runCmd('node', args, done);
// });

gulp.task('electron', ['less_demo'], (done) => {
  const karmaBin = require.resolve('karma/bin/karma');
  const karmaConfig = path.join(__dirname, './karma.electron.conf.js');
  const args = [karmaBin, 'start', karmaConfig];
  util.runCmd('node', args, done);
});

gulp.task('coverage', ['less_demo'], (done) => {
  if (fs.existsSync(util.getFromCwd('coverage'))) {
    shelljs.rm('-rf', util.getFromCwd('coverage'));
  }
  const karmaBin = require.resolve('karma/bin/karma');
  const karmaConfig = path.join(__dirname, './karma.phantomjs.coverage.conf.js');
  const args = [karmaBin, 'start', karmaConfig];
  util.runCmd('node', args, done);
});

gulp.task('electron-coverage', ['less_demo'], (done) => {
  if (fs.existsSync(util.getFromCwd('coverage'))) {
    shelljs.rm('-rf', util.getFromCwd('coverage'));
  }
  const karmaBin = require.resolve('karma/bin/karma');
  const karmaConfig = path.join(__dirname, './karma.electron.coverage.conf.js');
  const args = [karmaBin, 'start', karmaConfig];
  util.runCmd('node', args, done);
});

// run your unit tests across many browsers and platforms on Sauce Labs
gulp.task('saucelabs', ['less_demo'], (done) => {
  const karmaBin = require.resolve('karma/bin/karma');
  const karmaConfig = path.join(__dirname, './karma.saucelabs.conf.js');
  const args = [karmaBin, 'start', karmaConfig];
  util.runCmd('node', args, done);
});

gulp.task('browsers', ['less_demo'], (done) => {
  const karmaBin = require.resolve('karma/bin/karma');
  const karmaConfig = path.join(__dirname, './karma.browsers.conf.js');
  const args = [karmaBin, 'start', karmaConfig];
  util.runCmd('node', args, done);
});

gulp.task('chrome', ['less_demo'], (done) => {
  const karmaBin = require.resolve('karma/bin/karma');
  const karmaConfig = path.join(__dirname, './karma.chrome.conf.js');
  const args = [karmaBin, 'start', karmaConfig];
  util.runCmd('node', args, done);
});

gulp.task('server', [
  'less_demo',
], () => {
  let customWebpackCfg = {};
  const customWebpackCfgPath = path.join(process.cwd(), './webpack.custom.js');
  if (fs.existsSync(customWebpackCfgPath)) {
    customWebpackCfg = require(customWebpackCfgPath);
  }

  if (typeof customWebpackCfg === 'function') {
    customWebpackCfg(webpackCfg);
    customWebpackCfg = {};
  }

  const compiler = webpack(assign(webpackCfg, customWebpackCfg));

  const webpackDevMiddlewareInstance = webpackDevMiddleware(compiler, {
    publicPath: '/dist',
    aggregateTimeout: 300, // wait so long for more changes
    poll: true, // use polling instead of native watchers
    stats: {
      chunks: false,
    },
  });
  const app = express();
  app.use((req, res, next) => {
    // 支持 CORS 跨域
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
  });
  app.use(webpackDevMiddlewareInstance);

  app.use(livereload({
    port: 35729,
  }));
  app.use(serveStatic('.'));

  compiler.plugin('done', () => {
    console.log(colors.info('###### pack_demo done ######'));
    lrServer.changed({ body: { files: ['.'] } });
  });

  webpackDevMiddlewareInstance.waitUntilValid(() => {
    console.log(colors.info('Package is in a valid state'));
    open(url);
  });

  // 开启 livereload

  lrServer.listen(35729, () => {
    console.log(colors.info('livereload server start: listening on 35729'));
  });

  // 开启调试服务
  portscanner.findAPortNotInUse(3000, 3010, ip.address(), (error, port) => {
    url = `http://${ip.address()}:${port}`;
    app.listen(port, (err) => {
      console.log(colors.info(`dev server start: listening at ${url}`));
      if (err) {
        console.error(err);
      }
    });
  });

  gulp.watch(path.join(process.cwd(), './src/**/*.less'), ['reload_by_demo_css']);

  gulp.watch(path.join(process.cwd(), './demo/**/*.less'), ['reload_by_demo_css']);
});

gulp.task('build', ['pack_build'], () => { });

gulp.task('start', ['server']);

gulp.task('dep', () => {
  const commands = util.getPackages();
  util.runCmd('npm', ['i', '-d', '--no-save'].concat(commands));
});

gulp.task('update', () => {
  const commands = util.getPackages();
  util.runCmd('npm', ['update', '-d'].concat(commands.map(item => item.split('@')[0])));
});

gulp.task('tnpm-dep', () => {
  const commands = util.getPackages();
  util.runCmd('tnpm', ['i', '-d', '--no-save'].concat(commands));
});

gulp.task('tnpm-update', () => {
  const commands = util.getPackages();
  console.log('getting tnpm version...');
  util.runCmd('tnpm', ['-v'], () => { }, (data) => {
    const tnpmVersion = data.match(/tnpm@(\d)/);
    if (parseInt(tnpmVersion[1], 10) === 4) {
      util.runCmd('rm', ['-rf', 'node_modules/'], () => {
        console.log('install dependencies...');
        util.runCmd('npm', ['run', 'tnpm-dep']);
      });
    } else {
      util.runCmd('tnpm', ['update', '-d'].concat(commands));
    }
  });
});

gulp.task('pub', ['pack_build'], () => {
  util.getQuestions().then((questions) => {
    inquirer.prompt(questions).then((answers) => {
      const pkg = util.getPkg();
      pkg.version = answers.version;
      file.writeFileFromString(JSON.stringify(pkg, null, '  '), 'package.json');
      console.log(colors.info('#### Git Info ####'));
      spawn.sync('git', ['add', '.'], { stdio: 'inherit' });
      spawn.sync('git', ['commit', '-m', `ver. ${pkg.version}`], { stdio: 'inherit' });
      spawn.sync('git', ['push', 'origin', answers.branch], { stdio: 'inherit' });
      console.log(colors.info('#### Npm Info ####'));
      spawn.sync(answers.npm, ['publish'], { stdio: 'inherit' });
    });
  });
});

gulp.task('doc', () => {
  docWriter()
    .then((res) => {
      let logStr = res.map(r => path.join(process.cwd(), r)).join('\n');
      logStr = `the documenet files:\n${logStr}\ngenerate successfully!`;
      console.log(colors.info(logStr));
    })
    .catch((err) => {
      console.error(err);
    });
});

gulp.task('upgrade16', () => {
  // process package.json
  const pkgPath = path.join(process.cwd(), './package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  delete pkg.devDependencies['es5-shim'];
  delete pkg.devDependencies['enzyme-adapter-react-15'];
  delete pkg.devDependencies['react-addons-test-utils'];
  pkg.devDependencies = assign({}, pkg.devDependencies, {
    'babel-polyfill': '6.x',
    react: '16.x',
    'react-dom': '16.x',
    'react-test-renderer': '16.x',
    'enzyme-adapter-react-16': '1.x',
    'uxcore-kuma': '*',
    'uxcore-tools': '^0.3.0',
  });

  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, ' '));

  // process index.html
  const htmlPath = path.join(process.cwd(), './index.html');
  let html = fs.readFileSync(htmlPath, 'utf-8');
  html = html.replace('react/dist/react-with-addons.js', 'react/umd/react.development.js');
  html = html.replace('react-dom/dist/react-dom.js', 'react-dom/umd/react-dom.development.js');
  html = html.replace('react-dom/dist/react-dom.min.js', 'react-dom/umd/react-dom.development.js');
  html = html.replace('es5-shim/es5-shim.min.js', 'babel-polyfill/dist/polyfill.min.js');
  html = html.replace(/<script src="\.\/node_modules\/es5-shim\/es5-sham.min.js"><\/script>[\r\n]+/, '');
  fs.writeFileSync(htmlPath, html);

  // process test file
  try {
    const testsPath = path.join(process.cwd(), './tests');
    const tests = fs.readdirSync(testsPath);
    tests.forEach((fileName) => {
      if (fileName.indexOf('spec') !== -1) {
        const testPath = `${testsPath}/${fileName}`;
        let test = fs.readFileSync(testPath, 'utf-8');
        test = test.replace('enzyme-adapter-react-15', 'enzyme-adapter-react-16');
        fs.writeFileSync(testPath, test);
      }
    });
  } catch (e) {
    console.log(e);
  }

  // process gitignore
  const gitignorePath = path.join(process.cwd(), './.gitignore');
  let gitignore = fs.readFileSync(gitignorePath, 'utf-8');
  ['coverage', 'package-lock.json'].forEach((key) => {
    spawn.sync('git', ['rm', '-rf', key], { stdio: 'inherit' });
    if (gitignore.indexOf(key) === -1) {
      gitignore += `${key}\r\n`;
    }
  });
  fs.writeFileSync(gitignorePath, gitignore);
});
