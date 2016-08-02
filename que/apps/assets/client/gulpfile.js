var gulp = require('gulp'),
    sass = require('gulp-ruby-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    uglify = require('gulp-uglify')
    livereload = require('gulp-livereload'),
    jshint = require('gulp-jshint'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    gulpServe = require('gulp-serve'),
    Server = require('karma').Server;

gulp.task('styles', function () {
    return sass('src/sass/*.scss', { style: 'expanded' })
        .pipe(autoprefixer('last 2 version'))
        .pipe(gulp.dest('css'))
        .pipe(rename({suffix: '.min'}))
        .pipe(minifycss())
        .pipe(gulp.dest('css'))
});

function processScripts (filename, files) {
    return function () {
        return gulp.src(files)
    //        .pipe(jshint('.jshintrc'))
            .pipe(jshint.reporter('default'))
            .pipe(concat(filename + '.js'))
            .pipe(gulp.dest('js'))
            .pipe(rename({suffix: '.min'}))
            .pipe(uglify())
            .pipe(gulp.dest('js'))
    }
}
gulp.task('clientScripts', processScripts('client', ['src/scripts/*.js', 'src/scripts/client/**/*.js']));
gulp.task('physicianScripts', processScripts('physician', ['src/scripts/*.js', 'src/scripts/physician/**/*.js']));
gulp.task('thirdPartyScripts', processScripts('third-party', ['src/scripts/third-party/**/*.js']));

gulp.task('test', function (done) {
  new Server({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, done).start();
});

gulp.task('tdd', function (done) {
  new Server({
    configFile: __dirname + '/karma.conf.js'
  }, done).start();
});

gulp.task('process', function () {
    gulp.watch('src/sass/**/*.scss', ['styles']);
    gulp.watch(['src/scripts/*.js', 'src/scripts/client/**/*.js'], ['clientScripts']);
    gulp.watch(['src/scripts/*.js', 'src/scripts/physician/**/*.js'], ['physicianScripts']);
    gulp.watch(['src/scripts/third-party/**/*.js'], ['thirdPartyScripts']);
    gulp.watch('test/**/*.js', ['tdd']);
});

gulp.task('default', ['process']);
