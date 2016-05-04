module.exports = function(config) {
    config.set({
        frameworks: ['jasmine'],
        files: [
            './xhr.js',
            './tests/unit/SimpleRequests.js',
            './tests/unit/XHRCollection.js',
            './tests/unit/XHRPromise.js',
            './tests/unit/DefaultsAndGlobals.js'
        ]
    });
};