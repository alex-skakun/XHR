(function (global) {

    'use strict';

    var Promise = global.Promise;

    var interceptorTypes = {
        'request': 'request',
        'success': 'response',
        'error': 'responseError',
        'abort': 'abort'
    };

    function getXHROptions (xhr) {
        var type = xhr.responseType;
        return {
            readyState: xhr.readyState,
            response: xhr.response,
            responseText: type === '' || type === 'text' ? xhr.responseText : null,
            status: xhr.status,
            statusText: xhr.statusText
        };
    }

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
        this.xhrCollection = new XHRCollection(this);
        if (xhr !== undefined) {
            this.xhrCollection.push(xhr);
        }
        this.silent = false;
        this.interceptors = {};
        this.queue = [];
        this.actions = new XHRActions(this);
    }

    XHRPromise.prototype = Object.create(EventTargetExtendable.prototype, {
        constructor: {
            value: XHRPromise
        }
    });

    XHRPromise.prototype.destroy = function destroy () {
        this.dispatchEvent('destroy');
        if (XHR.workerMode) {
            this.sendMessageToMainThread('destroy');
        }
        this.inProgress = false;
        this.removeAllListeners();
    };

    function getPrototypes (obj) {
        var prototypes = [],
            proto = Object.getPrototypeOf(obj);
        while (proto) {
            prototypes.push(proto);
            proto = Object.getPrototypeOf(proto.constructor.prototype);
        }
        return prototypes;
    }

    function copyObject (data) {
        var copy = {},
            properties = getPrototypes(data).reverse()
                .map(function (proto) {
                    return Object.getOwnPropertyNames(proto)
                        .map(function (property) {
                            return {
                                property: property,
                                proto: proto
                            };
                        });
                })
                .reduce(function (a, b) {
                    return a.concat(b);
                }, []);
        if (Array.isArray(properties)) {
            properties.forEach(function (item) {
                var descriptor = Object.getOwnPropertyDescriptor(item.proto, item.property),
                    value = data[item.property];
                if (typeof descriptor.get === 'function' && !(value instanceof Object)) {
                    copy[item.property] = value;
                }
            });
        }

        return copy;
    }

    XHRPromise.prototype.sendMessageToMainThread = function sendMessageToMainThread (callbackName, data, xhr) {
        var message = {
            guid: this.guid,
            eventName: callbackName,
            data: data,
            xhrOptions: xhr ? getXHROptions(xhr) : null
        };
        try {
            global.postMessage(message);
        } catch (e) {
            message.data = copyObject(data);
            global.postMessage(message);
        }
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
                        if (XHR.workerMode) {
                            _this.sendMessageToMainThread(callbackName, interceptorResult, xhr);
                        } else {
                            _this.dispatchEvent(callbackName, interceptorResult, xhr);
                        }
                        if (callbackName === 'success' || callbackName === 'error' || callbackName === 'abort' ||
                            callbackName === 'timeout') {
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
        if (xhr instanceof XHRCollection) {
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