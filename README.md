XHR
===

Easy function for working with XMLHttpRequest.

#How to use

    XHR({
        method: 'GET',
        url: 'api/User/10'
    })
        .success(function (data) {
            // do something
        });


The XHR function returns special object, instance of XHR.XHRPromise. This object contains next methods:

* error()
* abort()
* loadStart()
* progress()
* loadEnd()
* load()
* success()
* getXHR()

Each method of XHR.XHRPromise receives one parameter, callback function, and returns the same object as XHR function, so you can make chain of calls.
###Note
The method getXHR() returns instance of XMLHttpRequest, so after invoking of this method you can not continue chain of calls.



