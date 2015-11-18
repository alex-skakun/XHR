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
                result.applyCallback('error', e);
            });
            xhr.addEventListener('progress', function (e) {
                result.applyCallback('progress', e);
            });
            xhr.addEventListener('loadstart', function (e) {
                result.applyCallback('loadstart', e);
            });
            xhr.addEventListener('loadend', function (e) {
                result.applyCallback('loadend', e);
            });
            xhr.addEventListener('abort', function (e) {
                result.applyCallback('abort', e);
            });
            xhr.addEventListener('load', function (e) {
                result.applyCallback('load', e);
                var response = xhr.response;
                if (xhr.responseType !== 'json') {
                    try {
                        response = JSON.parse(xhr.responseText);
                    } catch (e) {
                        response = xhr.responseText;
                    }
                }
                if (xhr.status >= 200 && xhr.status < 400) {
                    if (result.queue.length) {
                        var config = result.getNext();
                        if (typeof config === 'function' && !result.xhrCollection.aborted) {
                            if (result.checkInterceptor('response', xhr)) {
                                var configObject = config(response);
                                if (configObject) {
                                    XHR(configObject, result);
                                } else {
                                    result.applyCallback('success', response, xhr);
                                }
                            }
                        }
                    } else {
                        result.applyCallback('success', response, xhr);
                    }
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
                        xhr.send(dataForSend);
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
        this.xhrCollection = new XHR.XHRCollection(this);
        this.xhrCollection.push(xhr);
        this.silent = false;
        this.interceptors = {};
        this.queue = [];
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




