module.exports = function(config) {
    config.set({
        frameworks: ['jasmine'],
        files: [
            './xhr.mock.js',
            './tests/unit/DefaultsAndGlobals.mock.js',
            './tests/unit/SimpleRequests.mock.js',
            './tests/unit/XHRCollection.js',
            './tests/unit/XHRPromiseWithOutRequests.js',
            './tests/unit/XHRPromise.mock.js'
        ]
    });
};