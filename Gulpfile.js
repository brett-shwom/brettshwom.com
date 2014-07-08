var gulp = require('gulp');
var stylus = require('gulp-stylus');
var gutil = require("gulp-util");
var replace = require('gulp-replace');

var EXPRESS_PORT = 9000;
var EXPRESS_ROOT = __dirname + '/output';
var LIVERELOAD_PORT = 35729;

process.chdir(__dirname) //make paths relative to Gulpfile.js not the cwd


function startExpress() {

  var express = require('express')
  var app = express()
  app.use(require('connect-livereload')())
  app.use(express.static(EXPRESS_ROOT))
  app.get('*', function(request, response) { //pushState support
    response.sendfile(EXPRESS_ROOT + '/index.html')
  })
  app.listen(EXPRESS_PORT)
}

function startLivereload() {

  lr = require('tiny-lr')();
  lr.listen(LIVERELOAD_PORT);
}

// Notifies livereload of changes detected
// by `gulp.watch()`
function notifyLivereload(event) {
  // `gulp.watch()` events provide an absolute path
  // so we need to make it relative to the server root
  var fileName = require('path').relative(EXPRESS_ROOT, event.path);

  lr.changed({
    body: {
      files: [fileName]
    }
  });
}

function buildStylus(options) {

    return function (event) {

      gutil.log(gutil.colors.cyan('building stylus'));

      var fileNamePattern
        , relative;

      if (event) { //event is passed by gulp.watch. event.path will contain the path to the file that changed
        fileNamePattern = event.path;

        //TODO: should we use the following for stylus build live reloading?

        // fileNamePattern = event.path;
        // relative = require('path').relative('./src', event.path)

        // gulp.src("**/*" + relative, { cwd : './src' }) //https://github.com/gulpjs/gulp/issues/151 --> It seems that gulp only preserves the directory structure of globs.
        //     .pipe(gulp.dest('./output'));
      }
      else {
        fileNamePattern = './src/*.styl'
      }

      gulp.src(fileNamePattern)
        .pipe(stylus(options))
        .pipe(gulp.dest(options.dest));
    }

}

function copyFontsAndImages(options){

    return function(event) {

      gutil.log(gutil.colors.cyan('copying fonts and images'));

      var fileNamePattern
        , relative;

      if (event) { //event is passed by gulp.watch. event.path will contain the path to the file that changed
        fileNamePattern = event.path;
        relative = require('path').relative('./src', event.path)

        gulp.src("**/*" + relative, { cwd : './src' }) //https://github.com/gulpjs/gulp/issues/151 --> It seems that gulp only preserves the directory structure of globs.
            .pipe(gulp.dest(options.dest));
      }
      else {
        fileNamePattern = './src/**/*.{svg,otf,woff,ttf,eot,png,jpg}'
      }

      gulp.src(fileNamePattern)
        .pipe(gulp.dest(options.dest));
    }
}

function copyCSS(options) {

    return function(event) {

      gutil.log(gutil.colors.cyan('copying css'));

      var fileNamePattern
        , relative;

      if (event) { //event is passed by gulp.watch. event.path will contain the path to the file that changed
        fileNamePattern = event.path;
        relative = require('path').relative('./src', event.path)

        gulp.src("**/*" + relative, { cwd : './src' }) //https://github.com/gulpjs/gulp/issues/151 --> It seems that gulp only preserves the directory structure of globs.
            .pipe(gulp.dest(options.dest));
      }
      else {
        fileNamePattern = './src/**/*.css'
      }

      gulp.src(fileNamePattern)
        .pipe(gulp.dest(options.dest));
    }
}

function copyJS(options) {

    return function (event) {

      gutil.log(gutil.colors.cyan('copying js'));

      var fileNamePattern
        , relative

      if (event) { //event is passed by gulp.watch. event.path will contain the path to the file that changed
        fileNamePattern = event.path;
        relative = require('path').relative('./src', event.path)

        gulp.src("**/*" + relative, { cwd : './src' }) //https://github.com/gulpjs/gulp/issues/151 --> It seems that gulp only preserves the directory structure of globs.
            .pipe(gulp.dest(options.dest));
      }
      else {
        fileNamePattern = './src/**/*.js'
        gulp.src(fileNamePattern)
            .pipe(gulp.dest(options.dest));
      }
    }

}

function copyHTML(options) {

    return function(event) {

      gutil.log(gutil.colors.cyan('copying html'));

      var fileNamePattern;

      if (event) { //event is passed by gulp.watch. event.path will contain the path to the file that changed
        fileNamePattern =  event.path;
      }
      else {
        fileNamePattern = './src/**/*.html'
      }

      gulp.src(fileNamePattern)
        .pipe(gulp.dest(options.dest));
    }
}


gulp.task('build', function () {
  buildStylus({dest : './output'})()
  copyHTML({dest : './output'})()
  copyJS({dest : './output'})()
  copyCSS({dest : './output'})()
  copyFontsAndImages({dest : './output'})()
});

gulp.task('watch', function () {

  /* watchers */

  gulp.watch('./output/**/*.html', notifyLivereload);
  gulp.watch('./output/**/*.css', notifyLivereload);
  gulp.watch('./output/**/*.js', notifyLivereload);

  /* rebuilders and copiers */
  gulp.watch('./src/**/*.styl', buildStylus({dest : './output'}));
  gulp.watch('./src/**/*.js', copyJS({dest : './output'}));
  gulp.watch('./src/**/*.html', copyHTML({dest : './output'}));
  gulp.watch('./src/**/*.css', copyCSS({dest : './output'}));

  /* TODO: watch for changes in fonts */
});

gulp.task('express', function () {
  startExpress();
});

gulp.task('livereload', function () {
  startLivereload();
});

gulp.task('server', ['build', 'express', 'livereload', 'watch']);

gulp.task('default', ['server'])
