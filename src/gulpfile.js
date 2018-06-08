
// dependency
var fs = require('fs');
var inquirer = require('inquirer');
var spawn = require('cross-spawn');
var file = require('html-wiring');
var colors = require('colors/safe');
var util = require('./util');
var path = require('path');
var express = require('express');
var livereload = require('connect-livereload');
var lr = require('tiny-lr');
var lrServer = lr();
var serveStatic = require('./serveStatic');
var shelljs = require('shelljs');
var ip = require('ip');
var portscanner = require('portscanner');
var open = require('open');
var assign = require('object-assign');

// gulp & gulp plugin
var gulp = require('gulp');
var babel = require('gulp-babel');
var less = require('gulp-less');
var lessPluginAutoPrefix = require('less-plugin-autoprefix');
var LessPluginFunctions = require('less-plugin-functions');
var sourcemaps = require('gulp-sourcemaps');
var concat = require('gulp-concat');
var replace = require('gulp-just-replace');
var es3ify = require("gulp-es3ify");
var eslint = require('gulp-eslint');

// webpack
var webpack = require('webpack');
var webpackDevMiddleware = require('webpack-dev-middleware');
var webpackCfg = require('./webpack.dev.js');
var MemoryFS = require("memory-fs");

// doc generator
var docWriter = require('./docWriter');

var url = "";

colors.setTheme({
  info: ['bold', 'green']
});

var autoprefix = new lessPluginAutoPrefix({
  browsers: ['last 2 versions', 'IE >= 8']
});

gulp.task('pack_build', ['style_transfer'], function (cb) {
  console.log(colors.info('###### pack_build start ######'))
  gulp.src([path.join(process.cwd(), './src/**/*.js'), path.join(process.cwd(), './src/**/*.jsx')])
    .pipe(babel({
      presets: ['react', 'es2015-ie', 'stage-1'].map(function (item) {
        return require.resolve('babel-preset-' + item);
      }),
      plugins: [
        'add-module-exports',
        ["import", { libraryName: "uxcore", camel2DashComponentName: false }],
      ].map(function (item) {
        if (Array.isArray(item)) {
          return [require.resolve('babel-plugin-' + item[0]), item[1]]
        }
        return require.resolve('babel-plugin-' + item);
      })
    }))
    .pipe(es3ify())
    .pipe(gulp.dest('build'))
    .on('end', function () {
      console.log(colors.info('###### pack_build done ######'))
      cb();
    });
});

gulp.task('style_transfer', function (cb) {
  console.log(colors.info('###### style_transfer start ######'));
  gulp.src([path.join(process.cwd(), './src/**/*.less')])
    .pipe(gulp.dest('build'))
    .on('end', function () {
      console.log(colors.info('###### style_transfer done ######'))
      cb();
    });
});

gulp.task('debug', function (cb) {
  var webpackBin = require.resolve('webpack');
  util.runCmd('node', ['--debug', webpackBin, '--config', path.join(__dirname, './webpack.dev.js')]);
})

gulp.task('less_demo', function (cb) {
  gulp.src([path.join(process.cwd(), './demo/**/*.less')])
    .pipe(sourcemaps.init())
    .pipe(less({
      plugins: [autoprefix, new LessPluginFunctions()]
    }).on('error', function (error) {
      console.log(error);
      this.emit('end');
    }))
    .pipe(concat('demo.css'))
    .pipe(replace([{
      search: /\/\*#\ssourceMappingURL=([^\*\/]+)\.map\s\*\//g,
      replacement: '/* end for `$1` */\n'
    }]))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./dist'))
    .on('end', function () {
      console.info(colors.info('###### less_demo done ######'));
      cb();
    });
});

gulp.task('lint', function (cb) {
  var eslintCfg = util.getEslintCfg();
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

gulp.task('reload_by_js', ['pack_demo'], function () {
  lrServer.changed({ body: { files: ['.'] } });
});

gulp.task('reload_by_component_css', ['less_component'], function () {
  lrServer.changed({ body: { files: ['.'] } });
});

gulp.task('reload_by_demo_css', ['less_demo'], function () {
  lrServer.changed({ body: { files: ['.'] } });
});

gulp.task('test', ['less_demo'], function (done) {
  var karmaBin = require.resolve('karma/bin/karma');
  var karmaConfig = path.join(__dirname, './karma.phantomjs.conf.js');
  var args = [karmaBin, 'start', karmaConfig];
  util.runCmd('node', args, done);
});

gulp.task('electron', ['less_demo'], function (done) {
  var karmaBin = require.resolve('karma/bin/karma');
  var karmaConfig = path.join(__dirname, './karma.electron.conf.js');
  var args = [karmaBin, 'start', karmaConfig];
  util.runCmd('node', args, done);
});

gulp.task('coverage', ['less_demo'], function (done) {
  if (fs.existsSync(util.getFromCwd('coverage'))) {
    shelljs.rm('-rf', util.getFromCwd('coverage'));
  }
  var karmaBin = require.resolve('karma/bin/karma');
  var karmaConfig = path.join(__dirname, './karma.phantomjs.coverage.conf.js');
  var args = [karmaBin, 'start', karmaConfig];
  util.runCmd('node', args, done);
});

gulp.task('electron-coverage', ['less_demo'], function (done) {
  if (fs.existsSync(util.getFromCwd('coverage'))) {
    shelljs.rm('-rf', util.getFromCwd('coverage'));
  }
  var karmaBin = require.resolve('karma/bin/karma');
  var karmaConfig = path.join(__dirname, './karma.electron.coverage.conf.js');
  var args = [karmaBin, 'start', karmaConfig];
  util.runCmd('node', args, done);
});

// run your unit tests across many browsers and platforms on Sauce Labs
gulp.task('saucelabs', ['less_demo'], function (done) {
  var karmaBin = require.resolve('karma/bin/karma');
  var karmaConfig = path.join(__dirname, './karma.saucelabs.conf.js');
  var args = [karmaBin, 'start', karmaConfig];
  util.runCmd('node', args, done);
});

gulp.task('browsers', ['less_demo'], function (done) {
  var karmaBin = require.resolve('karma/bin/karma');
  var karmaConfig = path.join(__dirname, './karma.browsers.conf.js');
  var args = [karmaBin, 'start', karmaConfig];
  util.runCmd('node', args, done);
});

gulp.task('chrome', ['less_demo'], function (done) {
  var karmaBin = require.resolve('karma/bin/karma');
  var karmaConfig = path.join(__dirname, './karma.chrome.conf.js');
  var args = [karmaBin, 'start', karmaConfig];
  util.runCmd('node', args, done);
});

gulp.task('server', [
  'less_demo'
], function () {
  var customWebpackCfg = {};
  var customWebpackCfgPath = path.join(process.cwd(), './webpack.custom.js');
  if (fs.existsSync(customWebpackCfgPath)) {
    customWebpackCfg = require(customWebpackCfgPath);
  }

  var compiler = webpack(assign(webpackCfg, customWebpackCfg));

  var webpackDevMiddlewareInstance = webpackDevMiddleware(compiler, {
    publicPath: '/dist',
    aggregateTimeout: 300, // wait so long for more changes
    poll: true, // use polling instead of native watchers
    stats: {
      chunks: false
    }
  });
  var app = express();
  app.use(function (req, res, next) {
    // 支持 CORS 跨域
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
  });
  app.use(webpackDevMiddlewareInstance);

  app.use(livereload({
    port: 35729
  }));
  app.use(serveStatic('.'));

  compiler.plugin('done', function (stats) {
    console.log(colors.info('###### pack_demo done ######'));
    lrServer.changed({ body: { files: ['.'] } });
  })

  webpackDevMiddlewareInstance.waitUntilValid(function () {
    console.log(colors.info('Package is in a valid state'));
    open(url)
  });

  // 开启 livereload

  lrServer.listen(35729, function () {
    console.log(colors.info('livereload server start: listening on 35729'));
  });

  // 开启调试服务
  portscanner.findAPortNotInUse(3000, 3010, ip.address(), function (error, port) {
    url = "http://" + ip.address() + ":" + port;
    var server = app.listen(port, function (err) {
      console.log(colors.info("dev server start: listening at " + url));
      if (err) {
        console.error(err);
      }
    });
    ;
  })

  gulp.watch(path.join(process.cwd(), './src/**/*.less'), ['reload_by_demo_css']);

  gulp.watch(path.join(process.cwd(), './demo/**/*.less'), ['reload_by_demo_css']);

});

gulp.task('build', ['pack_build'], function () { });

gulp.task('start', ['server']);

gulp.task('dep', function () {
  var commands = util.getPackages();
  util.runCmd('npm', ['i', '-d', '--no-save'].concat(commands));
});

gulp.task('update', function () {
  var commands = util.getPackages();
  util.runCmd('npm', ['update', '-d'].concat(commands.map(function (item) {
    return item.split('@')[0];
  })));
});

gulp.task('tnpm-dep', function () {
  var commands = util.getPackages();
  util.runCmd('tnpm', ['i', '-d', '--no-save'].concat(commands));
});

gulp.task('tnpm-update', function () {
  var commands = util.getPackages();
  console.log('getting tnpm version...')
  util.runCmd('tnpm', ['-v'], function () { }, function (data) {
    var tnpmVersion = data.match(/tnpm@(\d)/);
    if (parseInt(tnpmVersion[1], 10) === 4) {
      util.runCmd('rm', ['-rf', 'node_modules/'], function () {
        console.log('install dependencies...')
        util.runCmd('npm', ['run', 'tnpm-dep']);
      });
    } else {
      util.runCmd('tnpm', ['update', '-d'].concat(commands));
    }
  })
});

gulp.task('pub', ['pack_build'], function () {
  util.getQuestions().then(function (questions) {
    inquirer.prompt(questions).then(function (answers) {
      var pkg = util.getPkg();
      pkg.version = answers.version;
      file.writeFileFromString(JSON.stringify(pkg, null, '  '), 'package.json');
      console.log(colors.info('#### Git Info ####'));
      spawn.sync('git', ['add', '.'], { stdio: 'inherit' });
      spawn.sync('git', ['commit', '-m', 'ver. ' + pkg.version], { stdio: 'inherit' });
      spawn.sync('git', ['push', 'origin', answers.branch], { stdio: 'inherit' });
      console.log(colors.info('#### Npm Info ####'));
      spawn.sync(answers.npm, ['publish'], { stdio: 'inherit' });
    });
  });
});

gulp.task('doc', function () {
  docWriter()
    .then(function (res) {
      var logStr = res.map(function (file) {
        return path.join(process.cwd(), file);
      }).join('\n');
      logStr = 'the documenet files:\n' + logStr + '\ngenerate successfully!'
      console.log(colors.info(logStr));
    })
    .catch(function (err) {
      console.error(err);
    });
});

gulp.task('upgrade16', function () {
  // process package.json
  var pkgPath = path.join(process.cwd(), './package.json');
  var pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  delete pkg.devDependencies['es5-shim'];
  delete pkg.devDependencies['enzyme-adapter-react-15'];
  delete pkg.devDependencies['react-addons-test-utils'];
  pkg.devDependencies = assign({}, pkg.devDependencies, {
    'babel-polyfill': '6.x',
    react: '16.x',
    'react-dom': '16.x',
    'react-test-renderer': '16.x',
    'enzyme-adapter-react-16': '1.x',
    'uxcore-kuma': '*'
  })
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, ' '));

  // process index.html
  var htmlPath = path.join(process.cwd(), './index.html');
  var html = fs.readFileSync(htmlPath, 'utf-8');
  html = html.replace('react/dist/react-with-addons.js', 'react/umd/react.development.js');
  html = html.replace('react-dom/dist/react-dom.js', 'react-dom/umd/react-dom.development.js');
  html = html.replace('react-dom/dist/react-dom.min.js', 'react-dom/umd/react-dom.development.js');
  html = html.replace('es5-shim/es5-shim.min.js', 'babel-polyfill/dist/polyfill.min.js');
  html = html.replace(/\<script src="\.\/node_modules\/es5-shim\/es5-sham.min.js"><\/script>[\r\n]+/, '');
  fs.writeFileSync(htmlPath, html);

  // process test file
  try {
    var testsPath = path.join(process.cwd(), './tests');
    var tests = fs.readdirSync(testsPath);
    tests.forEach((fileName) => {
      if (fileName.indexOf('spec') !== -1) {
        var testPath = `${testsPath}/${fileName}`;
        var test = fs.readFileSync(testPath, 'utf-8');
        test = test.replace('enzyme-adapter-react-15', 'enzyme-adapter-react-16');
        fs.writeFileSync(testPath, test);
      }
    })
  } catch(e) {
    console.log(e);
  }

  // process gitignore
  var gitignorePath = path.join(process.cwd(), './.gitignore');;
  var gitignore = fs.readFileSync(gitignorePath, 'utf-8');
  ['coverage', 'package-lock.json'].forEach((key) => {
    spawn.sync('git', ['rm', '-rf', key], { stdio: 'inherit' });
    if (gitignore.indexOf(key) === -1) {
      gitignore += key + '\r\n';
    }
  })
  fs.writeFileSync(gitignorePath, gitignore);
});
