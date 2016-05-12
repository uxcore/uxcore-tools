
// dependency
var fs = require('fs');
var inquirer = require('inquirer');
var spawn = require('cross-spawn');
var file = require('html-wiring');
var colors = require('colors/safe');
var util = require('./util');
var webpack = require('webpack');
var path = require('path');

// gulp & gulp plugin
var gulp = require('gulp');
var babel = require('gulp-babel');
var less = require('gulp-less');
var connect = require('gulp-connect');
var sourcemaps = require('gulp-sourcemaps');
var concat = require('gulp-concat');
var replace = require('gulp-just-replace');
var es3ify = require("gulp-es3ify");
var eslint = require('gulp-eslint');

// config
console.log(__dirname);
// var eslintCfg = JSON.parse(file.readFileAsString('eslintrc.json'));

colors.setTheme({
    info: ['bold', 'green']
});

gulp.task('pack_demo', function(cb) {
    webpack(require('./webpack.dev.js'), function (err, stats) {
        // 重要 打包过程中的语法错误反映在stats中
        if(err) cb(err);
        console.info('###### pack_demo done ######');
        cb();
    });
});

gulp.task('pack_build', function(cb) {
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
            console.info('###### less_demo done ######');
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
    reload();
});

gulp.task('reload_by_component_css', ['less_component'], function () {
    reload();
});

gulp.task('reload_by_demo_css', ['less_demo'], function () {
    reload();
});

gulp.task('server', [
    'pack_demo',
    'less_demo'
], function() {
    connect.server({
        root: process.cwd(),
        port: 8001,
        livereload: true
    });

    gulp.watch([path.join(process.cwd(), './src/**/*.js'), path.join(process.cwd(), './demo/**/*.js')], ['reload_by_js']);

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
