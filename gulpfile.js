'use strict'

var {src, dest, watch, series, parallel, task} = require('gulp')
var gulpif = require('gulp-if');
var del = require('del');
var runSequence = require('gulp4-run-sequence');

var browserSync = require('browser-sync').create();
var concat = require('gulp-concat');
var order = require("gulp-order");

var htmlReplace = require('gulp-html-replace');
var htmlPartial = require('gulp-html-partial');
var htmlMin = require('gulp-htmlmin');

var sass = require('gulp-sass');
sass.compiler = require('node-sass');
var sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');

var cleanCSS = require('gulp-clean-css');

var terser = require('gulp-terser');
var babel = require('gulp-babel');


var config = {
    htmlMin: true,
    cssMin: true,
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
            orderin: 'src/css/**/*.css',
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

// Clean
function clean(done) {
    return del([config.path.dist]);
}

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
    watch([config.path.html.in], series(html, reload));
    watch([config.path.sass.in], series(sassCompile));
    watch([config.path.css.in], series(css, reload));
    watch([config.path.js.in], series(js, reload));
}

// HTML
function html(done, minification = config.htmlMin) {
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
function sassCompile(done) {
    src(config.path.sass.in)
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(
            autoprefixer({
                browsers: ['since 2015, not dead']
            })
        )
        .pipe(sourcemaps.write())
        .pipe(dest(config.path.sass.out))
        .pipe(browserSync.stream());
    done();
}

// CSS
function css(done, minification = config.cssMin) {
    src(config.path.css.in)
        .pipe(order([
            "vendor/**/*.css",
            config.path.css.orderin,
        ]))
        .pipe(concat(config.path.css.outname))
        .pipe(
            gulpif(minification,
                cleanCSS({
                    level: {
                        1: {
                            specialComments: 0
                        }
                    }
                })
            )
        )
        .pipe(dest(config.path.css.out));
    done();
}

// JavaScript
function js(done) {
    src(config.path.js.in)
        .pipe(sourcemaps.init())
        .pipe(
            babel({
            presets: ['@babel/env']
        })
        )
        .pipe(terser())
        .pipe(sourcemaps.write())
        .pipe(dest(config.path.js.out))
    done();
}

// Image compress


config.htmlMin = true;
config.cssMin = false;


exports.dev = series(clean, js, sassCompile, css, html, serve, watchFiles);