
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

// gulp & gulp plugin
var gulp = require('gulp');
var babel = require('gulp-babel');
var less = require('gulp-less');
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


colors.setTheme({
    info: ['bold', 'green']
});

gulp.task('pack_demo', function(cb) {
    
});

gulp.task('pack_build', function(cb) {
    console.log(path.join(process.cwd(), './src/**/*.js'));
    console.log(util.getFromCwd('./src/**/*.js'));
    gulp.src([path.join(process.cwd(), './src/**/*.js')])
        .pipe(babel({
            presets: ['react', 'es2015-loose', 'stage-1'],
            plugins: ['add-module-exports']
        }))
        .pipe(es3ify())
        .pipe(gulp.dest('build'))
        .on('end', function() {
            cb();
        })
});

gulp.task('less_demo', function(cb) {
    gulp.src([path.join(process.cwd(), './demo/**/*.less')])
        .pipe(sourcemaps.init())
        .pipe(less())
        .pipe(concat('demo.css'))
        .pipe(replace([{
            search: /\/\*#\ssourceMappingURL=([^\*\/]+)\.map\s\*\//g,
            replacement: '/* end for `$1` */\n'
        }]))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./dist'))
        .on('end', function() {
            console.info(colors.info('###### less_demo done ######'));
            cb();
        });
});

gulp.task('lint', function(cb) {
    var eslintCfg = util.getEslintCfg();
    gulp.src([path.join(process.cwd(), './src/**/*.js')])
        .pipe(eslint(eslintCfg))
        .pipe(eslint.format('table'))
        .pipe(eslint.failAfterError());
})

gulp.task('reload_by_js', ['pack_demo'], function () {
    lrServer.changed({body: {files: ['.']}});
});

gulp.task('reload_by_component_css', ['less_component'], function () {
    lrServer.changed({body: {files: ['.']}});
});

gulp.task('reload_by_demo_css', ['less_demo'], function () {
    lrServer.changed({body: {files: ['.']}});
});

gulp.task('server', [
    'less_demo'
], function() {
    
    var compiler = webpack(webpackCfg, function(err, stats) {
        // 重要 打包过程中的语法错误反映在stats中
        if (err) {
            console.log(err)
        } else {
            console.log(colors.info('###### pack_demo done ######'));
            var webpackDevMiddlewareInstance = webpackDevMiddleware(compiler, {
                publicPath: '/dist',
                stats: {
                    chunks: false
                }
            });
            var app = express();
            app.use(function(req, res, next) {
                // 支持 CORS 跨域
                res.setHeader('Access-Control-Allow-Origin', '*');
                next();
            });
            app.use(webpackDevMiddlewareInstance);
            
            app.use(livereload({
                port: 35729
            })); 
            app.use(serveStatic('.'));

            compiler.watch({ // watch options:
                aggregateTimeout: 300, // wait so long for more changes
                poll: true // use polling instead of native watchers
                // pass a number to set the polling interval
            }, function(err, stats) {
                // ...
                console.log(colors.info('reload'));
                lrServer.changed({body: {files: ['.']}});
            });

            webpackDevMiddlewareInstance.waitUntilValid(function(){
              console.log(colors.info('Package is in a valid state'));
            });

            // 开启 livereload

            
            lrServer.listen(35729, function() {
                console.log(colors.info('livereload server start: listening on 35729'));
            });

            // 开启调试服务
            var server = app.listen('8001', function(err) {
                console.log(colors.info("dev server start: listening on 8001"));
                if (err) {
                    console.error(err);
                }
                else {
                }

            });
        }
    });


    gulp.watch(path.join(process.cwd(), './src/**/*.less'), ['reload_by_demo_css']);

    gulp.watch(path.join(process.cwd(), './demo/**/*.less'), ['reload_by_demo_css']);

});

gulp.task('build', ['pack_build'], function() {});

gulp.task('publish', ['pack_build'], function() {
    setTimeout(function() {
        var questions = util.getQuestions();
        inquirer.prompt(questions, function(answers) {
            var pkg = util.getPkg();
            pkg.version = answers.version;
            file.writeFileFromString(JSON.stringify(pkg, null, ' '), 'package.json');
            console.log(colors.info('#### Git Info ####'));
            spawn.sync('git', ['add', '.'], {stdio: 'inherit'});
            spawn.sync('git', ['commit', '-m', 'ver. ' + pkg.version], {stdio: 'inherit'});
            spawn.sync('git', ['push', 'origin', answers.branch], {stdio: 'inherit'});
            console.log(colors.info('#### Npm Info ####'));
            spawn.sync(answers.npm, ['publish'], {stdio: 'inherit'});
        })
    }, 0)
});
