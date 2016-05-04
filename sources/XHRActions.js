(function () {

    'use strict';

    /**
     * @param {XHRPromise} xhrPromise
     * @constructor XHRActions
     */
    function XHRActions (xhrPromise) {
        this._promise = xhrPromise;
    }

    XHRActions.prototype.isInProgress = function isInProgress () {
        return this._promise.inProgress;
    };
    XHRActions.prototype.interceptors = function interceptors (data) {
        this._promise.interceptors = data;
        return this;
    };
    XHRActions.prototype.silent = function silent () {
        this._promise.silent = true;
        return this;
    };
    XHRActions.prototype.error = function error (callback) {
        this._promise.addEventListener('error', callback);
        return this;
    };
    XHRActions.prototype.loadStart = function loadStart (callback) {
        this._promise.addEventListener('loadstart', callback);
        return this;
    };
    XHRActions.prototype.progress = function progress (callback) {
        this._promise.addEventListener('progress', callback);
        return this;
    };
    XHRActions.prototype.loadEnd = function loadEnd (callback) {
        this._promise.addEventListener('loadend', callback);
        return this;
    };
    XHRActions.prototype.abort = function abort (callback) {
        this._promise.addEventListener('abort', callback);
        return this;
    };
    XHRActions.prototype.load = function load (callback) {
        this._promise.addEventListener('load', callback);
        return this;
    };
    XHRActions.prototype.success = function success (callback) {
        this._promise.addEventListener('success', callback);
        return this;
    };
    XHRActions.prototype.timeout = function timeout (callback) {
        this._promise.addEventListener('timeout', callback);
        return this;
    };
    XHRActions.prototype.readyStateChange = function readyStateChange (callback) {
        this._promise.addEventListener('readystatechange', callback);
        return this;
    };
    XHRActions.prototype.then = function (callback) {
        this._promise.queue.push(callback);
        return this;
    };
    XHRActions.prototype.getXHR = function getXHR () {
        return this._promise.xhrCollection;
    };

    return XHRActions;

}())