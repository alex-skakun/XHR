/**
 * @param {Object} global
 * @param {Function} EventCollection
 * @param {Function} EventCollectionItem
 */
(function (global, EventCollection, EventCollectionItem) {

    'use strict';

    var EVENT_LISTENERS = new EventCollection();

    function findTargetItem (target) {
        var allForThisTarget = EVENT_LISTENERS.findForTarget(target);
        if (!allForThisTarget) {
            allForThisTarget = new EventCollectionItem(target);
            EVENT_LISTENERS.add(allForThisTarget);
        }
        return allForThisTarget;
    }

    function EventTargetExtendable (eventsArray) {
        if (Array.isArray(eventsArray)) {
            var listeners = {};
            eventsArray.forEach(function (eventName) {
                var event = eventName.trim().toLowerCase(),
                    property = 'on' + event;
                Object.defineProperty(this, property, {
                    enumerable: true,
                    configurable: false,
                    get: function () {
                        return listeners[event] || null;
                    },
                    set: function (listener) {
                        var oldListener = listeners[event];
                        if (oldListener) {
                            this.removeEventListener(event, oldListener);
                        }
                        if (typeof listener === 'function') {
                            listeners[event] = listener;
                            this.addEventListener(event, listener);
                        }
                    }
                });
            }, this);
        }
    }

    EventTargetExtendable.prototype.addEventListener = function addEventListener (eventType, listener) {
        if (typeof listener === 'function') {
            var targetItem = findTargetItem(this);
            return targetItem.addListener(eventType, listener);
        }
        return false;
    };

    EventTargetExtendable.prototype.removeEventListener = function removeEventListener (eventType, listener) {
        var targetItem = findTargetItem(this);
        return targetItem.removeListener(eventType, listener);
    };

    EventTargetExtendable.prototype.dispatchEvent = function dispatchEvent (eventType) {
        var targetItem = findTargetItem(this),
            listeners = targetItem.getListenersByType(eventType),
            args = Array.prototype.slice.call(arguments, 1),
            _this = this;
        if (listeners) {
            var forExecution = [];
            listeners.forEach(function (listener) {
                if (typeof listener === 'function') {
                    forExecution.push(listener);
                }
            });
            forExecution.forEach(function (listener) {
                listener.apply(_this, args);
            })
        }
    };

    EventTargetExtendable.prototype.removeAllListeners = function removeAllListeners (type) {
        var targetItem = findTargetItem(this);
        if (type) {
            return targetItem.removeListeners(type);
        } else {
            return EVENT_LISTENERS.remove(targetItem);
        }
    };

    var prototype = EventTargetExtendable.prototype,
        methods = Object.keys(EventTargetExtendable.prototype);
    for (var i = 0, l = methods.length; i < l; i++) {
        Object.defineProperty(prototype, methods[i], {
            enumerable: false,
            configurable: false,
            writable: false
        });
    }

    global.EventTargetExtendable = EventTargetExtendable;

}(this,
    (function () {
    
        'use strict';
    
        function EventCollection () {
            var CollectionConstructor;
            try {
                CollectionConstructor = Map;
            } catch (e) {
                CollectionConstructor = Array;
            }
            this.collection = new CollectionConstructor();
        }
    
        EventCollection.prototype.findForTarget = function findForTarget (target) {
            if (Array.isArray(this.collection)) {
                var collection = this.collection;
                for (var i = 0, l = collection.length; i < l; i++) {
                    var item = collection[i];
                    if (item.target === target) {
                        return item;
                    }
                }
            } else {
                return this.collection.get(target);
            }
            return null;
        };
    
        EventCollection.prototype.add = function add (item) {
            if (Array.isArray(this.collection)) {
                this.collection.push(item);
            } else {
                this.collection.set(item.target, item);
            }
        };
    
        EventCollection.prototype.remove = function remove (item) {
            if (Array.isArray(this.collection)) {
                var index = this.collection.indexOf(item);
                if (index > -1) {
                    var removed = this.collection.splice(index, 1);
                    return removed.length === 1;
                }
                return false;
            } else {
                return this.collection.delete(item.target);
            }
        };
    
        return EventCollection;
    
    }()),
    (function () {
    
        'use strict';
    
        function EventCollectionItem (target) {
            this.target = target;
            this.listeners = {};
        }
    
        EventCollectionItem.createListenersCollection = function createListenersCollection () {
            var CollectionConstructor;
            try {
                CollectionConstructor = Set;
            } catch (e) {
                CollectionConstructor = Array;
            }
            return new CollectionConstructor();
        };
    
        EventCollectionItem.prototype.getListenersByType = function getListenersByType (type) {
            var listeners = this.listeners[type];
            if (!listeners) {
                listeners = EventCollectionItem.createListenersCollection();
                this.listeners[type] = listeners;
            }
            return listeners;
        };
    
        EventCollectionItem.prototype.addListener = function addListener (type, listener) {
            var listeners = this.getListenersByType(type);
            if (Array.isArray(listeners)) {
                if (!~listeners.indexOf(listener)) {
                    listeners.push(listener);
                    return true;
                }
                return false;
            } else {
                if (!listeners.has(listener)) {
                    listeners.add(listener);
                    return true;
                }
                return false;
            }
        };
    
        EventCollectionItem.prototype.removeListener = function removeListener (type, listener) {
            var listeners = this.getListenersByType(type);
            if (Array.isArray(listeners)) {
                var index = listeners.indexOf(listener);
                if (index > -1) {
                    var deleted = listeners.splice(index, 1);
                    return deleted.length === 1;
                }
                return false;
            } else {
                return listeners.delete(listener);
            }
        };
    
        EventCollectionItem.prototype.removeListeners = function removeListeners (type) {
            var listeners = this.getListenersByType(type);
            if (Array.isArray(listeners)) {
                listeners.splice(0, listeners.length);
            } else {
                listeners.clear();
            }
            return true;
        };
    
        return EventCollectionItem;
    
    }())
));

(function (global, XHRActions, XHRPromise, XHRCollection) {

    'use strict';

    var Promise = global.Promise;

    function setAttributes (_attributes, xhr) {
        var resultAttributes = {},
            defaultAttributes = Object.keys(XHR.defaults.attributes),
            attr,
            attributesNames,
            i, l;
        for (i = 0, l = defaultAttributes.length; i < l; i++) {
            attr = defaultAttributes[i];
            resultAttributes[attr] = XHR.defaults.attributes[attr];
        }
        if (_attributes && typeof _attributes === 'object') {
            var userAttributes = Object.keys(_attributes);
            for (i = 0, l = userAttributes.length; i < l; i++) {
                attr = userAttributes[i];
                resultAttributes[attr] = _attributes[attr];
                xhr[attr] = _attributes[attr];
            }
        }
        attributesNames = Object.keys(resultAttributes);
        for (i = 0, l = attributesNames.length; i < l; i++) {
            attr = attributesNames[i];
            xhr[attr] = resultAttributes[attr];
        }
    }

    function setQueryParams (_params) {
        var queryParams = '';
        if (_params && typeof _params === 'object') {
            var params = [],
                paramsKeys = Object.keys(_params);
            paramsKeys.forEach(function (param) {
                var value = _params[param];
                if (Array.isArray(value)) {
                    value.forEach(function (val) {
                        params.push(param + '=' + val);
                    });
                } else if (typeof value === 'object' && value) {
                    params.push(param + '=' + JSON.stringify(value));
                } else if (typeof value !== 'undefined') {
                    params.push(param + '=' + value);
                }
            });
            if (params.length) {
                queryParams = '?' + params.join('&');
            }
        }
        return queryParams;
    }

    function setData (data) {
        var dataForSend = null;
        if (data !== undefined) {
            var d = data;
            if (d instanceof (global.ArrayBufferView || global.ArrayBuffer) || d instanceof global.Blob ||
                d instanceof global.Document || d instanceof global.FormData) {
                dataForSend = d;
            } else {
                if (typeof d === 'object' && d) {
                    dataForSend = JSON.stringify(d);
                } else {
                    dataForSend = String(d);
                }
            }
        }
        return dataForSend;
    }

    function setHeaders (xhr, headers) {
        var resultHeaders = {},
            defaultHeadersKeys = Object.keys(XHR.defaults.headers),
            userHeadersKeys,
            resultHeadersKeys,
            header,
            value,
            i, l;
        for (i = 0, l = defaultHeadersKeys.length; i < l; i++) {
            header = defaultHeadersKeys[i];
            resultHeaders[header.toLowerCase()] = XHR.defaults.headers[header];
        }
        if (headers && typeof headers === 'object') {
            userHeadersKeys = Object.keys(headers);
            for (i = 0, l = userHeadersKeys.length; i < l; i++) {
                header = userHeadersKeys[i];
                resultHeaders[header.toLowerCase()] = headers[header];
            }
        }
        resultHeadersKeys = Object.keys(resultHeaders);
        for (i = 0, l = resultHeadersKeys.length; i < l; i++) {
            header = resultHeadersKeys[i];
            value = resultHeaders[header];
            if (typeof value !== 'undefined' && value !== null) {
                xhr.setRequestHeader(header, String(value));
            }
        }
    }

    function createListener (originalListener, promise, xhr) {
        return function (e) {
            if (typeof originalListener === 'string') {
                return promise.applyCallback(originalListener, e, xhr);
            } else if (typeof originalListener === 'function') {
                return originalListener.call(this, e, promise, xhr);
            }
        };
    }
    
    function autoParseResponseText (xhr) {
        var response;
        try {
            response = JSON.parse(xhr.responseText);
        } catch (e) {
            response = xhr.responseText;
        }
        return response;
    }
    
    function makeNextRequestFromConfigObject (configObject, result, xhr) {
        try {
            XHR(configObject, result);
        } catch (e) {
            result.applyCallback('error', e, xhr);
        } 
    }

    function loadEndListener (e, result, xhr) {
        result.applyCallback('loadend', e, xhr);
        var response = xhr.response;
        if (xhr.responseType === '' || xhr.responseType === 'text') {
            response = autoParseResponseText(xhr);
        }
        if (xhr.status >= 200 && xhr.status < 400) {
            var applyQueue = function (response) {
                if (result.queue.length) {
                    var nextRequest = result.getNext();
                    if (typeof nextRequest === 'function' && !result.xhrCollection.aborted) {
                        var interceptorResult = result.checkInterceptor('response', xhr),
                            makeNextRequest = function () {
                                var configObject = nextRequest(response);
                                if (configObject) {
                                    if (configObject instanceof XHRActions) {
                                        configObject
                                            .success(function (data) {
                                                applyQueue(data);
                                            })
                                            .error(function (error) {
                                                applyQueue(error);
                                            });
                                    } else {
                                        makeNextRequestFromConfigObject(configObject, result);
                                    }
                                } else {
                                    result.applyCallback('success', response, xhr);
                                }
                            };
                        if (Promise && interceptorResult instanceof Promise) {
                            interceptorResult.then(makeNextRequest);
                        } else if (interceptorResult) {
                            makeNextRequest();
                        }
                    }
                } else {
                    result.applyCallback('success', response, xhr);
                }
            };
            applyQueue(response);
        } else if (xhr.status >= 400 && xhr.status < 600) {
            result.applyCallback('error', response, xhr);
        }
    }

    /**
     * @param {Object} config
     * @param {XHRPromise} promise
     * @returns {XHRActions}
     */
    function XHR (config, promise) {
        if (!config) {
            throw new Error('Config object is required.');
        } else if (!config.url) {
            throw new Error('URL option is required.');
        } else {
            var xhr = new XMLHttpRequest(),
                result = promise ? promise.addToQueue(xhr) : new XHR.XHRPromise(xhr),
                queryParams,
                async = true,
                dataForSend,
                events = [
                    'error',
                    'timeout',
                    'progress',
                    'loadstart',
                    'load',
                    'abort',
                    'readystatechange',
                    {
                        type: 'loadend',
                        listener: loadEndListener
                    }
                ];

            // setting HTTP method
            config.method = typeof config.method === 'string' ? config.method : XHR.defaults.method;

            // setting async
            if (config.async !== undefined) {
                async = !!config.async;
            }

            // applying attributes to instance of XMLHttpRequest
            setAttributes(config.attributes, xhr);

            // setting query params
            queryParams = setQueryParams(config.params);

            // setting data
            dataForSend = setData(config.data);

            // event listeners subscription
            events = events.map(function (listenerData) {
                var type = listenerData instanceof Object ? listenerData.type : listenerData,
                    listener = listenerData instanceof Object ? listenerData.listener : listenerData,
                    _listener = createListener(listener, result, xhr);
                xhr.addEventListener(type, _listener);
                return {
                    type: type,
                    listener: _listener
                };
            });

            result.addEventListener('destroy', function destroyListener () {
                result.removeEventListener('destroy', destroyListener);
                events.forEach(function (eventData) {
                    xhr.removeEventListener(eventData.type, eventData.listener);
                });
            });

            // waits for opening
            xhr.addEventListener('readystatechange', function openListener () {
                if (xhr.readyState === XMLHttpRequest.OPENED) {
                    xhr.removeEventListener('readystatechange', openListener);
                    // setting default and user headers
                    setHeaders(xhr, config.headers);
                    // sending
                    xhr.send(dataForSend);
                    result.applyCallback('request', dataForSend, xhr);
                }
            });

            setTimeout(function () {
                if (!result.xhrCollection.aborted) {
                    xhr.open(config.method, config.url + queryParams, async);
                } else {
                    result.applyCallback('abort', null, xhr);
                }
            }, 0);

            return result.actions;
        }
    }

    Object.defineProperty(XHR, 'defaults', {
        value: {
            method: 'GET',
            headers: {},
            attributes: {
                responseType: '',
                timeout: 0
            }
        },
        configurable: false,
        writable: false
    });

    Object.defineProperty(XHR, 'interceptors', {
        value: {
            response: null,
            responseError: null,
            request: null
        },
        configurable: true,
        writable: true
    });

    global.XHR = XHR;

    XHR.XHRActions = XHRActions;
    XHR.XHRPromise = XHRPromise;
    XHR.XHRCollection = XHRCollection;

}(this,
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
    
    }()),
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
    
    }(this)),
    (function () {
    
        'use strict';
    
        function XHRCollection (promise) {
            Array.call(this);
            this.promise = promise;
            this.aborted = false;
        }
    
        XHRCollection.prototype = Object.create(Array.prototype, {
            constructor: {
                value: XHRCollection
            },
            abort: {
                value: function abort () {
                    this.forEach(function (xhr) {
                        if (xhr instanceof XMLHttpRequest) {
                            xhr.abort();
                        } else {
                            clearTimeout(xhr);
                            this.promise.applyCallback('abort');
                        }
                    }, this);
                    this.aborted = true;
                }
            }
        });
    
        return XHRCollection;
    
    }())
));
