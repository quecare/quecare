var fs = require('fs'),
    path = require('path'),
    process = require('process'),
    gulp = require('gulp'),
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
    gulp.watch(['src/scripts/*.js', 'src/scripts/client/**/*.js'], ['client']);
    gulp.watch(['src/scripts/*.js', 'src/scripts/physician/**/*.js'], ['physician']);
    gulp.watch(['src/scripts/third-party/**/*.js'], ['third-party']);
    gulp.watch(['src/scripts/twilio-video/**/*.js'], ['twilio-video']);
    gulp.watch(['src/scripts/video/**/*.js'], ['video']);
    gulp.watch('test/**/*.js', ['tdd']);
});

gulp.task('default', ['process']);

var rootPath = process.cwd();
var scriptsFolder = 'src/scripts';

/* scan scripts folder
*  take directories as modules
*  setup task for each module.
*/
fs.readdir(scriptsFolder, function (err, files) {
    if (err) {
        console.error('Error listing dir', error);
        process.exit(1);
    }

    files.forEach(function (file, index) {
        var fullFilename = path.join(rootPath, scriptsFolder, file);

        fs.stat(fullFilename, function (error, stat) {
            if (error) {
                console.error('Error stating file', error);
                return;
            }

            if (stat.isDirectory()) {
                var filesToProcess = [fullFilename + '/**/*.js'];

                // add other files required by client and physician modules.
                if (file == 'client' || file == 'physician') {
                    filesToProcess.push(scriptsFolder + '/*.js');
                }
                gulp.task(file, processScripts(file, filesToProcess));
            }
        });
    });
});