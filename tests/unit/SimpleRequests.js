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
        XHR({
            url: baseUrl
        })
            .success(function (response) {
                expect(typeof response).toBe('object');
                done();
            });
    });

    it('Should make request with query string params', function (done) {
        XHR({
            url: baseUrl,
            params: {
                one: 1,
                two: 2,
                arr: [1, 2]
            }
        })
            .success(function (response) {
                expect(response.query.one).toBe('1');
                expect(response.query.two).toBe('2');
                expect(Array.isArray(response.query.arr)).toBe(true);
                expect(response.query.arr.length).toBe(2);
                expect(response.query.arr[0]).toBe('1');
                expect(response.query.arr[1]).toBe('2');
                done();
            });
    });

    it('Should make request with response type json', function (done) {
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
        XHR({
            url: baseUrl,
            headers: {
                'my-header': 'test'
            }
        })
            .success(function (response) {
                expect(response.headers['my-header']).toBe('test');
                done();
            });
    });

    it('Should make unsuccessful request with timeout', function (done) {
        XHR({
            url: baseUrl + 'timeout/4000',
            attributes: {
                timeout: 3000
            }
        })
            .timeout(function (data) {
                expect(typeof data).toBe('object');
                done();
            });
    });

    it('Should make successful request with timeout', function (done) {
        XHR({
            url: baseUrl + 'timeout/3000',
            attributes: {
                timeout: 4000
            }
        })
            .success(function (data) {
                expect(typeof data).toBe('object');
                done();
            });
    });

    it('Should abort request', function (done) {
        var xhrCollection = XHR({
            url: baseUrl + 'timeout/3000'
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
            url: baseUrl + 'nofound.png'
        })
            .error(function (data, xhr) {
                expect(xhr.status).toBe(404);
                done();
            });
    });

    it('Should execute error after network error', function (done) {
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

});