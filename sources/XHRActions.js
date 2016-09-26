(function () {

    'use strict';

    /**
     * @param {XHRPromise} xhrPromise
     * @constructor XHRActions
     */
    function XHRActions (xhrPromise) {
        this._promise = xhrPromise;
    }

    /**
     * @returns {Boolean}
     */
    XHRActions.prototype.isInProgress = function isInProgress () {
        return this._promise.inProgress;
    };
    /**
     * @param {Object} data
     * @returns {XHRActions}
     */
    XHRActions.prototype.interceptors = function interceptors (data) {
        this._promise.interceptors = data;
        return this;
    };
    /**
     * @returns {XHRActions}
     */
    XHRActions.prototype.silent = function silent () {
        this._promise.silent = true;
        return this;
    };
    /**
     * @param {Function} callback
     * @returns {XHRActions}
     */
    XHRActions.prototype.error = function error (callback) {
        this._promise.addEventListener('error', callback);
        return this;
    };
    /**
     * @param {Function} callback
     * @returns {XHRActions}
     */
    XHRActions.prototype.loadStart = function loadStart (callback) {
        this._promise.addEventListener('loadstart', callback);
        return this;
    };
    /**
     * @param {Function} callback
     * @returns {XHRActions}
     */
    XHRActions.prototype.progress = function progress (callback) {
        this._promise.addEventListener('progress', callback);
        return this;
    };
    /**
     * @param {Function} callback
     * @returns {XHRActions}
     */
    XHRActions.prototype.loadEnd = function loadEnd (callback) {
        this._promise.addEventListener('loadend', callback);
        return this;
    };
    /**
     * @param {Function} callback
     * @returns {XHRActions}
     */
    XHRActions.prototype.abort = function abort (callback) {
        this._promise.addEventListener('abort', callback);
        return this;
    };
    /**
     * @param {Function} callback
     * @returns {XHRActions}
     */
    XHRActions.prototype.load = function load (callback) {
        this._promise.addEventListener('load', callback);
        return this;
    };
    /**
     * @param {Function} callback
     * @returns {XHRActions}
     */
    XHRActions.prototype.success = function success (callback) {
        this._promise.addEventListener('success', callback);
        return this;
    };
    /**
     * @param {Function} callback
     * @returns {XHRActions}
     */
    XHRActions.prototype.timeout = function timeout (callback) {
        this._promise.addEventListener('timeout', callback);
        return this;
    };
    /**
     * @param {Function} callback
     * @returns {XHRActions}
     */
    XHRActions.prototype.readyStateChange = function readyStateChange (callback) {
        this._promise.addEventListener('readystatechange', callback);
        return this;
    };
    /**
     * @param {Function} callback
     * @returns {XHRActions}
     */
    XHRActions.prototype.then = function (callback) {
        this._promise.queue.push(callback);
        return this;
    };
    /**
     * @returns {XHRCollection}
     */
    XHRActions.prototype.getXHR = function getXHR () {
        return this._promise.xhrCollection;
    };

    return XHRActions;

}())