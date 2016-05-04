(function (global) {

    'use strict';

    var Promise = global.Promise;
    
    var interceptorTypes = {
        'request': 'request',
        'success': 'response',
        'error': 'responseError'
    };

    /**
     * @param {(XMLHttpRequest | Number)} xhr
     * @constructor XHRPromise
     * @extends EventTargetExtendable
     * @property {Boolean}          inProgress
     * @property {XHRCollection}    XHRCollection
     * @property {Boolean}          silent
     * @property {Function[]}       queue
     * @property {XHRActions}       actions
     */
    function XHRPromise (xhr) {
        this.inProgress = true;
        this.xhrCollection = new XHR.XHRCollection(this);
        if (xhr !== undefined) {
            this.xhrCollection.push(xhr);
        }
        this.silent = false;
        this.interceptors = {};
        this.queue = [];
        this.actions = new XHR.XHRActions(this);
    }

    XHRPromise.prototype = Object.create(EventTargetExtendable.prototype, {
        constructor: {
            value: XHRPromise
        }
    });
    
    XHRPromise.prototype.destroy = function destroy () {
        this.dispatchEvent('destroy');
        this.inProgress = false;
        this.removeAllListeners();
    };

    /**
     * Executes specified callback
     * @param {String} callbackName
     * @param {*} data
     * @param {XMLHttpRequest} xhr
     */
    XHRPromise.prototype.applyCallback = function applyCallback (callbackName, data, xhr) {
        var _this = this,
            globalInterceptorResult = this.checkInterceptor(interceptorTypes[callbackName], xhr),
            interceptorResolved = function () {
                var ownInterceptorResult = _this.applyOwnInterceptor(interceptorTypes[callbackName], data),
                    continueToCallback = function (interceptorResult) {
                        _this.dispatchEvent(callbackName, interceptorResult, xhr);
                        if (callbackName === 'success' || callbackName === 'error' || callbackName === 'abort' || callbackName === 'timeout') {
                            _this.destroy();
                        }
                    };
                if (Promise && ownInterceptorResult instanceof Promise) {
                    ownInterceptorResult.then(continueToCallback, interceptorRejected);
                } else {
                    continueToCallback(ownInterceptorResult);
                }
            },
            interceptorRejected = function () {
                _this.destroy();
            };
        
        if (Promise && globalInterceptorResult instanceof Promise) {
            globalInterceptorResult.then(interceptorResolved, interceptorRejected);
        } else {
            if (globalInterceptorResult) {
                interceptorResolved();
            } else {
                _this.destroy();
            }
        }
    };

    /**
     * Makes a check of global interceptor
     * @param {String} interceptorName
     * @param {XMLHttpRequest} xhr
     * @returns {(Boolean | Promise)}
     */
    XHRPromise.prototype.checkInterceptor = function checkInterceptor (interceptorName, xhr) {
        if (interceptorName && typeof XHR.interceptors[interceptorName] === 'function') {
            return this.silent || XHR.interceptors[interceptorName](xhr);
        }
        return true;
    };

    /**
     * Executes an interceptor for data
     * @param {String} interceptorName
     * @param {Object} data
     * @returns {(* | Promise)}
     */
    XHRPromise.prototype.applyOwnInterceptor = function applyOwnInterceptor (interceptorName, data) {
        var interceptor = this.interceptors[interceptorName];
        if (typeof interceptor === 'function') {
            return interceptor(data);
        } else {
            return data;
        }
    };

    /**
     * Returns next function from requests queue
     * @returns {Function}
     */
    XHRPromise.prototype.getNext = function getNext () {
        return this.queue.shift();
    };

    /**
     * @param {(XMLHttpRequest | Number)} xhr
     * @returns {XHRPromise}
     */
    XHRPromise.prototype.addToQueue = function addToQueue (xhr) {
        if (xhr instanceof XHR.XHRCollection) {
            var collection = this.xhrCollection,
                startItem = collection.length,
                args = xhr.slice();
            args.unshift(0);
            args.unshift(startItem);
            collection.splice.apply(collection, args);
        } else {
            this.xhrCollection.push(xhr);
        }
        return this;
    };

    return XHRPromise;

}(this))