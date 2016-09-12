var gulp = require('gulp'),
    // 文件操作模块
    fs = require('fs'),
    // 路径模块
    path = require('path'),
    // 清理文件
    clean = require('gulp-clean'),
    // 重命名
    rename = require('gulp-rename'),
    // 混淆js
    uglify = require('gulp-uglify'),
    // 压缩CSS
    minifyCss = require('gulp-minify-css'),
    // 补全CSS浏览器前缀
    autoprefixer = require('gulp-autoprefixer'),
    // SASS/SCSS
    sass = require('gulp-sass'),
    // JS语法检查
    jshint = require('gulp-jshint'),
    // 让gulp任务，可以相互独立，解除任务间的依赖，增强task复用
    runSequence = require('run-sequence'),
    // open browser
    open = require('gulp-open');
// dev server
var browserSync = require('browser-sync').create();

var config = require('./shark-deploy-conf.json');

var appConfig = config;

// webapp
var webappDir = path.join('./', appConfig.webapp);
// build dir
var buildDir = path.join('./', appConfig.build);
// path
var cssPath = appConfig.cssPath;
var jsPath = appConfig.jsPath;
var htmlPath = appConfig.htmlPath;
var scssPath = appConfig.scssPath;
// gulp开始

//清理build和临时目录
gulp.task('clean', function() {

    return gulp.src([buildDir], {
            read: false
        })
        .pipe(clean());
});

// 检查JS语法
gulp.task('jshint', function() {
    return gulp.src(path.join(webappDir, jsPath, '**/*.js'))
        .pipe(jshint({
            strict: false,
            es5: false,
            globals: {
                jQuery: true,
                $: true,
                require: true,
                module: true,
                global: true
            }
        }))
        .pipe(jshint.reporter('default'))

});

// 压缩JS
gulp.task('uglifyjs', function() {
    return gulp.src(path.join(webappDir, jsPath, '**/*.js'))
        .pipe(gulp.dest(path.join(buildDir, 'scripts')))
        .pipe(uglify())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest(path.join(buildDir, 'scripts')))

});
// sass/scss
gulp.task('sass:compile', function() {
    return gulp.src(path.join(webappDir, scssPath, '**/*.scss'))
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest(path.join(webappDir, cssPath)));
    // 替换CSS
});

// css前加浏览器前缀
gulp.task('autoprefixer', function() {
    return gulp.src(path.join(webappDir, cssPath, '**/*.css'))
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(gulp.dest(path.join(webappDir, 'styles/css')))

});

// 压缩CSS
gulp.task('minifyCss', function() {
    return gulp.src(path.join(webappDir, cssPath, '**/*.css'))
        .pipe(gulp.dest(path.join(buildDir, 'styles/css')))
        .pipe(minifyCss())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest(path.join(buildDir, 'styles/css')))


});
//Build
gulp.task('build', function() {
    runSequence(
        'clean',
        'sass:compile',
        'autoprefixer',
        'minifyCss',
        'jshint',
        'uglifyjs'
    );
});
// open browser
gulp.task('open-url', function() {
    gulp.src(webappDir)
        .pipe(open({ uri: appConfig.openurl }));
});
// 
gulp.task('browser-sync', function() {
    // .init starts the server
    browserSync.init({
        server: webappDir,
        port: appConfig.port
    });
    gulp.watch(path.join(webappDir, scssPath, '**/*.scss'), ['sass:compile']);
    gulp.watch(path.join(webappDir, jsPath, '**/*.js'));
    gulp.watch(path.join(webappDir, htmlPath, '**/*.{html,htm}'));
    gulp.watch(path.join(webappDir, cssPath, '**/*.css'));
});
//Server
gulp.task('serve', function() {
    runSequence(
        'sass:compile',
        'browser-sync',
        'open-url'
    );
});
gulp.task('default', ['build']);