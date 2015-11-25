(function (XHR) {

    'use strict';

    var interceptorTypes = {
        success: 'response',
        error: 'responseError'
    };

    function XHRPromise (xhr) {
        var _this = this;
        this.xhrCollection = new XHR.XHRCollection(this);
        this.xhrCollection.push(xhr);
        this.silent = false;
        this.interceptors = {};
        this.queue = [];
        this.callbacks = {
            error: null,
            loadstart: null,
            progress: null,
            loadend: null,
            abort: null,
            load: null,
            success: null
        };
        this.actions = {
            interceptors: function interceptors (data) {
                _this.interceptors = data;
                return _this.actions;
            },
            silent: function silent () {
                _this.silent = true;
                return _this.actions;
            },
            error: function error (callback) {
                _this.callbacks.error = callback;
                return _this.actions;
            },
            loadStart: function loadStart (callback) {
                _this.callbacks.loadstart = callback;
                return _this.actions;
            },
            progress: function progress (callback) {
                _this.callbacks.progress = callback;
                return _this.actions;
            },
            loadEnd: function loadEnd (callback) {
                _this.callbacks.loadend = callback;
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
            then: function (callback) {
                _this.queue.push(callback);
                return _this.actions;
            },
            getXHR: function getXHR () {
                return _this.xhrCollection;
            }
        };

    }

    XHRPromise.prototype.applyCallback = function applyCallback (callbackName, data, xhr) {
        var callback = this.callbacks[callbackName];
        if (this.checkInterceptor(interceptorTypes[callbackName], xhr)) {
            if (typeof callback === 'function') {
                callback.call(null, this.applyOwnInterceptor(interceptorTypes[callbackName], data), xhr);
            }
        }
    };

    XHRPromise.prototype.checkInterceptor = function checkInterceptor (interceptorName, xhr) {
        if (interceptorName && typeof XHR.interceptors[interceptorName] === 'function') {
            return XHR.interceptors[interceptorName](xhr) || this.silent;
        }
        return true;
    };

    XHRPromise.prototype.applyOwnInterceptor = function applyOwnInterceptor (interceptorName, data) {
        var interceptor = this.interceptors[interceptorName];
        if (typeof interceptor === 'function') {
            return interceptor(data);
        } else {
            return data;
        }
    };

    XHRPromise.prototype.getNext = function getNext () {
        return this.queue.shift();
    };

    XHRPromise.prototype.addToQueue = function addToQueue (xhr) {
        this.xhrCollection.push(xhr);
        return this;
    };

    XHR.XHRPromise = XHRPromise;

}(window.XHR));
