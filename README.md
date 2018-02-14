XHR
===

Easy function for working with `XMLHttpRequest`.

# How to use
```javascript
XHR({
    method: 'GET',
    url: 'api/User/10'
})
    .success(data => {
        // do something
    });
```
The `XHR` function returns special object, instance of `XHR.XHRActions`. This object contains next methods:

* `error(callback)` - Callback will be executed in case of network error or response error (status codes 4xx and 5xx);
* `abort(callback)` - Fired when request was aborted by user;
* `loadStart(callback)` - Fired when downloading begins;
* `progress(callback)` - Executes callback function all time during download process. Easy way to display download progress as progressbar;
* `loadEnd(callback)` - Tells about finish of download process;
* `load(callback)` - Fires for any response from server;
* `success(callback)` - Fires for success responses from server (status codes 2xx and 3xx);
* `timeout(callback)` - Callback will be called in case of request timeout;
* `readyStateChange(callback)` - Just listener for `readystatechange` event;
* `silent()` - If it is called, global interceptors will be ignored;
* `interceptors(interceptorsConfig)` - Registers additional callback, where you can modify server response and pass it to `success` or `error` callbacks;
* `getXHR()` - Returns `XHR.XHRCollection` object which contains original `XMLHttpRequest` instances.

Almost each method of `XHR.XHRActions` receives one parameter, callback function, and returns the same object as `XHR` function  (excluding `getXHR()`), so you can make chain of calls.
```javascript
let xhr = XHR({
    url: 'http://yoursite.com/download/file/123',
    method: 'GET'
})
    .silent()
    .loadStart(showProgressBar)
    .progress(changeProgressBarValue)
    .loadEnd(hideProgressBar)
    .success(saveFile)
    .error(showErrorMessage)
    .abort(returnToInitialState)
    .getXHR();
```
## Interceptors
You can modify server response before passing it to `success` or `error` callbacks. You need to call `interceptors()` method and pass `interceptorsConfig` object as argument.
```javascript

class UserApi {
    static loadUser (userId) {
        return XHR({
            method: 'GET',
            url: `api/user/${userId}`
        }).interceptors({
            response (userJson) {
                // return data or promise
                return new User(userJson);
            },
            responseError (error) {
                return new Promise(resolve => doAsyncStuff(error, () => resolve('404')));
            }
        });
    }
}


UserApi.loadUser(15)
    .success(user => user instanceof User /* true */)
    .error(errorMsg => errorMsg === '404' /* true */);

```

### Notes
1. If you subscribe to `load`, `error` and `success` events, in case of any response from server, at first will be fired `load` event and then `error` or `success`.

# Configuration object
The `XHR` function receives one argument, `config` object. This object has only one required property `url`. All rest properties are optional.
It can contain next properties:

* `url` (required) - URL address.
* `method` - HTTP method (GET, POST, PUT, PATCH, DELETE and etc.). Method `GET` is selected by default.
* `params` - Object for query string parameters. For example:
    ```javascript
    XHR({
        url: 'http://yoursite.com',
        params: {
            page: 1,
            pageSize: 100,
            filterIds: [12, 13, 14]
        }
    });
    ```    
    URL will be `http://yoursite.com?page=1&pageSize=100&filterIds=12&filterIds=13&filterIds=14`
        
* `headers` - Object for setting request headers.
    ```javascript
    XHR({
        url: 'http://yoursite.com',
        headers: {
            'Content-Type': 'application/json',
        }
    });
    ```
        
* `attributes` - Object with properties for original `XMLHttpRequest`.
    ```javascript
    XHR({
        url: 'http://yoursite.com',
        attributes: {
            responseType: 'json',
            timeout: 1000
        }
    });
    ```
        
* `async` - Boolean value. Should request be asynchronous or not.
* `data` - Object for request body. It can be string or instance of next classes: `Object`, `FormData`, `Document`, `Blob`, `ArrayBufferView` or `ArrayBuffer`.

# Defaults

You can add some default headers and attributes, that will be added to each XHR request. All defaults are stored in `XHR.defaults`.

* `XHR.defaults.headers` - Object for common HTTP headers;
    ```javascript
    XHR.defaults.headers['Content-Type'] = 'application/json';
    ```
        
* `XHR.defaults.attributes` - Object for common properties for original `XMLHttpRequest`;
    ```javascript
    XHR.defaults.attributes.responseType = 'json';
    ```

* `XHR.defaults.method` - Also you can redefine default method. If your application uses JSON-RPC api format, you can set `POST` as default method, and you don't need appoint method value for each `XHR()` call;
    ```javascript
    XHR.defaults.method = 'POST';
    ```
    
# Global interceptors 
Yo can define global interceptors which will be executed for each `XHR()` call. There are following types of global interceptors:

* `XHR.interceptors.request` - This function will be executed before `xhr.send()`;
* `XHR.interceptors.response` - Executes after `loadend` event;  
* `XHR.interceptors.responseError` - Executes after network error or response with status codes 4xx and 5xx;  
* `XHR.interceptors.abort` - Executes after `abort` error;  

Each global interceptor receives one argument `xhr` instance of `XMLHttpRequest` and returns `boolean`. If interceptor returns `true` request proceeds to it's callbacks, in case of `false` request stops;
If `silent()` method of `XHR.XHRActions` is called, global interceptors will be ignored.

Example: 
```javascript
XHR.interceptors.responseError = function (xhr) {
    if (xhr.status === 401) {
        logout();
        return false;
    } else {
        return true;
    }
};
```

# Worker mode
The library has possibility to make any `XHR()` call in worker. At first enable worker feature by invoking `XHR.enableWorker()`. It returns a promise, which will be resolved when worker is ready.
Then instead of calling `XHR(config)` do `XHR.inWorker(config)`.
        
# Future plans

* Rewrite to ES6 or TS;
* Add support of upload events;




