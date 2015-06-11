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

##Configuration object
The XHR function receives one argument, `config` object. This object has only one required property `url`. All rest properties are optional.
It can contain next properties:

* url (required) - URL address.
* method - HTTP method (GET, POST, PUT, PATCH, DELETE and etc.). Method `GET` is selected by default.
* params - Object for query string parameters. For example:

        XHR({
            url: 'http://yoursite.com',
            params: {
                page: 1,
                pageSize: 100,
                filterIds: [12, 13, 14]
            }
        });
        
        URL will be http://yoursite.com?page=1&pageSize=100&filterIds=12&filterIds=13&filterIds=14
        
* headers - Object for setting request headers.

        XHR({
            url: 'http://yoursite.com',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
* attributes - Object with properties for original XMLHttpRequest.

        XHR({
            url: 'http://yoursite.com',
            attributes: {
                responseType: 'json',
                timeout: 1000
            }
        });
        
* async - Boolean value. Should request be asynchronous or not.
* data - Object for request body. It can be string or instance of next classes: `Object`, `FormData`, `Document`, `Blob`, `ArrayBufferView` or `ArrayBuffer`.





