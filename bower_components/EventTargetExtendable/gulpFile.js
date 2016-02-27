(function () {

    'use strict';

    var gulp = require('gulp'),
        preprocess = require('gulp-preprocess'),
        rename = require('gulp-rename'),
        uglify = require('gulp-uglify'),
        del = require('del'),
        bump = require('gulp-bump'),
        tagVersion = require('gulp-tag-version');

    gulp.task('preprocess', function (done) {
        gulp.src(['./src/EventTargetExtendable.js'])
            .pipe(preprocess())
            .pipe(rename('ete.js'))
            .pipe(gulp.dest('./dist'))
            .on('end', done)
    });

    gulp.task('uglify', ['preprocess'], function () {
        gulp.src('./dist/ete.js')
            .pipe(uglify({
                mangle: {
                    except: [
                        'EventTargetExtendable',
                        'EventCollection',
                        'EventCollectionItem'
                    ]
                }
            }))
            .pipe(rename('ete.min.js'))
            .pipe(gulp.dest('./dist'));
    });

    gulp.task('clean', function (cb) {
        del([
            './dist/*'
        ], cb);
    });

    gulp.task('version', function (cb) {
        gulp.src('./package.json')
            .pipe(bump())
            .pipe(gulp.dest('./'))
            .on('end', cb);
    });

    gulp.task('release-tag', ['version'], function () {
        gulp.src(['./package.json'])
            .pipe(tagVersion());
    });

    gulp.task('build', [
        'clean',
        'preprocess',
        'uglify'
    ]);

    gulp.task('release', [
        'clean',
        'preprocess',
        'uglify',
        'version',
        'release-tag'
    ]);

}());




