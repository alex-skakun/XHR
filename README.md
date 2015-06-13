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

* error([callback]) - Callback will be executed in case of network error or response error (status codes 4xx and 5xx);
* abort([callback]) - Fired when request was aborted by user;
* loadStart([callback]) - Fired when downloading begins;
* progress([callback]) - Executes callback function all time during download process. Easy way to display download progress as progressbar;
* loadEnd([callback]) - Tells about finish of download process;
* load([callback]) - Fires for any response from server;
* success([callback]) - Fires for success responses from server (status codes 2xx and 3xx);
* getXHR() - Returns original XMLHttpRequest instance.

Each method of XHR.XHRPromise receives one parameter, callback function, and returns the same object as XHR function  (excluding getXHR()), so you can make chain of calls.

    var xhr = XHR({
        url: 'http://yoursite.com/download/file/123'
        method: 'GET'
    })
        .loadStart(showProgressBar)
        .progress(changeProgressBarValue)
        .loadEnd(hideProgressBar)
        .success(saveFile)
        .error(showErrorMessage)
        .abort(returnToInitialState)
        .getXHR();

###Notes
1. If you subscribe to `load`, `error` and `success` events, in case of any response from server, at first will be fired `load` event and then `error` or `success`.

#Configuration object
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

#Defaults

You can add some default headers and attributes, that will be added to each XHR request. All defaults are stored in `XHR.defaults`.

* XHR.defaults.headers - Object for common HTTP headers;
    
        XHR.defaults.headers['Content-Type'] = 'application/json';
        
* XHR.defaults.attributes - Object for common properties for original XMLHttpRequest;
    
        XHR.defaults.attributes.responseType = 'json';

* XHR.defaults.method - Also you can redefine default method. If your application uses JSON-RPC api format, you can set `POST` as default method, and you don't need appoint method value for each XHR() call;
    
        XHR.defaults.method = 'POST';
        
#Future plans

* Add support of upload events;
* Add default query string parameters.




