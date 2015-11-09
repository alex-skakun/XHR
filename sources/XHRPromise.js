(function (XHR) {

    'use strict';

    function XHRPromise (xhr) {
        var _this = this;
        this.silent = false;
        this.callbacks = {
            error: null,
            loadStart: null,
            progress: null,
            loadEnd: null,
            abort: null,
            load: null,
            success: null
        };
        this.actions = {
            silent: function silent () {
                _this.silent = true;
                return _this.actions;
            },
            error: function error (callback) {
                _this.callbacks.error = callback;
                return _this.actions;
            },
            loadStart: function loadStart (callback) {
                _this.callbacks.loadStart = callback;
                return _this.actions;
            },
            progress: function progress (callback) {
                _this.callbacks.progress = callback;
                return _this.actions;
            },
            loadEnd: function loadEnd (callback) {
                _this.callbacks.loadEnd = callback;
                return _this.actions;
            },
            abort: function abort (callback) {
                _this.callbacks.abort = callback;
                return _this.actions;
            },
            load: function load (callback) {
                _this.callbacks.load = callback;
                return _this.actions;
            },
            success: function success (callback) {
                _this.callbacks.success = callback;
                return _this.actions;
            },
            getXHR: function getXHR () {
                return xhr;
            }
        };

    }

    XHRPromise.prototype.applyCallback = function applyCallback (callbackName, data) {
        var callback = this.callbacks[callbackName];
        if (typeof callback === 'function') {
            callback(data);
        }
    };

    XHR.XHRPromise = XHRPromise;

}(window.XHR));
