module.exports = function(config) {
    config.set({
        frameworks: ['jasmine'],
        files: [
            './dist/ete.js',
            './tests/*.*'
        ]
    });
};