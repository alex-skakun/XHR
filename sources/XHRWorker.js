(function () {

    'use strict';

    /**
     * @param {String} guid
     * @param {Object} config
     * @constructor XHRWorker
     */
    function XHRWorker (guid, config) {
        var _this = this;
        this.guid = guid;
        this.config = config;
        this.config.attributes = this.config.attributes || {};
        this.config.headers = this.config.headers || {};
        this.xhrOptions = {
            readyState: XMLHttpRequest.UNSENT,
            response: null,
            responseText: null,
            status: 0,
            statusText: null
        };
        XHR._worker.addEventListener('message', function messageListener (event) {
            if (event.data.guid === _this.guid) {
                var message = event.data,
                    eventName = message.eventName,
                    data = message.data;
                if (eventName === 'destroy') {
                    XHR._worker.removeEventListener('message', messageListener);
                    _this.removeAllListeners();
                } else {
                    _this.applyXHROptions(message.xhrOptions);
                    _this.dispatchEvent('event', eventName, data, _this);
                }
            }
        });
    }
    
    XHRWorker.prototype = Object.create(EventTargetExtendable.prototype, {
        constructor: {
            value: XHRWorker
        },
        responseType: {
            get: function () {
                return this.config.attributes.responseType || '';
            },
            set: function (val) {
                this.config.attributes.responseType = val
            }
        },
        timeout: {
            get: function () {
                return this.config.attributes.timeout || 0;
            },
            set: function (val) {
                this.config.attributes.timeout = val
            }
        },
        readyState: {
            get: function () {
                return this.xhrOptions.readyState;
            }
        },
        response: {
            get: function () {
                return this.xhrOptions.response;
            }
        },
        responseText: {
            get: function () {
                return this.xhrOptions.responseText;
            }
        },
        status: {
            get: function () {
                return this.xhrOptions.status;
            }
        },
        statusText: {
            get: function () {
                return this.xhrOptions.statusText;
            }
        }
    });
    
    XHRWorker.prototype.applyXHROptions = function (xhrOptions) {
        var type = this.responseType;
        this.xhrOptions.readyState = xhrOptions.readyState;
        this.xhrOptions.response = xhrOptions.response;
        this.xhrOptions.responseText = type === '' || type === 'text' ? xhrOptions.responseText : null;
        this.xhrOptions.status = xhrOptions.status;
        this.xhrOptions.statusText = xhrOptions.statusText;
    };

    XHRWorker.prototype.open = function (method, url, async) {
        this.config.method = method;
        this.config.async = async;
        this.xhrOptions.readyState = XMLHttpRequest.OPENED;
        this.dispatchEvent('readystatechange');
    };
    
    XHRWorker.prototype.send = function (data) {
        this.config.data = data;
        XHR._worker.postMessage({
            guid: this.guid,
            type: 'request',
            options: this.config
        });
    };
    
    XHRWorker.prototype.setRequestHeader = function (header, value) {
        this.config.headers[header] = value;
    };

    XHRWorker.prototype.abort = function () {
        XHR._worker.postMessage({
            guid: this.guid,
            type: 'abort'
        });
    };
    
    return XHRWorker;
    
}())