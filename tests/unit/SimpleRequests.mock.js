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
            url: baseUrl + 'networkError'
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
            data: [
                2,
                1
            ]
        });
        XHR({
            url: baseUrl,
            method: 'POST',
            data: [
                1,
                2
            ]
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

    it('Should make request with data payload', function (done) {
        var requestFinished,
            key = XMLHttpRequest.addRequest({
                url: baseUrl
            }, {
                data: 'hey'
            });
        XMLHttpRequest.globalEmitter.addEventListener('RequestLoaded', function (loadedKey) {
            if (key === loadedKey) {
                expect(requestFinished).toBeTruthy();
                done();
            }
        });
        XHR({
            url: baseUrl
        })
            .success(function (response, xhr) {
                expect(xhr.status).toBe(200);
                requestFinished = true;
            });
    });

    it('Should make request with response data false', function (done) {
        var responseValue = false;
        XMLHttpRequest.addRequest({
            url: baseUrl
        }, {
            data: responseValue
        });
        XHR({
            url: baseUrl
        })
            .success(function (response, xhr) {
                expect(xhr.status).toBe(200);
                expect(response).toBe(responseValue);
                done();
            });
    });

    describe('should test method prepareData', function () {
        var data,
            expectedData;
        it('should test if value true', function () {
            data = true;
            expectedData = true;
            expect(XMLHttpRequest.prepareData(data)).toBe(expectedData);
            expect(data).toBe(data);
        });

        it('should test if value false', function () {
            data = false;
            expectedData = false;
            expect(XMLHttpRequest.prepareData(data)).toBe(expectedData);
            expect(data).toBe(data);
        });

        it('should test if value number', function () {
            data = 123;
            expectedData = 123;
            expect(XMLHttpRequest.prepareData(data)).toBe(expectedData);
            expect(data).toBe(data);
        });

        it('should test if value string', function () {
            data = 'my string';
            expectedData = 'my string';
            expect(XMLHttpRequest.prepareData(data)).toBe(expectedData);
            expect(data).toBe(data);
        });

        it('should test if value null', function () {
            data = null;
            expectedData = null;
            expect(XMLHttpRequest.prepareData(data)).toBe(expectedData);
            expect(data).toBe(data);
        });

        it('should test if value undefined', function () {
            data = undefined;
            expectedData = undefined;
            expect(XMLHttpRequest.prepareData(data)).toBe(expectedData);
            expect(data).toBe(data);
        });

        it('should test if value an arr without objects', function () {
            data = [
                1,
                2,
                3
            ];
            expectedData = "[1,2,3]";
            expect(XMLHttpRequest.prepareData(data)).toBe(expectedData);
            expect(data).toBe(data);
        });

        it('should test if value an arr with objects', function () {
            data = [
                {
                    b: '123',
                    a: 'aa'
                },
                3,
                2
            ];
            expectedData = '[2,3,{"a":"aa","b":"123"}]';
            expect(XMLHttpRequest.prepareData(data)).toBe(expectedData);
            expect(data).toBe(data);
        });

        it('should test if an obj without objects', function () {
            data = {
                b: '123',
                a: 'aa'
            };
            expectedData = '{"a":"aa","b":"123"}';
            expect(XMLHttpRequest.prepareData(data)).toBe(expectedData);
            expect(data).toBe(data);
        });

        it('should test if an obj with object and array', function () {
            data = {
                notSorted: [
                    [
                        {value: 'wer'},
                        'rwe'
                    ],
                    3,
                    2,
                    1
                ],
                sorted: [
                    1,
                    {a: 123}
                ],
                obj: {
                    arr: [
                        'sdf',
                        23
                    ],
                    aaabj: {
                        complete: '123'
                    }
                },
                b: '123',
                a: 'aa'
            };
            expectedData = '{"a":"aa","b":"123","notSorted":[1,2,3,[{"value":"wer"},"rwe"]],"obj":{"aaabj":{"complete":"123"},"arr":[23,"sdf"]},"sorted":[1,{"a":123}]}';
            expect(XMLHttpRequest.prepareData(data)).toBe(expectedData);
            expect(data).toBe(data);
        });
    });
    it('should test that data not changed when getRequestKey called', function () {
        var context = {
            url: 'new one',
            method: 'GET',
            data: {
                obj: {
                    value: []
                }
            }
        };
        XMLHttpRequest.getRequestKey(context);
        expect(typeof context.data).toBe('object')
    })

});