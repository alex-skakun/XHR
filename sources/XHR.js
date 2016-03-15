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
