(function (global) {

    'use strict';

    function XMLHttpEvent (config) {
        Object.defineProperties(this, {
            'target': {
                value: config.target,
                enumerable: true
            },
            'currentTarget': {
                value: config.target,
                enumerable: true
            },
            'type': {
                value: config.type,
                enumerable: true
            },
            'bubbles': {
                value: !!config.bubbles,
                enumerable: true
            },
            'cancelable': {
                value: !!config.cancelable,
                enumerable: true
            },
            'lengthComputable': {
                value: !!config.length
            },
            'loaded': {
                value: config.loaded
            },
            'total': {
                value: config.total
            }
        })
    }

    XMLHttpEvent.prototype = Object.create(CustomEvent.prototype, {
        constructor: {
            value: XMLHttpEvent
        }
    });

    XMLHttpEvent.prototype.stopPropagation = function () {
        CustomEvent.prototype.stopPropagation.apply(window);
    };

    var SAVED_RESPONSES = {},
        _readyState,
        _aborted;

    function FakeXMLHttpRequest () {
        this.timeout = 0;
        this.headers = {};
        this.status = 0;
        this.statusText = null;
        _aborted = false;
        _readyState = FakeXMLHttpRequest.UNSENT;
        Object.defineProperty(this, 'readyState', {
            get: function () {
                return _readyState;
            },
            set: function (value) {
                _readyState = value;
                this.dispatchEvent('readystatechange', new XMLHttpEvent({target: this, type: 'readystatechange'}));
            }
        });
    }

    FakeXMLHttpRequest.prototype = Object.create(EventTargetExtendable.prototype, {
        constructor: {
            value: FakeXMLHttpRequest
        }
    });

    FakeXMLHttpRequest.prototype.abort = function () {
        if (this.readyState !== FakeXMLHttpRequest.UNSENT) {
            _readyState = FakeXMLHttpRequest.UNSENT;
            _aborted = true;
            dispatchLoadEndWithEvent(this, 'abort', {
                length: false,
                loaded: 0,
                total: 0
            });
        }
    };

    FakeXMLHttpRequest.prototype.getAllResponseHeaders = function () {
        return this.headers
    };

    FakeXMLHttpRequest.prototype.getResponseHeader = function (name) {
        return this.headers[name];
    };

    FakeXMLHttpRequest.prototype.open = function (method, url, async) {
        this.method = method;
        this.url = url;
        this.async = async;
        this.readyState = FakeXMLHttpRequest.OPENED;
    };

    FakeXMLHttpRequest.prototype.setRequestHeader = function (header, value) {
        this.headers[header] = value;
    };

    FakeXMLHttpRequest.prototype.send = function (data) {
        var _this = this;
        _this.dispatchEvent('loadstart', new XMLHttpEvent({target: _this, type: 'loadstart', length: true, loaded: 0, total: 0}));
        _this.data = data;
        _this.setUserRequestConfig();
        _this.setResponseHeaders();
        _this.readyState = FakeXMLHttpRequest.HEADERS_RECEIVED;
        if (!this.userConfig) {
            _this.status = 404;
            _this.response = 'data not found';
            _this.readyState = FakeXMLHttpRequest.DONE;
            dispatchLoadEndWithEvent(_this, 'load', {
                length: true,
                loaded: 0,
                total: 0
            });
        } else if (_this.checkHeaders()) {
            _this.resetTimeout = null;
            if (_this.timeout) {
                _this.resetTimeout = setTimeout(function () {
                    dispatchLoadEndWithEvent(_this, 'timeout', {
                        length: false,
                        loaded: 0,
                        total: 0
                    });
                    if (_this.resetUserTimeout) {
                        clearTimeout(_this.resetUserTimeout);
                    }
                }, _this.timeout);
            }
            _this.readyState = FakeXMLHttpRequest.LOADING;
            _this.resetUserTimeout = null;
            _this.resetUserTimeout = setTimeout(function () {
                _this.sendResponse();
            }, _this.userConfig.timeout);
        } else {
            _this.status = 400;
            _this.response = 'headers not the same';
            _this.readyState = FakeXMLHttpRequest.DONE;
            dispatchLoadEndWithEvent(_this, 'error', {
                length: false,
                loaded: 0,
                total: 0
            });
        }
    };

    FakeXMLHttpRequest.prototype.overrideMimeType = function (mimeType) {
        this.mimeType = mimeType;
    };

    FakeXMLHttpRequest.prototype.setUserRequestConfig = function () {
        var key = getRequestKey(this),
            config = SAVED_RESPONSES[key];
        if (config && !--config.countOfRequests) {
            delete SAVED_RESPONSES[key];
        }
        this.userConfig = config;
    };

    FakeXMLHttpRequest.prototype.sendResponse = function () {
        if (this.resetTimeout) {
            clearTimeout(this.resetTimeout);
        }
        this.responseType = this.responseType || (this.userConfig ? this.userConfig.responseType : '');
        this.response = typeof this.userConfig.response === 'function' ?
                        this.userConfig.response() : this.userConfig.response;
        this.responseText = JSON.stringify(this.response);
        if (this.responseType === 'text') {
            this.response = JSON.stringify(this.response);
        }
        if (this.responseType === 'blob') {
            this.response = new Blob([JSON.stringify(this.response)]);
        }
        this.status = this.userConfig.status;
        this.statusText = this.userConfig.statusText;
        var loaded, total = loaded = this.responseText.length;
        if (!_aborted) {
            this.dispatchEvent('progress', new XMLHttpEvent({target: this, type: 'progress', length: true, total: total, loaded: loaded}));
            this.readyState = FakeXMLHttpRequest.DONE;
            dispatchLoadEndWithEvent(this, 'load', {
                length: true,
                total: total,
                loaded: loaded
            });
        }
    };

    FakeXMLHttpRequest.prototype.checkHeaders = function () {
        return !this.userConfig.headers || !Object.keys(this.userConfig.headers).length ||
            compareHeaders(this.userConfig.headers, this.headers);
    };

    FakeXMLHttpRequest.prototype.setResponseHeaders = function () {
        this.headers = this.userConfig && this.userConfig.responseHeaders ? this.userConfig.responseHeaders : this.headers;
    };

    FakeXMLHttpRequest.getRequestKey = getRequestKey;

    FakeXMLHttpRequest.prepareData = prepareData;

    FakeXMLHttpRequest.addRequest = function (config, responseConfig, countOfRequests) {
        if (!config.url) {
            throw new Error('no url provided')
        }
        responseConfig = responseConfig || {};
        var key = getRequestKey(config);
        SAVED_RESPONSES[key] = {
            url: config.url,
            method: config.method || FakeXMLHttpRequest.defaults.method,
            data: config.data,
            timeout: config.timeout || FakeXMLHttpRequest.defaults.timeout,
            headers: config.headers || FakeXMLHttpRequest.defaults.headers,
            status: responseConfig.status || FakeXMLHttpRequest.defaults.status,
            statusText: responseConfig.statusText,
            responseType: responseConfig.type || FakeXMLHttpRequest.defaults.responseType,
            responseHeaders: responseConfig.headers,
            response: responseConfig.data !== undefined ? responseConfig.data :  null,
            countOfRequests: countOfRequests || 1
        };
        return key;
    };

    Object.defineProperty(FakeXMLHttpRequest, 'defaults', {
        value: {
            method: 'GET',
            headers: {},
            responseType: '',
            timeout: 0,
            status: 200
        },
        configurable: false,
        writable: false
    });

    function getRequestKey (context) {
        var url = context.url,
            method = context.method,
            data = context.data === undefined ? null : context.data;
        method = method || FakeXMLHttpRequest.defaults.method;
        data = prepareData(data);
        return hex_sha1(url + method + data);
    }

    function prepareData (data) {
        if (typeof data === 'string') {
            try {
                data = JSON.parse(data);
            }
            catch (e) {
                return data
            }
        }
        if (!data || typeof data !== 'object') {
            return data;
        }
        return JSON.stringify(sortProperties(data));
    }

    function sortProperties (obj) {
        if (obj) {
            var ordered;
            if (Array.isArray(obj)) {
                ordered = [];
                obj.sort();
                obj.forEach(function (item) {
                    if (typeof item === 'object' && item !== null){
                        ordered.push(sortProperties(item));
                    } else {
                        ordered.push(item);
                    }
                });
            } else {
                ordered = {};
                Object.keys(obj).sort().forEach(function(key) {
                    if (typeof obj[key] === 'object' && obj[key] !== null){
                        ordered[key] = sortProperties(obj[key]);
                    } else {
                        ordered[key] = obj[key];
                    }
                });
            }
            return ordered;
        }
        return obj;
    }

    function compareHeaders (userConfigHeaders, headers) {
        var allHeadersProvided = true;
        for (var header in userConfigHeaders) {
            if (userConfigHeaders.hasOwnProperty(header)) {
                allHeadersProvided = allHeadersProvided && (userConfigHeaders[header] === headers[header]);
            }
        }
        return allHeadersProvided;
    }

    function dispatchLoadEndWithEvent (context, event, options) {
        context.dispatchEvent(event, new XMLHttpEvent({
            target: context,
            type: event,
            length: options.length,
            total: options.total,
            loaded: options.loaded
        }));
        context.dispatchEvent('loadend', new XMLHttpEvent({
            target: context,
            type: 'loadend',
            length: options.length,
            total: options.total,
            loaded: options.loaded
        }));
        setTimeout(function () {
            FakeXMLHttpRequest.globalEmitter.dispatchEvent('RequestLoaded', getRequestKey(context));
        }, 0);
    }

    FakeXMLHttpRequest.UNSENT = XMLHttpRequest.UNSENT;
    FakeXMLHttpRequest.OPENED = XMLHttpRequest.OPENED;
    FakeXMLHttpRequest.HEADERS_RECEIVED = XMLHttpRequest.HEADERS_RECEIVED;
    FakeXMLHttpRequest.LOADING = XMLHttpRequest.LOADING;
    FakeXMLHttpRequest.DONE = XMLHttpRequest.DONE;

    FakeXMLHttpRequest.globalEmitter = new EventTargetExtendable();

    var originalXMLHttpRequest = XMLHttpRequest;
    global.XMLHttpRequest = FakeXMLHttpRequest;

    //hex_sha1 lib

    var hexcase = 0;

    function hex_sha1(s)    { return rstr2hex(rstr_sha1(str2rstr_utf8(s))); }

    function rstr_sha1(s) {
        return binb2rstr(binb_sha1(rstr2binb(s), s.length * 8));
    }

    function rstr2hex(input) {
        try { hexcase } catch(e) { hexcase=0; }
        var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
        var output = "";
        var x;
        for(var i = 0; i < input.length; i++) {
            x = input.charCodeAt(i);
            output += hex_tab.charAt((x >>> 4) & 0x0F)
                +  hex_tab.charAt( x        & 0x0F);
        }
        return output;
    }

    function str2rstr_utf8(input) {
        var output = "";
        var i = -1;
        var x, y;

        while(++i < input.length) {
            x = input.charCodeAt(i);
            y = i + 1 < input.length ? input.charCodeAt(i + 1) : 0;
            if(0xD800 <= x && x <= 0xDBFF && 0xDC00 <= y && y <= 0xDFFF) {
                x = 0x10000 + ((x & 0x03FF) << 10) + (y & 0x03FF);
                i++;
            }

            if(x <= 0x7F)
                output += String.fromCharCode(x);
            else if(x <= 0x7FF)
                output += String.fromCharCode(0xC0 | ((x >>> 6 ) & 0x1F),
                    0x80 | ( x         & 0x3F));
            else if(x <= 0xFFFF)
                output += String.fromCharCode(0xE0 | ((x >>> 12) & 0x0F),
                    0x80 | ((x >>> 6 ) & 0x3F),
                    0x80 | ( x         & 0x3F));
            else if(x <= 0x1FFFFF)
                output += String.fromCharCode(0xF0 | ((x >>> 18) & 0x07),
                    0x80 | ((x >>> 12) & 0x3F),
                    0x80 | ((x >>> 6 ) & 0x3F),
                    0x80 | ( x         & 0x3F));
        }
        return output;
    }

    function rstr2binb(input) {
        var output = Array(input.length >> 2);
        for(var i = 0; i < output.length; i++)
            output[i] = 0;
        for(var i = 0; i < input.length * 8; i += 8)
            output[i>>5] |= (input.charCodeAt(i / 8) & 0xFF) << (24 - i % 32);
        return output;
    }

    function binb2rstr(input) {
        var output = "";
        for(var i = 0; i < input.length * 32; i += 8)
            output += String.fromCharCode((input[i>>5] >>> (24 - i % 32)) & 0xFF);
        return output;
    }

    function binb_sha1(x, len)
    {
        /* append padding */
        x[len >> 5] |= 0x80 << (24 - len % 32);
        x[((len + 64 >> 9) << 4) + 15] = len;

        var w = Array(80);
        var a =  1732584193;
        var b = -271733879;
        var c = -1732584194;
        var d =  271733878;
        var e = -1009589776;

        for(var i = 0; i < x.length; i += 16) {
            var olda = a;
            var oldb = b;
            var oldc = c;
            var oldd = d;
            var olde = e;

            for(var j = 0; j < 80; j++) {
                if(j < 16) w[j] = x[i + j];
                else w[j] = bit_rol(w[j-3] ^ w[j-8] ^ w[j-14] ^ w[j-16], 1);
                var t = safe_add(safe_add(bit_rol(a, 5), sha1_ft(j, b, c, d)),
                    safe_add(safe_add(e, w[j]), sha1_kt(j)));
                e = d;
                d = c;
                c = bit_rol(b, 30);
                b = a;
                a = t;
            }

            a = safe_add(a, olda);
            b = safe_add(b, oldb);
            c = safe_add(c, oldc);
            d = safe_add(d, oldd);
            e = safe_add(e, olde);
        }
        return Array(a, b, c, d, e);
    }

    function sha1_ft(t, b, c, d) {
        if(t < 20) return (b & c) | ((~b) & d);
        if(t < 40) return b ^ c ^ d;
        if(t < 60) return (b & c) | (b & d) | (c & d);
        return b ^ c ^ d;
    }

    function sha1_kt(t) {
        return (t < 20) ?  1518500249 : (t < 40) ?  1859775393 :
                                        (t < 60) ? -1894007588 : -899497514;
    }

    function safe_add(x, y) {
        var lsw = (x & 0xFFFF) + (y & 0xFFFF);
        var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return (msw << 16) | (lsw & 0xFFFF);
    }

    function bit_rol(num, cnt) {
        return (num << cnt) | (num >>> (32 - cnt));
    }


}(global));