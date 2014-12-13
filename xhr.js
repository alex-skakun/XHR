(function (global) {

    'use strict';

    function setHeaders (xhr, headers) {
        var resultHeaders = {},
            defaultHeadersKeys = Object.keys(XHR.defaultHeaders),
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
        if (config && typeof config.method === 'string' && typeof config.url === 'string') {
            var xhr = new XMLHttpRequest(),
                result = new XHR.XHRPromise(xhr),
                queryParams = '',
                async = true,
                dataForSend = null;

            if (typeof config.attributes === 'object') {
                var attributes = Object.keys(config.attributes);
                attributes.forEach(function (attribute) {
                    xhr[attribute] = config.attributes[attribute];
                });
            }

            // setting query params
            if (typeof config.params === 'object') {
                var params = [];
                for (var paramName in config.params) {
                    if (config.params.hasOwnProperty(paramName)) {
                        var paramValue = config.params[paramName];
                        if (Array.isArray(paramValue)) {
                            for (var i = 0, l = paramValue.length; i < l; i++) {
                                params.push(paramName + '=' + paramValue[i]);
                            }
                        } else if (typeof paramValue === 'object') {
                            throw new Error('Value of query parameter can not be object');
                        } else {
                            params.push(paramName + '=' + paramValue);
                        }
                    }
                }
                if (params.length) {
                    queryParams = '?' + params.join('&');
                }
            }

            // setting async
            if (config.async !== undefined) {
                async = config.async;
            }

            xhr.open(config.method, config.url + queryParams, async);

            setHeaders(xhr, config.headers);

            // setting data
            if (config.data !== undefined) {
                var d = config.data;
                if (d instanceof (global.ArrayBufferView || global.ArrayBuffer) || d instanceof global.Blob ||
                    d instanceof global.Document || d instanceof global.FormData) {
                    dataForSend = d;
                } else {
                    if (typeof d === 'object') {
                        dataForSend = JSON.stringify(d);
                    } else {
                        dataForSend = String(d);
                    }
                }
            }
            xhr.addEventListener('load', function () {
                var data = {
                        xhr: xhr,
                        /**
                         * @type {(Object | string)}
                         */
                        response: null
                    },
                    parseError = false;
                try {
                    data.response = JSON.parse(xhr.responseText);
                } catch (e) {
                    parseError = true;
                } finally {
                    if (parseError) {
                        var invalidStateError = false;
                        try {
                            data.response = xhr.responseText;
                        } catch (e) {
                            invalidStateError = true;
                        } finally {
                            if (invalidStateError) {
                                data.response = xhr.response;
                            }
                        }
                    }
                }

                result.callbacks.load(xhr);
                if (xhr.status >= 200 && xhr.status < 400) {
                    result.callbacks.success(data);
                } else if (xhr.status >= 400 && xhr.status < 600) {
                    /** @namespace data.response.Message */
                    var errorMessage = data.response && data.response.Message ? data.response.Message : data.response,
                        error = new Error();
                    error.message = 'XHR Error. Status code ' + data.xhr.status + ': ' + errorMessage;
                    data.error = error;
                    result.callbacks.error(data);
                }
            }, false);
            xhr.addEventListener('error', function () {
                result.callbacks.error();
            });
            xhr.addEventListener('progress', function (e) {
                result.callbacks.progress(xhr, e);
            });
            xhr.addEventListener('loadstart', function (e) {
                result.callbacks.loadStart(xhr, e);
            });
            xhr.addEventListener('loadend', function (e) {
                result.callbacks.loadEnd(xhr, e);
            });
            xhr.addEventListener('abort', function (e) {
                result.callbacks.abort(xhr, e);
            });
            setTimeout(function () {
                xhr.send(dataForSend);
            }, 0);
            return result.actions;
        } else {
            throw new Error('Wrong config object.');
        }
    }

    Object.defineProperty(XHR, 'defaultHeaders', {
        value: {},
        configurable: false
    });

    global.XHR = XHR;

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
