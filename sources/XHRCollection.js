(function () {

    'use strict';

    function XHRCollection (promise) {
        Array.call(this);
        this.promise = promise;
        this.aborted = false;
    }

    XHRCollection.prototype = Object.create(Array.prototype, {
        constructor: {
            value: XHRCollection
        },
        abort: {
            value: function abort () {
                this.forEach(function (xhr) {
                    if (xhr instanceof XMLHttpRequest) {
                        xhr.abort();
                    } else {
                        clearTimeout(xhr);
                        this.promise.applyCallback('abort');
                    }
                }, this);
                this.aborted = true;
            }
        }
    });

    return XHRCollection;

}())