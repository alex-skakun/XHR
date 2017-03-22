describe('Simple Requests', function () {

    'use strict';

    var baseUrl = 'http://localhost:8081/';

    var imageBlob;

    it('Should throw error about config', function () {
        expect(XHR).toThrow(new Error('Config object is required.'));
    });
    it('Should throw error about url', function () {
        expect(function () {
            XHR({method: 'GET'});
        }).toThrow(new Error('URL option is required.'));
    });

    it('Should make request', function (done) {
        XMLHttpRequest.addRequest({
            url: baseUrl
        }, {
            data: {}
        });
        XHR({
            url: baseUrl
        })
            .success(function (response) {
                expect(typeof response).toBe('object');
                done();
            });
    });

    it('Should make request with response type json', function (done) {
        XMLHttpRequest.addRequest({
            url: baseUrl
        }, {
            data: {}
        });
        XHR({
            url: baseUrl,
            attributes: {
                responseType: 'json'
            }
        })
            .success(function (response, xhr) {
                expect(typeof xhr.response).toBe('object');
                done();
            });
    });

    it('Should make auto json-parsing with response type text', function (done) {
        XMLHttpRequest.addRequest({
            url: baseUrl
        }, {
            data: {}
        });
        XHR({
            url: baseUrl,
            attributes: {
                responseType: 'text'
            }
        })
            .success(function (response, xhr) {
                expect(typeof xhr.response).toBe('string');
                expect(typeof xhr.responseText).toBe('string');
                expect(typeof response).toBe('object');
                done();
            });
    });

    it('Should send user headers', function (done) {
        XMLHttpRequest.addRequest({
            url: baseUrl
        });
        XHR({
            url: baseUrl,
            headers: {
                'my-header': 'test'
            }
        })
            .success(function (response, xhr) {
                expect(xhr.headers['my-header']).toBe('test');
                done();
            });
    });

    it('Should make unsuccessful request with timeout', function (done) {
        XMLHttpRequest.addRequest({
            url: baseUrl + 'timeout/2000',
            timeout: 2000
        });
        XHR({
            url: baseUrl + 'timeout/2000',
            attributes: {
                timeout: 1000
            }
        })
            .timeout(function (data) {
                expect(typeof data).toBe('object');
                done();
            });
    });

    it('Should make successful request with timeout', function (done) {
        XMLHttpRequest.addRequest({
            url: baseUrl + 'timeout/1000',
            timeout: 1000
        });
        XHR({
            url: baseUrl + 'timeout/1000',
            attributes: {
                timeout: 2000
            }
        })
            .success(function (data) {
                expect(typeof data).toBe('object');
                done();
            });
    });

    it('Should abort request', function (done) {
        XMLHttpRequest.addRequest({
            url: baseUrl + 'timeout/2000',
            timeout: 2000
        });
        var xhrCollection = XHR({
            url: baseUrl + 'timeout/2000'
        })
            .abort(function (data) {
                expect(typeof data).toBe('object');
                done();
            })
            .getXHR();
        setTimeout(function () {
            xhrCollection.abort();
        }, 1000);
    });

    it('Should abort request before sending', function (done) {
        var xhrCollection = XHR({
            url: baseUrl + 'timeout/3000'
        })
            .abort(function (data) {
                expect(data).toBe(null);
                done();
            })
            .getXHR();
        xhrCollection.abort();
    });

    it('Should make request with response type blob', function (done) {
        XMLHttpRequest.addRequest({
            url: baseUrl + 'image.png'
        });
        XHR({
            url: baseUrl + 'image.png',
            attributes: {
                responseType: 'blob'
            }
        })
            .success(function (data) {
                imageBlob = data;
                expect(data instanceof Blob).toBe(true);
                done();
            });
    });

    it('Should execute error after 404', function (done) {
        XHR({
            url: baseUrl + 'notFound.png'
        })
            .error(function (data, xhr) {
                expect(xhr.status).toBe(404);
                done();
            });
    });

    it('Should execute error after network error', function (done) {
        XMLHttpRequest.addRequest({
            url:baseUrl + 'networkError'
        }, {
            status: 404,
            type: 'json',
            data: {
                type: 'error'
            }
        });
        XHR({
            url: baseUrl + 'networkError'
        })
            .error(function (data) {
                expect(data.type).toBe('error');
                done();
            });
    });

    it('Should fire all events', function (done) {
        var events = {},
            listener = function (e) {
                events[e.type] = true;
            },
            readyStateListener = function (e, xhr) {
                events['readyState' + xhr.readyState] = true;
            };
        XMLHttpRequest.addRequest({
            url: baseUrl + 'image.png',
            data: imageBlob
        });
        XHR({
            url: baseUrl + 'image.png',
            attributes: {
                responseType: 'blob'
            },
            data: imageBlob
        })
            .loadStart(listener)
            .loadEnd(listener)
            .progress(listener)
            .load(listener)
            .readyStateChange(readyStateListener)
            .success(function () {
                expect(events.loadstart).toBeTruthy();
                expect(events.loadend).toBeTruthy();
                expect(events.progress).toBeTruthy();
                expect(events.load).toBeTruthy();
                expect(events.readyState1).toBeTruthy();
                expect(events.readyState2).toBeTruthy();
                expect(events.readyState3).toBeTruthy();
                expect(events.readyState4).toBeTruthy();
                done();
            });
    });

    it('Should make request with data payload object type', function (done) {
        XMLHttpRequest.addRequest({
            url: baseUrl,
            method: 'POST',
            data: {
                prop: 'test'
            }
        });
        XHR({
            url: baseUrl,
            method: 'POST',
            data: {
                prop: 'test'
            }
        })
            .success(function (response, xhr) {
                expect(xhr.status).toBe(200);
                done();
            });
    });

    it('Should make request with data object stringified', function (done) {
        var obj = {
            test: 'request'
        };
        XMLHttpRequest.addRequest({
            url: baseUrl,
            method: 'POST',
            data: JSON.stringify(obj)
        });
        XHR({
            url: baseUrl,
            method: 'POST',
            data: obj
        })
            .success(function (response, xhr) {
                expect(xhr.status).toBe(200);
                done();
            });
    });


    it('Should make request with data payload boolean type', function (done) {
        XMLHttpRequest.addRequest({
            url: baseUrl,
            method: 'POST',
            data: false
        });
        XHR({
            url: baseUrl,
            method: 'POST',
            data: false
        })
            .success(function (response, xhr) {
                expect(xhr.status).toBe(200);
                done();
            });
    });

    it('Should make request with data payload string type', function (done) {
        XMLHttpRequest.addRequest({
            url: baseUrl,
            method: 'POST',
            data: 'hey'
        });
        XHR({
            url: baseUrl,
            method: 'POST',
            data: 'hey'
        })
            .success(function (response, xhr) {
                expect(xhr.status).toBe(200);
                done();
            });
    });

    it('Should make request with data payload number type', function (done) {
        XMLHttpRequest.addRequest({
            url: baseUrl,
            method: 'POST',
            data: 10
        });
        XHR({
            url: baseUrl,
            method: 'POST',
            data: 10
        })
            .success(function (response, xhr) {
                expect(xhr.status).toBe(200);
                done();
            });
    });

    it('Should make request with data payload array not sorted', function (done) {
        XMLHttpRequest.addRequest({
            url: baseUrl,
            method: 'POST',
            data: [2, 1]
        });
        XHR({
            url: baseUrl,
            method: 'POST',
            data: [1, 2]
        })
            .success(function (response, xhr) {
                expect(xhr.status).toBe(200);
                done();
            });
    });

    it('should return XHRActions object for specified config', function () {
        XMLHttpRequest.addRequest({
            url: baseUrl + 'image.png',
            data: imageBlob
        });
        var xhrActions = XHR({
            url: baseUrl + 'image.png',
            attributes: {
                responseType: 'blob'
            },
            data: imageBlob
        });
        var result = XHR.getActionsObject({
            url: baseUrl + 'image.png',
            data: imageBlob
        });
        expect(xhrActions).toBe(result);
    });

});