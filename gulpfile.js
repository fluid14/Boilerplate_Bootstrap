'use strict'

var {src, dest, watch, series, parallel} = require('gulp')
var gulpif = require('gulp-if');

var browserSync = require('browser-sync').create();
var htmlReplace = require('gulp-html-replace');
var htmlPartial = require('gulp-html-partial');
var htmlMin = require('gulp-htmlmin');
var sass = require('gulp-sass');
sass.compiler = require('node-sass');


var config = {
    htmlMin: true,
    path: {
        dist: './dist/',
        src: './src/',
        html: {
            in: './src/*.html',
            out: './dist/',
        },
        sass: {
            in: './src/sass/**/*.sass',
            out: './src/css/',
        },
        css: {
            in: './src/css/**/*.css',
            out: './dist/css/',
            outname: './style.css',
            replaceout: './css/style.css',
        },
        js: {
            in: './src/js/**/*.js',
            out: './dist/js/',
            outname: './script.js',
            replaceout: './js/script.js',
        },
        partials: {
            src: './src/partials/',
        },
        image: {
            in: './src/assets/**/*.{jpg,jpeg,png,gif}',
            out: './dist/assets/',
        }
    }
};

// BrowserSync
function serve(done) {
    browserSync.init({
        server: {
            baseDir: config.path.dist
        }
    });
    done();
}

function reload(done) {
    browserSync.reload();
    done();
}

function watchFiles() {
    watch(config.path.html.in, reload)
}

// HTML
function html(done, minification = config.htmlMin){
    src(config.path.html.in)
        .pipe(
            htmlPartial({
                basePath: config.path.partials.src,
                tagName: 'part',
                variablePrefix: '@@'
            })
        )
        .pipe(
            htmlReplace({
                css: config.path.css.replaceout,
                js: config.path.js.replaceout
            })
        )
        .pipe(gulpif(
            minification,
            htmlMin({
            sortAttributes: true,
            sortClassName: true,
            collapseWhitespace: true,
            removeComments: true
        })))
        .pipe(dest(config.path.html.out))
    done();
}

// Sass
function sassCompile(done){
    src(config.path.sass.in)
        .pipe(sass().on('error', sass.logError))
        .pipe(dest(config.path.sass.out));
    done();
}

exports.dev = series(sassCompile, html, parallel(watchFiles, serve))