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

(function (global) {

    'use strict';

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
        if (typeof headers === 'object') {
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


    function XHR (config, promise) {
        if (!config) {
            throw new Error('Config object is required.');
        } else {
            var xhr = new XMLHttpRequest(),
                result = promise ? promise.addToQueue(xhr) : new XHR.XHRPromise(xhr),
                queryParams = '',
                async = true,
                dataForSend = null;

            // setting HTTP method
            config.method = typeof config.method === 'string' ? config.method : XHR.defaults.method;

            // applying attributes to instance of XMLHttpRequest
            if (typeof config.attributes === 'object' && config.attributes) {
                var attributes = Object.keys(config.attributes);
                attributes.forEach(function (attribute) {
                    xhr[attribute] = config.attributes[attribute];
                });
            }

            // setting query params
            if (typeof config.params === 'object' && config.params) {
                var params = [],
                    paramsKeys = Object.keys(config.params);
                paramsKeys.forEach(function (param) {
                    var value = config.params[param];
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

            // setting async
            if (config.async !== undefined) {
                async = !!config.async;
            }

            // setting data
            if (config.data !== undefined) {
                var d = config.data;
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

            // adding event listeners
            xhr.addEventListener('error', function (e) {
                result.applyCallback('error', e, xhr);
            });
            xhr.addEventListener('timeout', function (e) {
                result.applyCallback('timeout', e, xhr);
            });
            xhr.addEventListener('progress', function (e) {
                result.applyCallback('progress', e, xhr);
            });
            xhr.addEventListener('loadstart', function (e) {
                result.applyCallback('loadstart', e, xhr);
            });
            xhr.addEventListener('loadend', function (e) {
                result.applyCallback('loadend', e, xhr);
            });
            xhr.addEventListener('abort', function (e) {
                result.applyCallback('abort', e, xhr);
            });
            xhr.addEventListener('load', function (e) {
                result.applyCallback('load', e, xhr);
                var response = xhr.response;
                if (xhr.responseType === '' || xhr.responseType === 'text') {
                    try {
                        response = JSON.parse(xhr.responseText);
                    } catch (e) {
                        response = xhr.responseText;
                    }
                }
                if (xhr.status >= 200 && xhr.status < 400) {
                    var applyQueue = function (response) {
                        if (result.queue.length) {
                            var config = result.getNext();
                            if (typeof config === 'function' && !result.xhrCollection.aborted) {
                                if (result.checkInterceptor('response', xhr)) {
                                    var configObject = config(response);
                                    if (configObject) {
                                        if (configObject.hasOwnProperty('url')) {
                                            XHR(configObject, result);
                                        } else {
                                            configObject
                                                .success(function (data) {
                                                    applyQueue(data);
                                                })
                                                .error(function (error) {
                                                    applyQueue(error);
                                                });
                                        }
                                    } else {
                                        result.applyCallback('success', response, xhr);
                                    }
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
            }, false);

            // waits for opening
            xhr.onreadystatechange = function () {
                if (xhr.readyState === XMLHttpRequest.OPENED) {
                    xhr.onreadystatechange = null;
                    // setting default and user headers
                    setHeaders(xhr, config.headers);
                    // sending
                    setTimeout(function () {
                        if (xhr.readyState === XMLHttpRequest.OPENED || !result.xhrCollection.aborted) {
                            xhr.send(dataForSend);
                        } else {
                            result.applyCallback('abort');
                        }
                    }, 0);
                }
            };

            xhr.open(config.method, config.url + queryParams, async);

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
            responseError: null
        },
        configurable: true,
        writable: true
    });

    global.XHR = XHR;

    if (typeof define === 'function' && define.amd !== null) {
        define('XHR', [], function () {
            return XHR;
        });
    }

}(window));

(function (XHR) {

    'use strict';

    var interceptorTypes = {
        success: 'response',
        error: 'responseError'
    };

    function XHRPromise (xhr) {
        var _this = this;
        this.inProgress = true;
        this.xhrCollection = new XHR.XHRCollection(this);
        this.xhrCollection.push(xhr);
        this.silent = false;
        this.interceptors = {};
        this.queue = [];
        this.actions = {
            isInProgress: function isInProgress () {
                return _this.inProgress;
            },
            interceptors: function interceptors (data) {
                _this.interceptors = data;
                return _this.actions;
            },
            silent: function silent () {
                _this.silent = true;
                return _this.actions;
            },
            error: function error (callback) {
                _this.addEventListener('error', callback);
                return _this.actions;
            },
            loadStart: function loadStart (callback) {
                _this.addEventListener('loadstart', callback);
                return _this.actions;
            },
            progress: function progress (callback) {
                _this.addEventListener('progress', callback);
                return _this.actions;
            },
            loadEnd: function loadEnd (callback) {
                _this.addEventListener('loadend', callback);
                return _this.actions;
            },
            abort: function abort (callback) {
                _this.addEventListener('abort', callback);
                return _this.actions;
            },
            load: function load (callback) {
                _this.addEventListener('load', callback);
                return _this.actions;
            },
            success: function success (callback) {
                _this.addEventListener('success', callback);
                return _this.actions;
            },
            timeout: function timeout (callback) {
                _this.addEventListener('timeout', callback);
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

    XHRPromise.prototype = Object.create(EventTargetExtendable.prototype, {
        constructor: {
            value: XHRPromise
        }
    });

    XHRPromise.prototype.applyCallback = function applyCallback (callbackName, data, xhr) {
        var _this = this;
        if (this.checkInterceptor(interceptorTypes[callbackName], xhr)) {
            var ownInterceptorResult = this.applyOwnInterceptor(interceptorTypes[callbackName], data),
                continueToCallback = function (interceptorResult) {
                    _this.dispatchEvent(callbackName, interceptorResult, xhr);
                    if (callbackName === 'success' || callbackName === 'error' || callbackName === 'abort' || callbackName === 'timeout') {
                        _this.inProgress = false;
                        _this.removeAllListeners();
                    }
                };
            if (ownInterceptorResult instanceof Promise) {
                ownInterceptorResult
                    .then(continueToCallback)
                    .catch(function (err) {
                        _this.applyCallback('error', err, xhr);
                    });
            } else {
                continueToCallback(ownInterceptorResult);
            }
        }
    };

    XHRPromise.prototype.checkInterceptor = function checkInterceptor (interceptorName, xhr) {
        if (interceptorName && typeof XHR.interceptors[interceptorName] === 'function') {
            return XHR.interceptors[interceptorName](xhr, this.silent) || this.silent;
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

(function (XHR) {

    'use strict';

    function XHRCollection (result) {
        Array.call(this);
        this.result = result;
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
                        this.result.applyCallback('abort');
                    }
                }, this);
                this.aborted = true;
            }
        }
    });

    XHR.XHRCollection = XHRCollection;

}(XHR));




