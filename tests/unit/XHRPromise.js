describe('XHRPromise and XHRActions', function () {

    'use strict';

    var baseUrl = 'http://localhost:8081/';

    it('should create XHRPromise instance', function () {
        var promise = new XHR.XHRPromise();
        expect(promise instanceof XHR.XHRPromise).toBeTruthy();
    });

    it('should extend EventTargetExtendable', function () {
        var promise = new XHR.XHRPromise();
        expect(promise instanceof EventTargetExtendable).toBeTruthy();
    });

    it('action "loadStart" should return actions', function () {
        var actions = (new XHR.XHRPromise()).actions,
            actions2 = actions.loadStart(function () {});
        expect(actions).toBe(actions2);
    });

    it('action "progress" should return actions', function () {
        var actions = (new XHR.XHRPromise()).actions,
            actions2 = actions.progress(function () {});
        expect(actions).toBe(actions2);
    });

    it('action "loadEnd" should return actions', function () {
        var actions = (new XHR.XHRPromise()).actions,
            actions2 = actions.loadEnd(function () {});
        expect(actions).toBe(actions2);
    });

    it('action "load" should return actions', function () {
        var actions = (new XHR.XHRPromise()).actions,
            actions2 = actions.load(function () {});
        expect(actions).toBe(actions2);
    });

    it('action "success" should return actions', function () {
        var actions = (new XHR.XHRPromise()).actions,
            actions2 = actions.success(function () {});
        expect(actions).toBe(actions2);
    });

    it('action "error" should return actions', function () {
        var actions = (new XHR.XHRPromise()).actions,
            actions2 = actions.error(function () {});
        expect(actions).toBe(actions2);
    });

    it('action "abort" should return actions', function () {
        var actions = (new XHR.XHRPromise()).actions,
            actions2 = actions.abort(function () {});
        expect(actions).toBe(actions2);
    });

    it('action "timeout" should return actions', function () {
        var actions = (new XHR.XHRPromise()).actions,
            actions2 = actions.timeout(function () {});
        expect(actions).toBe(actions2);
    });

    it('action "interceptors" should return actions', function () {
        var actions = (new XHR.XHRPromise()).actions,
            actions2 = actions.interceptors({});
        expect(actions).toBe(actions2);
    });

    it('action "silent" should return actions', function () {
        var actions = (new XHR.XHRPromise()).actions,
            actions2 = actions.silent();
        expect(actions).toBe(actions2);
    });

    it('action "readyStateChange" should return actions', function () {
        var actions = (new XHR.XHRPromise()).actions,
            actions2 = actions.readyStateChange(function () {});
        expect(actions).toBe(actions2);
    });

    it('should execute callback', function (done) {
        var data = {foo: 'bar'},
            promise = new XHR.XHRPromise();
        promise.actions.success(function (_data) {
            expect(_data).toBe(data);
            done();
        });
        setTimeout(function () {
            promise.applyCallback('success', data);
        }, 0);
    });

    it('should pass data to callback through own interceptor', function (done) {
        var data = {foo: 'bar'},
            promise = new XHR.XHRPromise();
        promise.actions
            .interceptors({
                response: function (data) {
                    expect(data.foo).toBe('bar');
                    data.foo = 'baz';
                    return data;
                }
            })
            .success(function (data) {
                expect(data.foo).toBe('baz');
                done();
            });
        setTimeout(function () {
            promise.applyCallback('success', data);
        }, 0);
    });

    it('should pass data to callback through async own interceptor', function (done) {
        var data = {foo: 'bar'},
            promise = new XHR.XHRPromise();
        promise.actions
            .interceptors({
                response: function (data) {
                    return new Promise(function (resolve) {
                        expect(data.foo).toBe('bar');
                        setTimeout(function () {
                            data.foo = 'baz';
                            resolve(data);
                        }, 0);
                    });
                }
            })
            .success(function (data) {
                expect(data.foo).toBe('baz');
                done();
            });
        setTimeout(function () {
            promise.applyCallback('success', data);
        }, 0);
    });

    it('should prevent callback execution from own interceptor', function (done) {
        var data = {foo: 'bar'},
            promise = new XHR.XHRPromise();
        promise.actions
            .interceptors({
                response: function () {
                    return new Promise(function (resolve, reject) {
                        setTimeout(function () {
                            reject();
                        }, 0);
                    });
                }
            })
            .success(function (data) {
                data.foo = 'baz';
            });
        promise.addEventListener('destroy', function () {
            expect(data.foo).toBe('bar');
            done();
        });
        setTimeout(function () {
            promise.applyCallback('success', data);
        }, 0);
    });

    it('Should make 3 requests with config', function (done) {
        var count = 0;
        XHR({
            url: baseUrl
        })
            .then(function () {
                count++;
                return {
                    url: baseUrl
                };
            })
            .then(function () {
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
                return XHR({
                    url: baseUrl
                });
            },
            request2 = function (value) {
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
                return XHR({
                    url: baseUrl
                });
            },
            request2 = function (value) {
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
                return XHR({
                    url: baseUrl
                });
            },
            request2 = function (value) {
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
                    return XHR({
                        url: baseUrl
                    });
                },
                request2 = function (value) {
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




