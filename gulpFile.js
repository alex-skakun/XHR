(function () {

    'use strict';

    var gulp = require('gulp'),
        preprocess = require('gulp-preprocess'),
        rename = require('gulp-rename'),
        uglify = require('gulp-uglify'),
        del = require('del'),
        bump = require('gulp-bump');

    gulp.task('preprocess', function (done) {
        gulp.src(['./sources/XHRContainer.js'])
            .pipe(preprocess())
            .pipe(rename('xhr.js'))
            .pipe(gulp.dest('./'))
            .on('end', done)
    });

    gulp.task('uglify', ['preprocess'], function () {
        gulp.src('./xhr.js')
            .pipe(uglify({
                mangle: {
                    except: [
                        'EventTargetExtendable',
                        'EventCollection',
                        'EventCollectionItem',
                        'XHRActions',
                        'XHRPromise',
                        'XHRCollection'
                    ]
                }
            }))
            .pipe(rename('xhr.min.js'))
            .pipe(gulp.dest('./'));
    });

    gulp.task('clean', function (cb) {
        del([
            './xhr.js',
            './xhr.min.js'
        ], cb);
    });

    gulp.task('version', function (cb) {
        gulp.src([
                './package.json',
                './bower.json'
            ])
            .pipe(bump())
            .pipe(gulp.dest('./'))
            .on('end', cb);
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
        'version'
    ]);

}());




