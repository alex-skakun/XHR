(function (global) {

    'use strict';

    function XHRActions (xhr) {
        function assignCallback (name, fn) {
            if (typeof fn === 'function') {
                callbacks[name] = fn;
            }
        }

        var callbacks = {
                error: function () {},
                success: function () {},
                loadStart: function () {},
                progress: function () {},
                loadEnd: function () {},
                abort: function () {},
                load: function () {}
            },
            actions = {
                error: function error (callback) {
                    assignCallback('error', callback);
                    return actions;
                },
                success: function success (callback) {
                    assignCallback('success', callback);
                    return actions;
                },
                loadStart: function loadStart (callback) {
                    assignCallback('loadStart', callback);
                    return actions;
                },
                progress: function progress (callback) {
                    assignCallback('progress', callback);
                    return actions;
                },
                loadEnd: function loadEnd (callback) {
                    assignCallback('loadEnd', callback);
                    return actions;
                },
                abort: function abort (callback) {
                    assignCallback('abort', callback);
                    return actions;
                },
                load: function load (callback) {
                    assignCallback('load', callback);
                    return actions;
                },
                getXHR: function getXHR () {
                    return xhr;
                }
            };
        return {
            callbacks: callbacks,
            actions: actions
        };
    }

    function setHeaders (xhr, headers) {
        var resultHeaders = {};
        for (var header in XHR.defaultHeaders) {
            if (XHR.defaultHeaders.hasOwnProperty(header)) {
                resultHeaders[header] = XHR.defaultHeaders[header];
            }
        }
        if (typeof headers === 'object') {
            for (var customHeader in headers) {
                if (headers.hasOwnProperty(customHeader)) {
                    if (resultHeaders[customHeader] !== undefined) {
                        delete resultHeaders[customHeader];
                    }
                    resultHeaders[customHeader] = headers[customHeader];
                }
            }
        }
        for (var resultHeader in resultHeaders) {
            if (resultHeaders.hasOwnProperty(resultHeader)) {
                var headerValue = resultHeaders[resultHeader];
                if (headerValue) {
                    xhr.setRequestHeader(resultHeader, String(headerValue));
                }
            }
        }
    }


    function XHR (config) {
        if (config && typeof config.method === 'string' && typeof config.url === 'string') {
            var xhr = new XMLHttpRequest(),
                result = new XHRActions(xhr),
                queryParams = '',
                async = true,
                dataForSend = null;

            if (typeof config.attributes === 'object') {
                var attributes = Object.keys(config.attributes) || [];
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
