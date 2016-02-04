(function () {

    'use strict';

    var gulp = require('gulp'),
        rename = require('gulp-rename'),
        uglify = require('gulp-uglify');

    gulp.task('default', function () {
        gulp.src('./src/*.js')
            .pipe(uglify())
            .pipe(rename('ete.min.js'))
            .pipe(gulp.dest('./dist'));
    });

}());




