describe('XHRCollection', function () {

    'use strict';

    it('should create XHRCollection instance', function () {
        var collection = new XHR.XHRCollection();
        expect(collection instanceof XHR.XHRCollection).toBeTruthy();
    });

    it('should extend Array', function () {
        var collection = new XHR.XHRCollection();
        expect(collection instanceof Array).toBeTruthy();
    });

    it('should abort timeouts', function (done) {
        var aborted = false,
            timeoutFired = false,
            promise = new XHR.XHRPromise(setTimeout(function () {
                timeoutFired = true;
            }, 0)),
            collection = promise.actions.getXHR();
        promise.actions.abort(function () {
            aborted = true;
            setTimeout(function () {
                expect(aborted).toBeTruthy();
                expect(timeoutFired).toBeFalsy();
                done();
            }, 0);
        });
        collection.abort();
    });

});




