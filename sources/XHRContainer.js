(function XHRlibContent () {

    'use strict';

    /* @include ../bower_components/EventTargetExtendable/dist/ete.js */

    var XHRActions = /* @include XHRActions.js */,
        XHRPromise = /* @include XHRPromise.js */,
        XHRCollection = /* @include XHRCollection.js */,
        XHRWorker = /* @include XHRWorker.js */,
        XHR = /* @include XHR.js */,

        requests = new Map();
    
    XHR.XHRActions = XHRActions;
    XHR.XHRPromise = XHRPromise;
    XHR.XHRCollection = XHRCollection;
    XHR.XHRWorker = XHRWorker;

    XHR.workerMode = !~Object.getOwnPropertyNames(this).indexOf('window');

    if (XHR.workerMode) {
        this.addEventListener('message', function (event) {
            var data = event.data,
                guid = data.guid,
                type = data.type,
                xhrCollection;
            if (type === 'request') {
                xhrCollection = XHR(data.options).getXHR();
                xhrCollection.promise.guid = guid;
                xhrCollection.promise.addEventListener('destroy', function () {
                    requests.delete(guid);
                });
                requests.set(guid, xhrCollection);
            } else if (type === 'abort') {
                xhrCollection = requests.get(guid);
                if (xhrCollection) {
                    xhrCollection.abort();
                }
            }
        });
    }

    this.XHR = XHR;

}.call(this));
