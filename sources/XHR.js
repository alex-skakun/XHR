(function (global) {

    'use strict';

    var Promise = global.Promise;
    /* @if MOCK **
    /* @include FakeXMLHttpRequest.js */

    var XHR_ACTIONS = new Map();

    /* @endif */

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
        if (data !== undefined && data !== null) {
            var d = data;
            if (d instanceof (global.ArrayBufferView || global.ArrayBuffer) || d instanceof global.Blob ||
                (!XHR.workerMode ? d instanceof global.Document : false) || (!XHR.workerMode ? d instanceof global.FormData : false)) {
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
     * @param {XHRPromise} [promise]
     * @returns {XHRActions}
     */
    function XHR (config, promise) {
        if (!config) {
            throw new Error('Config object is required.');
        } else if (!config.url) {
            throw new Error('URL option is required.');
        } else {
            var xhr = this instanceof XHRWorker ? this : new XMLHttpRequest(),
                result = promise ? promise.addToQueue(xhr) : new XHRPromise(xhr),
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

            if (xhr instanceof XHRWorker) {
                xhr.addEventListener('event', function (eventName, data, xhr) {
                    result.applyCallback(eventName, data, xhr);
                });
            } else {
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
            }

            result.addEventListener('destroy', function destroyListener () {
                result.removeEventListener('destroy', destroyListener);
                events.forEach(function (eventData) {
                    xhr.removeEventListener(eventData.type, eventData.listener);
                });
                /* @if MOCK */

                XHR_ACTIONS.delete(XMLHttpRequest.getRequestKey(config.url + queryParams, config.method, dataForSend));

                /* @endif */
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

            /* @if MOCK */

            XHR_ACTIONS.set(XMLHttpRequest.getRequestKey(config.url + queryParams, config.method, dataForSend),
                result.actions);

            /* @endif */
            return result.actions;
        }
    }

    function guid () {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    }

    function inWorker (config, promise) {
        if (!config) {
            throw new Error('Config object is required.');
        } else if (!config.url) {
            throw new Error('URL option is required.');
        } else {
            var xhrWorker = new XHRWorker(guid(), config);
            return XHR.call(xhrWorker, config, promise);
        }
    }

    XHR.enableWorker = function () {
        return new Promise(function (resolve, reject) {
            if (!XHR.workerMode) {
                if (XHR._worker) {
                    resolve();
                } else {
                    var libSource = XHRlibContent.toString();
                    libSource = '(' + libSource + '.call(this));\nthis.postMessage("XHR.active");\n';

                    var scriptBlob = new Blob([libSource], {type: 'application/javascript'}),
                        url = URL.createObjectURL(scriptBlob);

                    Object.defineProperties(XHR, {
                        _worker: {
                            value: new Worker(url)
                        },
                        inWorker: {
                            value: inWorker
                        }
                    });

                    XHR._worker.addEventListener('message', function activateListener (event) {
                        if (event.data === 'XHR.active') {
                            XHR._worker.removeEventListener('message', activateListener);
                            resolve();
                        }
                    });
                }
            } else {
                reject(new Error('Worker can be enabled only in main thread.'));
            }
        });
       
    };

    /* @if MOCK */

    XHR.getActionsObject = function (config) {
       return XHR_ACTIONS.get(XMLHttpRequest.getRequestKey(config.url, config.method, config.data));
    };

    /* @endif */
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

    return XHR;

}(this))