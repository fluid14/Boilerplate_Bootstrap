var babel = require('gulp-babel');
var uglify = require('gulp-terser');

var imagemin = require('gulp-imagemin');
var changed = require('gulp-changed');

var purgecss = require('gulp-purgecss');

var gutil = require('gulp-util');
var path = require('path');

var config = {
  dist: './dist/',
  src: './src/',
  cssin: './src/css/**/*.css',
  jsin: './src/js/**/*.js',
  partials: './src/partials/**/*.html',
  imgin: './src/assets/**/*.{jpg,jpeg,png,gif}',
  htmlin: './src/*.html',
  sassin: './src/sass/**/*.sass',
  cssout: './dist/css/',
  jsout: './dist/js/',
  imgout: './dist/assets/',
  htmlout: './dist/',
  sassout: './src/css/',
  cssoutname: './style.css',
  jsoutname: './script.js',
  cssreplaceout: './css/style.css',
  jsreplaceout: './js/script.js'
};



  gulp.watch([config.htmlin], ['html', 'reload']);
  gulp.watch([config.partials], ['html', 'reload']);
  gulp.watch([config.cssin], ['css', 'reload']);
  gulp.watch([config.jsin], ['js', 'reload']);
  gulp.watch(config.sassin, ['sass', 'reload']);
  gulp.watch(config.imgin, ['img', 'reload']);
});


gulp.task('purgecss', () => {
  return gulp
    .src('dist/**/*.css')
    .pipe(
      purgecss({
        content: ['dist/**/*.html', 'dist/**/*.js']
      })
    )
    .pipe(gulp.dest('dist/'));
});

gulp.task('babel', () =>
  gulp
    .src('src/js/script.js')
    .pipe(
      babel({
        presets: ['@babel/env']
      })
    )
    .pipe(gulp.dest('src/js/'))
);

gulp.task('js', function() {
  return (
    gulp
      .src(config.jsin)
      // .pipe(concat(config.jsoutname))
      .pipe(uglify())
      .pipe(gulp.dest(config.jsout))
  );
});

gulp.task('img', function() {
  return (
    gulp
      .src(config.imgin)
      .pipe(changed(config.imgout))
      // .pipe(imagemin())
      .pipe(gulp.dest(config.imgout))
  );
});

gulp.task('copyTtf', function() {
  gulp.src('./src/**/**.{ttf,otf}').pipe(gulp.dest('./dist/'));
});

gulp.task('copySvg', function() {
  gulp.src('./src/assets/img/**/*.svg').pipe(gulp.dest('./dist/assets/img/'));
});

gulp.task('copyVideo', function() {
  gulp
    .src('./src/assets/video/**/*.{m4v,mov,MOV,mp4}')
    .pipe(gulp.dest('./dist/assets/video/'));
});

gulp.task('build', function() {
  sequence('clean', [
    'html',
    'js',
    'css',
    'img',
    'copySvg',
    'copyVideo',
    'copyTtf'
  ], purgecss);
});

gulp.task('default', function() {
  sequence(
    'clean',
    ['html', 'js', 'css', 'img', 'copySvg', 'copyVideo', 'copyTtf'],
    ['serve']
  );
});
