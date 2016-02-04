module.exports = function (grunt) {

    'use strict';

    grunt.initConfig({
        concat: {
            release: {
                files: {
                    './xhr.js': [
                        './bower_components/EventTargetExtendable/dist/ete.min.js',
                        './sources/XHR.js',
                        './sources/XHRPromise.js',
                        './sources/XHRCollection.js'
                    ]
                }
            }
        },
        uglify: {
            options: {
                compress: {}
            },
            release: {
                files: {
                    './xhr.min.js': [
                        './xhr.js'
                    ]
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.registerTask('build', [
        'concat:release',
        'uglify:release'
    ]);

};
