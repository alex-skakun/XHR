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
            header = defaultHeadersKeys[i].toLowerCase();
            resultHeaders[header] = XHR.defaultHeaders[header];
        }
        if (typeof headers === 'object') {
            userHeadersKeys = Object.keys(headers);
            for (i = 0, l = userHeadersKeys.length; i < l; i++) {
                header = userHeadersKeys[i].toLowerCase();
                resultHeaders[header] = headers[header];
            }
        }
        resultHeadersKeys = Object.keys(resultHeaders);
        for (i = 0, l = resultHeadersKeys.length; i < l; i++) {
            header = resultHeadersKeys[i];
            value = resultHeaders[header];
            if (!isNaN(value) && typeof value !== 'undefined' && value !== null) {
                xhr.setRequestHeader(header, String(value));
            }
        }
    }


    function XHR (config) {
        if (!config) {
            throw new Error('Config object is required.');
        } else {
            var xhr = new XMLHttpRequest(),
                result = new XHR.XHRPromise(xhr),
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

            xhr.open(config.method, config.url + queryParams, async);

            // setting default and user settings
            setHeaders(xhr, config.headers);

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
                    result.applyCallback('success', response);
                } else if (xhr.status >= 400 && xhr.status < 600) {
                    result.applyCallback('error', e);
                }
            }, false);

            // sending
            setTimeout(function () {
                xhr.send(dataForSend);
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

    global.XHR = XHR;

    if (typeof define === 'function' && define.amd !== null) {
        define([], function () {
            return XHR;
        });
    }

}(window));

(function (XHR) {

    'use strict';

    function XHRPromise (xhr) {
        var _this = this;
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
