var gulp = require('gulp')

var uglify = require('gulp-uglify')
var compass = require('gulp-compass')
var minifyCss = require('gulp-minify-css')

gulp.task('libs', function () {
  gulp.src([
      './bower_components/vue/dist/vue.min.js',
      './bower_components/velocity/velocity.min.js',
      './bower_components/k-drag/dist/k-drag.js'
    ])
    .pipe(gulp.dest('./dist/scripts/lib/'))
})

gulp.task('images', function () {
  gulp.src('./images/**/*')
    .pipe(gulp.dest('./dist/images'))
})

gulp.task('html', function () {
  gulp.src('./templates/*.html')
    .pipe(gulp.dest('./dist/'))
})

gulp.task('default', ['libs', 'images', 'html'], function () {
  gulp.src('./stylesheets/**/*.css')
    .pipe(gulp.dest('./dist/stylesheets/'))

  gulp.src('./stylesheets/**/*.scss')
    .pipe(compass({
      sass: './stylesheets/',
      css: './temp/stylesheets/'
    }))
    .pipe(gulp.dest('./dist/stylesheets/'))

  gulp.src('./scripts/**/*.js')
    .pipe(gulp.dest('./dist/scripts/'))
})

gulp.task('production', ['libs', 'images', 'html'], function () {
  gulp.src('./stylesheets/**/*.css')
    .pipe(minifyCSS())
    .pipe(gulp.dest('./dist/stylesheets/'))

  gulp.src('./stylesheets/**/*.scss')
    .pipe(compass({
      sass: './stylesheets/',
      css: './temp/stylesheets/'
    }))
    .pipe(minifyCSS())
    .pipe(gulp.dest('./dist/stylesheets/'))

  gulp.src('./scripts/**/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('./dist/scripts/'))
})

gulp.task('watch', function () {
  gulp.watch([
    './bower_components/**/*',
    './images/**/*',
    './templates/*.html',
    './stylesheets/**/*.css',
    './stylesheets/**/*.scss',
    './scripts/**/*.js'
  ], ['default'])
})