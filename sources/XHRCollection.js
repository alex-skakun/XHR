(function (XHR) {

    'use strict';

    function XHRCollection (result) {
        Array.call(this);
        this.result = result;
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
                        this.result.applyCallback('abort');
                    }
                }, this);
                this.aborted = true;
            }
        }
    });

    XHR.XHRCollection = XHRCollection;

}(XHR));




