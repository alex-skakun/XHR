describe('Simple Requests', function () {

    'use strict';

    var baseUrl = 'http://localhost:8081/',
        originalInterceptors = {
            response: null,
            responseError: null,
            request: null
        },
        originalDefaults = {
            method: 'GET',
            headers: {},
            attributes: {
                responseType: '',
                timeout: 0
            }
        },
        requestMethod = function () {
            return XHR({
                url: baseUrl
            });
        };

    describe('Easy request', function () {

        beforeEach(function () {
            XMLHttpRequest.addRequest({
                url: baseUrl
            }, {
                status: 200,
                responseType: originalDefaults.attributes.responseType,
                data: {}
            });
        });

        it('Should exec global interceptors and continue to success', function (done) {
            var response, request;
            XHR.interceptors.response = function (data) {
                response = data;
                return true;
            };
            XHR.interceptors.request = function requestMe(data) {
                request = data;
                return true;
            };
            requestMethod().success(function () {
                expect(typeof response).toBe('object');
                expect(typeof request).toBe('object');
                done();
            });
        });

        it('Should prevent execution in response', function (done) {
            var response, request, success = false;
            XHR.interceptors.response = function (data) {
                response = data;
                return false;
            };
            XHR.interceptors.request = function (data) {
                request = data;
                return true;
            };
            var xhrCollection = requestMethod().success(function () {
                success = true;
            }).getXHR();
            xhrCollection.promise.addEventListener('destroy', function onDestroy () {
                expect(success).toBeFalsy();
                expect(typeof response).toBe('object');
                expect(typeof request).toBe('object');
                done();
            });
        });

        it('Should exec async global interceptors and continue to success', function (done) {
            var response, request;
            XHR.interceptors.response = function (data) {
                response = data;
                return new Promise(function (resolve) {
                    setTimeout(resolve, 0);
                });
            };
            XHR.interceptors.request = function (data) {
                request = data;
                return new Promise(function (resolve) {
                    setTimeout(resolve, 0);
                });
            };
            requestMethod().success(function () {
                expect(typeof response).toBe('object');
                expect(typeof request).toBe('object');
                done();
            });
        });

        it('Should prevent execution in response async interceptor', function (done) {
            var response, request, success = false;
            XHR.interceptors.response = function (data) {
                response = data;
                return new Promise(function (resolve, reject) {
                    setTimeout(reject, 0);
                });
            };
            XHR.interceptors.request = function (data) {
                request = data;
                return new Promise(function (resolve) {
                    setTimeout(resolve, 0);
                });
            };
            var xhrCollection = requestMethod().success(function () {
                success = true;
            }).getXHR();
            xhrCollection.promise.addEventListener('destroy', function onDestroy () {
                expect(success).toBeFalsy();
                expect(typeof response).toBe('object');
                expect(typeof request).toBe('object');
                done();
            });
        });

    });

    afterEach(function () {
        XHR.interceptors.response = originalInterceptors.response;
        XHR.interceptors.request = originalInterceptors.request;
        XHR.interceptors.responseError = originalInterceptors.responseError;
        XHR.defaults.method = originalDefaults.method;
        XHR.defaults.headers = originalDefaults.headers;
        XHR.defaults.attributes.responseType = originalDefaults.attributes.responseType;
        XHR.defaults.attributes.timeout = originalDefaults.attributes.timeout;
    });

    it('Should apply default timeout', function (done) {
        XHR.defaults.attributes.timeout = 1000;
        XMLHttpRequest.addRequest({
            url: baseUrl + 'timeout/2000',
            timeout: 2000
        });
        XHR({
            url: baseUrl + 'timeout/2000'
        })
            .timeout(function (data) {
                expect(typeof data).toBe('object');
                done();
            });
    });

    it('Should apply default responseType', function (done) {
        XHR.defaults.attributes.responseType = 'json';
        XMLHttpRequest.addRequest({
            url: baseUrl
        });
        XHR({
            url: baseUrl
        })
            .success(function (data, xhr) {
                expect(typeof xhr.response).toBe('object');
                done();
            });
    });

    it('Should apply default method', function (done) {
        XMLHttpRequest.addRequest({
            url: baseUrl,
            method: 'POST'
        });
        XHR.defaults.method = 'POST';
        XHR({
            url: baseUrl
        })
            .success(function (data, xhr) {
                expect(xhr.method).toBe('POST');
                done();
            });
    });

    it('Should apply default headers', function (done) {
        XMLHttpRequest.addRequest({
            url: baseUrl
        });
        XHR.defaults.headers.MyHeader = 'MyValue';
        XHR.defaults.headers['my-second-header'] = '123';
        XHR({
            url: baseUrl
        })
            .success(function (data, xhr) {
                expect(xhr.headers.myheader).toBe('MyValue');
                expect(xhr.headers['my-second-header']).toBe('123');
                done();
            });
    });

});