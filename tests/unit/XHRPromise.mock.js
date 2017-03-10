describe('XHRPromise and XHRActions mock', function () {

    'use strict';

    var baseUrl = 'http://localhost:8081/';

    it('Should make 3 requests with config', function (done) {
        var count = 0;
        XMLHttpRequest.addRequest({
            url: baseUrl
        });
        XHR({
            url: baseUrl
        })
            .then(function () {
                count++;
                XMLHttpRequest.addRequest({
                    url: baseUrl
                });
                return {
                    url: baseUrl
                };
            })
            .then(function () {
                XMLHttpRequest.addRequest({
                    url: baseUrl
                });
                count++;
                return {
                    url: baseUrl
                };
            })
            .success(function () {
                expect(count).toBe(3);
                done();
            });
        count++;
    });

    it('Should make 3 requests with method calling', function (done) {
        var count = 0,
            request = function () {
                XMLHttpRequest.addRequest({
                    url: baseUrl
                });
                return XHR({
                    url: baseUrl
                });
            };
        request()
            .then(function () {
                count++;
                return request();
            })
            .then(function () {
                count++;
                return request();
            })
            .success(function () {
                expect(count).toBe(3);
                done();
            });
        count++;
    });

    it('Should make 3 requests with method calling and applying own interceptors', function (done) {
        var count = 0,
            request = function () {
                XMLHttpRequest.addRequest({
                    url: baseUrl
                });
                return XHR({
                    url: baseUrl
                });
            },
            request2 = function (value) {
                XMLHttpRequest.addRequest({
                    url: baseUrl
                });
                return XHR({
                    url: baseUrl
                })
                    .interceptors({
                        response: function () {
                            return value * 2;
                        }
                    });
            },
            request3 = function (value) {
                XMLHttpRequest.addRequest({
                    url: baseUrl
                });
                return XHR({
                    url: baseUrl
                })
                    .interceptors({
                        response: function () {
                            return value * 3;
                        }
                    });
            };
        request()
            .then(function () {
                expect(count).toBe(1);
                return request2(count);
            })
            .then(function (val) {
                expect(val).toBe(2);
                return request3(val);
            })
            .success(function (val) {
                expect(val).toBe(6);
                done();
            });
        count++;
    });

    it('Should make 3 requests with method calling and applying async own interceptors', function (done) {
        var count = 0,
            request = function () {
                XMLHttpRequest.addRequest({
                    url: baseUrl
                });
                return XHR({
                    url: baseUrl
                });
            },
            request2 = function (value) {
                XMLHttpRequest.addRequest({
                    url: baseUrl
                });
                return XHR({
                    url: baseUrl
                })
                    .interceptors({
                        response: function () {
                            return new Promise(function (resolve) {
                                setTimeout(function () {
                                    resolve(value * 2);
                                }, 0);
                            });
                        }
                    });
            },
            request3 = function (value) {
                XMLHttpRequest.addRequest({
                    url: baseUrl
                });
                return XHR({
                    url: baseUrl
                })
                    .interceptors({
                        response: function () {
                            return new Promise(function (resolve) {
                                setTimeout(function () {
                                    resolve(value * 3);
                                }, 0);
                            });
                        }
                    });
            };
        request()
            .then(function () {
                expect(count).toBe(1);
                return request2(count);
            })
            .then(function (val) {
                expect(val).toBe(2);
                return request3(val);
            })
            .success(function (val) {
                expect(val).toBe(6);
                done();
            });
        count++;
    });

    it('Should make 4 requests with method calling and applying async own interceptors', function (done) {
        var count = 0,
            request = function () {
                XMLHttpRequest.addRequest({
                    url: baseUrl
                });
                return XHR({
                    url: baseUrl
                });
            },
            request2 = function (value) {
                XMLHttpRequest.addRequest({
                    url: baseUrl
                });
                return XHR({
                    url: baseUrl
                })
                    .then(function () {
                        return request3(value);
                    })
                    .interceptors({
                        response: function (value) {
                            return new Promise(function (resolve) {
                                setTimeout(function () {
                                    resolve(value * 2);
                                }, 0);
                            });
                        }
                    });
            },
            request3 = function (value) {
                XMLHttpRequest.addRequest({
                    url: baseUrl
                });
                return XHR({
                    url: baseUrl
                })
                    .interceptors({
                        response: function () {
                            return new Promise(function (resolve) {
                                setTimeout(function () {
                                    resolve(value * 3);
                                }, 0);
                            });
                        }
                    });
            };
        request()
            .then(function () {
                expect(count).toBe(1);
                return request2(count);
            })
            .then(function (val) {
                expect(val).toBe(6);
                return request3(val);
            })
            .success(function (val) {
                expect(val).toBe(18);
                done();
            });
        count++;
    });

    it('Should make 4 requests with method calling and applying async own interceptors and precess results in interceptor',
        function (done) {
            var count = 0,
                res1,
                res2,
                res3,
                request = function () {
                    XMLHttpRequest.addRequest({
                        url: baseUrl
                    });
                    return XHR({
                        url: baseUrl
                    });
                },
                request2 = function (value) {
                    XMLHttpRequest.addRequest({
                        url: baseUrl
                    });
                    return XHR({
                        url: baseUrl
                    })
                        .then(function () {
                            return request3(value);
                        })
                        .interceptors({
                            response: function (value) {
                                return new Promise(function (resolve) {
                                    setTimeout(function () {
                                        resolve(value * 2);
                                    }, 0);
                                });
                            }
                        });
                },
                request3 = function (value) {
                    XMLHttpRequest.addRequest({
                        url: baseUrl
                    });
                    return XHR({
                        url: baseUrl
                    })
                        .interceptors({
                            response: function () {
                                return new Promise(function (resolve) {
                                    setTimeout(function () {
                                        resolve(value * 3);
                                    }, 0);
                                });
                            }
                        });
                };
            request()
                .then(function () {
                    res1 = count;
                    expect(count).toBe(1);
                    return request2(count);
                })
                .then(function (val) {
                    res2 = val;
                    expect(val).toBe(6);
                    return request3(val);
                })
                .interceptors({
                    response: function (val) {
                        res3 = val;
                        return res1 + res2 + res3;
                    }
                })
                .success(function (val) {
                    expect(val).toBe(25);
                    done();
                });
            count++;
        });
});