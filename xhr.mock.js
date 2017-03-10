(function XHRlibContent () {

    'use strict';

    /**
     * @param {Object} global
     * @param {Function} EventCollection
     * @param {Function} EventCollectionItem
     */
    (function (global, EventCollection, EventCollectionItem) {
    
        'use strict';
    
        var EVENT_LISTENERS = new EventCollection();
    
        function findTargetItem (target) {
            var allForThisTarget = EVENT_LISTENERS.findForTarget(target);
            if (!allForThisTarget) {
                allForThisTarget = new EventCollectionItem(target);
                EVENT_LISTENERS.add(allForThisTarget);
            }
            return allForThisTarget;
        }
    
        function EventTargetExtendable (eventsArray) {
            if (Array.isArray(eventsArray)) {
                var listeners = {};
                eventsArray.forEach(function (eventName) {
                    var event = eventName.trim().toLowerCase(),
                        property = 'on' + event;
                    Object.defineProperty(this, property, {
                        enumerable: true,
                        configurable: false,
                        get: function () {
                            return listeners[event] || null;
                        },
                        set: function (listener) {
                            var oldListener = listeners[event];
                            if (oldListener) {
                                this.removeEventListener(event, oldListener);
                            }
                            if (typeof listener === 'function') {
                                listeners[event] = listener;
                                this.addEventListener(event, listener);
                            }
                        }
                    });
                }, this);
            }
        }
    
        EventTargetExtendable.prototype.addEventListener = function addEventListener (eventType, listener) {
            if (typeof listener === 'function') {
                var targetItem = findTargetItem(this);
                return targetItem.addListener(eventType, listener);
            }
            return false;
        };
    
        EventTargetExtendable.prototype.removeEventListener = function removeEventListener (eventType, listener) {
            var targetItem = findTargetItem(this);
            return targetItem.removeListener(eventType, listener);
        };
    
        EventTargetExtendable.prototype.dispatchEvent = function dispatchEvent (eventType) {
            var targetItem = findTargetItem(this),
                listeners = targetItem.getListenersByType(eventType),
                args = Array.prototype.slice.call(arguments, 1),
                _this = this;
            if (listeners) {
                var forExecution = [];
                listeners.forEach(function (listener) {
                    if (typeof listener === 'function') {
                        forExecution.push(listener);
                    }
                });
                forExecution.forEach(function (listener) {
                    listener.apply(_this, args);
                })
            }
        };
    
        EventTargetExtendable.prototype.removeAllListeners = function removeAllListeners (type) {
            var targetItem = findTargetItem(this);
            if (type) {
                return targetItem.removeListeners(type);
            } else {
                return EVENT_LISTENERS.remove(targetItem);
            }
        };
    
        var prototype = EventTargetExtendable.prototype,
            methods = Object.keys(EventTargetExtendable.prototype);
        for (var i = 0, l = methods.length; i < l; i++) {
            Object.defineProperty(prototype, methods[i], {
                enumerable: false,
                configurable: false,
                writable: false
            });
        }
    
        global.EventTargetExtendable = EventTargetExtendable;
    
    }(this,
        (function () {
        
            'use strict';
        
            function EventCollection () {
                var CollectionConstructor;
                try {
                    CollectionConstructor = Map;
                } catch (e) {
                    CollectionConstructor = Array;
                }
                this.collection = new CollectionConstructor();
            }
        
            EventCollection.prototype.findForTarget = function findForTarget (target) {
                if (Array.isArray(this.collection)) {
                    var collection = this.collection;
                    for (var i = 0, l = collection.length; i < l; i++) {
                        var item = collection[i];
                        if (item.target === target) {
                            return item;
                        }
                    }
                } else {
                    return this.collection.get(target);
                }
                return null;
            };
        
            EventCollection.prototype.add = function add (item) {
                if (Array.isArray(this.collection)) {
                    this.collection.push(item);
                } else {
                    this.collection.set(item.target, item);
                }
            };
        
            EventCollection.prototype.remove = function remove (item) {
                if (Array.isArray(this.collection)) {
                    var index = this.collection.indexOf(item);
                    if (index > -1) {
                        var removed = this.collection.splice(index, 1);
                        return removed.length === 1;
                    }
                    return false;
                } else {
                    return this.collection.delete(item.target);
                }
            };
        
            return EventCollection;
        
        }()),
        (function () {
        
            'use strict';
        
            function EventCollectionItem (target) {
                this.target = target;
                this.listeners = {};
            }
        
            EventCollectionItem.createListenersCollection = function createListenersCollection () {
                var CollectionConstructor;
                try {
                    CollectionConstructor = Set;
                } catch (e) {
                    CollectionConstructor = Array;
                }
                return new CollectionConstructor();
            };
        
            EventCollectionItem.prototype.getListenersByType = function getListenersByType (type) {
                var listeners = this.listeners[type];
                if (!listeners) {
                    listeners = EventCollectionItem.createListenersCollection();
                    this.listeners[type] = listeners;
                }
                return listeners;
            };
        
            EventCollectionItem.prototype.addListener = function addListener (type, listener) {
                var listeners = this.getListenersByType(type);
                if (Array.isArray(listeners)) {
                    if (!~listeners.indexOf(listener)) {
                        listeners.push(listener);
                        return true;
                    }
                    return false;
                } else {
                    if (!listeners.has(listener)) {
                        listeners.add(listener);
                        return true;
                    }
                    return false;
                }
            };
        
            EventCollectionItem.prototype.removeListener = function removeListener (type, listener) {
                var listeners = this.getListenersByType(type);
                if (Array.isArray(listeners)) {
                    var index = listeners.indexOf(listener);
                    if (index > -1) {
                        var deleted = listeners.splice(index, 1);
                        return deleted.length === 1;
                    }
                    return false;
                } else {
                    return listeners.delete(listener);
                }
            };
        
            EventCollectionItem.prototype.removeListeners = function removeListeners (type) {
                var listeners = this.getListenersByType(type);
                if (Array.isArray(listeners)) {
                    listeners.splice(0, listeners.length);
                } else {
                    listeners.clear();
                }
                return true;
            };
        
            return EventCollectionItem;
        
        }())
    ));
    

    var XHRActions = (function () {
                     
                         'use strict';
                     
                         /**
                          * @param {XHRPromise} xhrPromise
                          * @constructor XHRActions
                          */
                         function XHRActions (xhrPromise) {
                             this._promise = xhrPromise;
                         }
                     
                         /**
                          * @returns {Boolean}
                          */
                         XHRActions.prototype.isInProgress = function isInProgress () {
                             return this._promise.inProgress;
                         };
                         /**
                          * @param {Object} data
                          * @returns {XHRActions}
                          */
                         XHRActions.prototype.interceptors = function interceptors (data) {
                             this._promise.interceptors = data;
                             return this;
                         };
                         /**
                          * @returns {XHRActions}
                          */
                         XHRActions.prototype.silent = function silent () {
                             this._promise.silent = true;
                             return this;
                         };
                         /**
                          * @param {Function} callback
                          * @returns {XHRActions}
                          */
                         XHRActions.prototype.error = function error (callback) {
                             this._promise.addEventListener('error', callback);
                             return this;
                         };
                         /**
                          * @param {Function} callback
                          * @returns {XHRActions}
                          */
                         XHRActions.prototype.loadStart = function loadStart (callback) {
                             this._promise.addEventListener('loadstart', callback);
                             return this;
                         };
                         /**
                          * @param {Function} callback
                          * @returns {XHRActions}
                          */
                         XHRActions.prototype.progress = function progress (callback) {
                             this._promise.addEventListener('progress', callback);
                             return this;
                         };
                         /**
                          * @param {Function} callback
                          * @returns {XHRActions}
                          */
                         XHRActions.prototype.loadEnd = function loadEnd (callback) {
                             this._promise.addEventListener('loadend', callback);
                             return this;
                         };
                         /**
                          * @param {Function} callback
                          * @returns {XHRActions}
                          */
                         XHRActions.prototype.abort = function abort (callback) {
                             this._promise.addEventListener('abort', callback);
                             return this;
                         };
                         /**
                          * @param {Function} callback
                          * @returns {XHRActions}
                          */
                         XHRActions.prototype.load = function load (callback) {
                             this._promise.addEventListener('load', callback);
                             return this;
                         };
                         /**
                          * @param {Function} callback
                          * @returns {XHRActions}
                          */
                         XHRActions.prototype.success = function success (callback) {
                             this._promise.addEventListener('success', callback);
                             return this;
                         };
                         /**
                          * @param {Function} callback
                          * @returns {XHRActions}
                          */
                         XHRActions.prototype.timeout = function timeout (callback) {
                             this._promise.addEventListener('timeout', callback);
                             return this;
                         };
                         /**
                          * @param {Function} callback
                          * @returns {XHRActions}
                          */
                         XHRActions.prototype.readyStateChange = function readyStateChange (callback) {
                             this._promise.addEventListener('readystatechange', callback);
                             return this;
                         };
                         /**
                          * @param {Function} callback
                          * @returns {XHRActions}
                          */
                         XHRActions.prototype.then = function (callback) {
                             this._promise.queue.push(callback);
                             return this;
                         };
                         /**
                          * @returns {XHRCollection}
                          */
                         XHRActions.prototype.getXHR = function getXHR () {
                             return this._promise.xhrCollection;
                         };
                     
                         return XHRActions;
                     
                     }()),
        XHRPromise = (function (global) {
                     
                         'use strict';
                     
                         var Promise = global.Promise;
                     
                         var interceptorTypes = {
                             'request': 'request',
                             'success': 'response',
                             'error': 'responseError',
                             'abort': 'abort'
                         };
                     
                         function getXHROptions (xhr) {
                             var type = xhr.responseType;
                             return {
                                 readyState: xhr.readyState,
                                 response: xhr.response,
                                 responseText: type === '' || type === 'text' ? xhr.responseText : null,
                                 status: xhr.status,
                                 statusText: xhr.statusText
                             };
                         }
                     
                         /**
                          * @param {(XMLHttpRequest | Number)} xhr
                          * @constructor XHRPromise
                          * @extends EventTargetExtendable
                          * @property {Boolean}          inProgress
                          * @property {XHRCollection}    XHRCollection
                          * @property {Boolean}          silent
                          * @property {Function[]}       queue
                          * @property {XHRActions}       actions
                          */
                         function XHRPromise (xhr) {
                             this.inProgress = true;
                             this.xhrCollection = new XHRCollection(this);
                             if (xhr !== undefined) {
                                 this.xhrCollection.push(xhr);
                             }
                             this.silent = false;
                             this.interceptors = {};
                             this.queue = [];
                             this.actions = new XHRActions(this);
                         }
                     
                         XHRPromise.prototype = Object.create(EventTargetExtendable.prototype, {
                             constructor: {
                                 value: XHRPromise
                             }
                         });
                     
                         XHRPromise.prototype.destroy = function destroy () {
                             this.dispatchEvent('destroy');
                             if (XHR.workerMode) {
                                 this.sendMessageToMainThread('destroy');
                             }
                             this.inProgress = false;
                             this.removeAllListeners();
                         };
                     
                         function getPrototypes (obj) {
                             var prototypes = [],
                                 proto = Object.getPrototypeOf(obj);
                             while (proto) {
                                 prototypes.push(proto);
                                 proto = Object.getPrototypeOf(proto.constructor.prototype);
                             }
                             return prototypes;
                         }
                     
                         function copyObject (data) {
                             var copy = {},
                                 properties = getPrototypes(data).reverse()
                                     .map(function (proto) {
                                         return Object.getOwnPropertyNames(proto)
                                             .map(function (property) {
                                                 return {
                                                     property: property,
                                                     proto: proto
                                                 };
                                             });
                                     })
                                     .reduce(function (a, b) {
                                         return a.concat(b);
                                     }, []);
                             if (Array.isArray(properties)) {
                                 properties.forEach(function (item) {
                                     var descriptor = Object.getOwnPropertyDescriptor(item.proto, item.property),
                                         value = data[item.property];
                                     if (typeof descriptor.get === 'function' && !(value instanceof Object)) {
                                         copy[item.property] = value;
                                     }
                                 });
                             }
                     
                             return copy;
                         }
                     
                         XHRPromise.prototype.sendMessageToMainThread = function sendMessageToMainThread (callbackName, data, xhr) {
                             var message = {
                                 guid: this.guid,
                                 eventName: callbackName,
                                 data: data,
                                 xhrOptions: xhr ? getXHROptions(xhr) : null
                             };
                             try {
                                 global.postMessage(message);
                             } catch (e) {
                                 message.data = copyObject(data);
                                 global.postMessage(message);
                             }
                         };
                     
                         /**
                          * Executes specified callback
                          * @param {String} callbackName
                          * @param {*} data
                          * @param {XMLHttpRequest} xhr
                          */
                         XHRPromise.prototype.applyCallback = function applyCallback (callbackName, data, xhr) {
                             var _this = this,
                                 globalInterceptorResult = this.checkInterceptor(interceptorTypes[callbackName], xhr),
                                 interceptorResolved = function () {
                                     var ownInterceptorResult = _this.applyOwnInterceptor(interceptorTypes[callbackName], data),
                                         continueToCallback = function (interceptorResult) {
                                             if (XHR.workerMode) {
                                                 _this.sendMessageToMainThread(callbackName, interceptorResult, xhr);
                                             } else {
                                                 _this.dispatchEvent(callbackName, interceptorResult, xhr);
                                             }
                                             if (callbackName === 'success' || callbackName === 'error' || callbackName === 'abort' ||
                                                 callbackName === 'timeout') {
                                                 _this.destroy();
                                             }
                                         };
                                     if (Promise && ownInterceptorResult instanceof Promise) {
                                         ownInterceptorResult.then(continueToCallback, interceptorRejected);
                                     } else {
                                         continueToCallback(ownInterceptorResult);
                                     }
                                 },
                                 interceptorRejected = function () {
                                     _this.destroy();
                                 };
                     
                             if (Promise && globalInterceptorResult instanceof Promise) {
                                 globalInterceptorResult.then(interceptorResolved, interceptorRejected);
                             } else {
                                 if (globalInterceptorResult) {
                                     interceptorResolved();
                                 } else {
                                     _this.destroy();
                                 }
                             }
                         };
                     
                         /**
                          * Makes a check of global interceptor
                          * @param {String} interceptorName
                          * @param {XMLHttpRequest} xhr
                          * @returns {(Boolean | Promise)}
                          */
                         XHRPromise.prototype.checkInterceptor = function checkInterceptor (interceptorName, xhr) {
                             if (interceptorName && typeof XHR.interceptors[interceptorName] === 'function') {
                                 return this.silent || XHR.interceptors[interceptorName](xhr);
                             }
                             return true;
                         };
                     
                         /**
                          * Executes an interceptor for data
                          * @param {String} interceptorName
                          * @param {Object} data
                          * @returns {(* | Promise)}
                          */
                         XHRPromise.prototype.applyOwnInterceptor = function applyOwnInterceptor (interceptorName, data) {
                             var interceptor = this.interceptors[interceptorName];
                             if (typeof interceptor === 'function') {
                                 return interceptor(data);
                             } else {
                                 return data;
                             }
                         };
                     
                         /**
                          * Returns next function from requests queue
                          * @returns {Function}
                          */
                         XHRPromise.prototype.getNext = function getNext () {
                             return this.queue.shift();
                         };
                     
                         /**
                          * @param {(XMLHttpRequest | Number)} xhr
                          * @returns {XHRPromise}
                          */
                         XHRPromise.prototype.addToQueue = function addToQueue (xhr) {
                             if (xhr instanceof XHRCollection) {
                                 var collection = this.xhrCollection,
                                     startItem = collection.length,
                                     args = xhr.slice();
                                 args.unshift(0);
                                 args.unshift(startItem);
                                 collection.splice.apply(collection, args);
                             } else {
                                 this.xhrCollection.push(xhr);
                             }
                             return this;
                         };
                     
                         return XHRPromise;
                     
                     }(this)),
        XHRCollection = (function () {
                        
                            'use strict';
                        
                            /**
                             * @extends {Array}
                             * @param promise
                             * @constructor XHRCollection
                             */
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
                                            if (xhr instanceof XMLHttpRequest || xhr instanceof XHRWorker) {
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
                        
                        }()),
        XHRWorker = (function () {
                    
                        'use strict';
                    
                        /**
                         * @param {String} guid
                         * @param {Object} config
                         * @constructor XHRWorker
                         */
                        function XHRWorker (guid, config) {
                            var _this = this;
                            this.guid = guid;
                            this.config = config;
                            this.config.attributes = this.config.attributes || {};
                            this.config.headers = this.config.headers || {};
                            this.xhrOptions = {
                                readyState: XMLHttpRequest.UNSENT,
                                response: null,
                                responseText: null,
                                status: 0,
                                statusText: null
                            };
                            XHR._worker.addEventListener('message', function messageListener (event) {
                                if (event.data.guid === _this.guid) {
                                    var message = event.data,
                                        eventName = message.eventName,
                                        data = message.data;
                                    if (eventName === 'destroy') {
                                        XHR._worker.removeEventListener('message', messageListener);
                                        _this.removeAllListeners();
                                    } else {
                                        _this.applyXHROptions(message.xhrOptions);
                                        _this.dispatchEvent('event', eventName, data, _this);
                                    }
                                }
                            });
                        }
                        
                        XHRWorker.prototype = Object.create(EventTargetExtendable.prototype, {
                            constructor: {
                                value: XHRWorker
                            },
                            responseType: {
                                get: function () {
                                    return this.config.attributes.responseType || '';
                                },
                                set: function (val) {
                                    this.config.attributes.responseType = val
                                }
                            },
                            timeout: {
                                get: function () {
                                    return this.config.attributes.timeout || 0;
                                },
                                set: function (val) {
                                    this.config.attributes.timeout = val
                                }
                            },
                            readyState: {
                                get: function () {
                                    return this.xhrOptions.readyState;
                                }
                            },
                            response: {
                                get: function () {
                                    return this.xhrOptions.response;
                                }
                            },
                            responseText: {
                                get: function () {
                                    return this.xhrOptions.responseText;
                                }
                            },
                            status: {
                                get: function () {
                                    return this.xhrOptions.status;
                                }
                            },
                            statusText: {
                                get: function () {
                                    return this.xhrOptions.statusText;
                                }
                            }
                        });
                        
                        XHRWorker.prototype.applyXHROptions = function (xhrOptions) {
                            var type = this.responseType;
                            this.xhrOptions.readyState = xhrOptions.readyState;
                            this.xhrOptions.response = xhrOptions.response;
                            this.xhrOptions.responseText = type === '' || type === 'text' ? xhrOptions.responseText : null;
                            this.xhrOptions.status = xhrOptions.status;
                            this.xhrOptions.statusText = xhrOptions.statusText;
                        };
                    
                        XHRWorker.prototype.open = function (method, url, async) {
                            this.config.method = method;
                            this.config.async = async;
                            this.xhrOptions.readyState = XMLHttpRequest.OPENED;
                            this.dispatchEvent('readystatechange');
                        };
                        
                        XHRWorker.prototype.send = function (data) {
                            this.config.data = data;
                            XHR._worker.postMessage({
                                guid: this.guid,
                                type: 'request',
                                options: this.config
                            });
                        };
                        
                        XHRWorker.prototype.setRequestHeader = function (header, value) {
                            this.config.headers[header] = value;
                        };
                    
                        XHRWorker.prototype.abort = function () {
                            XHR._worker.postMessage({
                                guid: this.guid,
                                type: 'abort'
                            });
                        };
                        
                        return XHRWorker;
                        
                    }()),
        XHR = (function (global) {
              
                  'use strict';
              
                  var Promise = global.Promise;
                  (function (global) {
                  
                      'use strict';
                  
                      function XMLHttpEvent (config) {
                          Object.defineProperties(this, {
                              'target': {
                                  value: config.target,
                                  enumerable: true
                              },
                              'currentTarget': {
                                  value: config.target,
                                  enumerable: true
                              },
                              'type': {
                                  value: config.type,
                                  enumerable: true
                              },
                              'bubbles': {
                                  value: !!config.bubbles,
                                  enumerable: true
                              },
                              'cancelable': {
                                  value: !!config.cancelable,
                                  enumerable: true
                              },
                              'lengthComputable': {
                                  value: !!config.length
                              },
                              'loaded': {
                                  value: config.loaded
                              },
                              'total': {
                                  value: config.total
                              }
                          })
                      }
                  
                      XMLHttpEvent.prototype = Object.create(CustomEvent.prototype, {
                          constructor: {
                              value: XMLHttpEvent
                          }
                      });
                  
                      XMLHttpEvent.prototype.stopPropagation = function () {
                          CustomEvent.prototype.stopPropagation.apply(window);
                      };
                  
                      var SAVED_RESPONSES = {},
                          _readyState,
                          _aborted;
                  
                      function FakeXMLHttpRequest () {
                          this.timeout = 0;
                          this.headers = {};
                          this.status = 0;
                          this.statusText = null;
                          _aborted = false;
                          _readyState = FakeXMLHttpRequest.UNSENT;
                          Object.defineProperty(this, 'readyState', {
                              get: function () {
                                  return _readyState;
                              },
                              set: function (value) {
                                  _readyState = value;
                                  this.dispatchEvent('readystatechange', new XMLHttpEvent({target: this, type: 'readystatechange'}));
                              }
                          });
                      }
                  
                      FakeXMLHttpRequest.prototype = Object.create(EventTargetExtendable.prototype, {
                          constructor: {
                              value: FakeXMLHttpRequest
                          }
                      });
                  
                      FakeXMLHttpRequest.prototype.abort = function () {
                          if (this.readyState !== FakeXMLHttpRequest.UNSENT) {
                              _readyState = FakeXMLHttpRequest.UNSENT;
                              _aborted = true;
                              this.dispatchEvent('abort', new XMLHttpEvent({target: this, type: 'abort', length: false, loaded: 0, total: 0}));
                              this.dispatchEvent('loadend', new XMLHttpEvent({target: this, type: 'loadend', length: false, loaded: 0, total: 0}));
                          }
                      };
                  
                      FakeXMLHttpRequest.prototype.getAllResponseHeaders = function () {
                          return this.headers
                      };
                  
                      FakeXMLHttpRequest.prototype.getResponseHeader = function (name) {
                          return this.headers[name];
                      };
                  
                      FakeXMLHttpRequest.prototype.open = function (method, url, async) {
                          this.method = method;
                          this.url = url;
                          this.async = async;
                          this.readyState = FakeXMLHttpRequest.OPENED;
                      };
                  
                      FakeXMLHttpRequest.prototype.setRequestHeader = function (header, value) {
                          this.headers[header] = value;
                      };
                  
                      FakeXMLHttpRequest.prototype.send = function (data) {
                          var _this = this;
                          _this.dispatchEvent('loadstart', new XMLHttpEvent({target: _this, type: 'loadstart', length: true, loaded: 0, total: 0}));
                          _this.data = data;
                          _this.setUserRequestConfig();
                          _this.setResponseHeaders();
                          _this.readyState = FakeXMLHttpRequest.HEADERS_RECEIVED;
                          if (!this.userConfig) {
                              _this.status = 404;
                              _this.response = 'data not found';
                              _this.readyState = FakeXMLHttpRequest.DONE;
                              _this.dispatchEvent('load', new XMLHttpEvent({target: _this, type: 'load', length: true, total: 0, loaded: 0}));
                              _this.dispatchEvent('loadend', new XMLHttpEvent({target: _this, type: 'loadend', length: true, total: 0, loaded: 0}));
                          } else if (_this.checkHeaders()) {
                              _this.resetTimeout = null;
                              if (_this.timeout) {
                                  _this.resetTimeout = setTimeout(function () {
                                      _this.dispatchEvent('timeout', new XMLHttpEvent({target: _this, type: 'timeout', length: false, loaded: 0, total: 0}));
                                      _this.dispatchEvent('loadend', new XMLHttpEvent({target: _this, type: 'loadend', length: true, total: 0, loaded: 0}));
                                      if (_this.resetUserTimeout) {
                                          clearTimeout(_this.resetUserTimeout);
                                      }
                                  }, _this.timeout);
                              }
                              _this.readyState = FakeXMLHttpRequest.LOADING;
                              _this.resetUserTimeout = null;
                              _this.resetUserTimeout = setTimeout(function () {
                                  _this.sendResponse();
                              }, _this.userConfig.timeout);
                          } else {
                              _this.status = 400;
                              _this.response = 'headers not the same';
                              _this.readyState = FakeXMLHttpRequest.DONE;
                              _this.dispatchEvent('error', new XMLHttpEvent({target: _this, type: 'error', length: false, loaded: 0, total: 0}));
                              _this.dispatchEvent('loadend', new XMLHttpEvent({target: _this, type: 'loadend', length: false, loaded: 0, total: 0}));
                          }
                      };
                  
                      FakeXMLHttpRequest.prototype.overrideMimeType = function (mimeType) {
                          this.mimeType = mimeType;
                      };
                  
                      FakeXMLHttpRequest.prototype.setUserRequestConfig = function () {
                          var key = getRequestKey(this.url, this.method, this.data),
                              config = SAVED_RESPONSES[key];
                          delete SAVED_RESPONSES[key];
                          this.userConfig = config;
                      };
                  
                      FakeXMLHttpRequest.prototype.sendResponse = function () {
                          if (this.resetTimeout) {
                              clearTimeout(this.resetTimeout);
                          }
                          this.responseType = this.responseType || (this.userConfig ? this.userConfig.responseType : '');
                          this.response = typeof this.userConfig.response === 'function' ?
                                          this.userConfig.response() : this.userConfig.response;
                          this.responseText = JSON.stringify(this.response);
                          if (this.responseType === 'text') {
                              this.response = JSON.stringify(this.response);
                          }
                          if (this.responseType === 'blob') {
                              this.response = new Blob([JSON.stringify(this.response)]);
                          }
                          this.status = this.userConfig.status;
                          this.statusText = this.userConfig.statusText;
                          var loaded, total = loaded = this.responseText.length;
                          if (!_aborted) {
                              this.dispatchEvent('progress', new XMLHttpEvent({target: this, type: 'progress', length: true, total: total, loaded: loaded}));
                              this.readyState = FakeXMLHttpRequest.DONE;
                              this.dispatchEvent('load', new XMLHttpEvent({target: this, type: 'load', length: true, total: total, loaded: loaded}));
                              this.dispatchEvent('loadend', new XMLHttpEvent({target: this, type: 'loadend', length: true, total: total, loaded: loaded}));
                          }
                      };
                  
                      FakeXMLHttpRequest.prototype.checkHeaders = function () {
                          return !this.userConfig.headers || !Object.keys(this.userConfig.headers).length ||
                              compareHeaders(this.userConfig.headers, this.headers);
                      };
                  
                      FakeXMLHttpRequest.prototype.setResponseHeaders = function () {
                          this.headers = this.userConfig && this.userConfig.responseHeaders ? this.userConfig.responseHeaders : this.headers;
                      };
                  
                      FakeXMLHttpRequest.addRequest = function (config, responseConfig) {
                          if (!config.url) {
                              throw new Error('no url provided')
                          }
                          responseConfig = responseConfig || {};
                          var key = getRequestKey(config.url, config.method, config.data);
                          SAVED_RESPONSES[key] = {
                              url: config.url,
                              method: config.method || FakeXMLHttpRequest.defaults.method,
                              data: config.data,
                              timeout: config.timeout || FakeXMLHttpRequest.defaults.timeout,
                              headers: config.headers || FakeXMLHttpRequest.defaults.headers,
                              status: responseConfig.status || FakeXMLHttpRequest.defaults.status,
                              statusText: responseConfig.statusText,
                              responseType: responseConfig.type || FakeXMLHttpRequest.defaults.responseType,
                              responseHeaders: responseConfig.headers,
                              response: responseConfig.data || null
                          };
                      };
                  
                      Object.defineProperty(FakeXMLHttpRequest, 'defaults', {
                          value: {
                              method: 'GET',
                              headers: {},
                              responseType: '',
                              timeout: 0,
                              status: 200
                          },
                          configurable: false,
                          writable: false
                      });
                  
                      function getRequestKey (url, method, data) {
                          method = method || FakeXMLHttpRequest.defaults.method;
                          data = data ? sortProperties(data) : '';
                          return hex_sha1(url + method + data);
                      }
                  
                      function sortProperties (obj) {
                          var ordered = {};
                          Object.keys(obj).sort().forEach(function(key) {
                              if (typeof obj[key] === 'object'){
                                  obj[key] = sortProperties(obj[key]);
                              }
                              ordered[key] = obj[key];
                          });
                          return ordered;
                      }
                  
                      function compareHeaders (userConfigHeaders, headers) {
                          var allHeadersProvided = true;
                          for (var header in userConfigHeaders) {
                              if (userConfigHeaders.hasOwnProperty(header)) {
                                  allHeadersProvided = allHeadersProvided && (userConfigHeaders[header] === headers[header]);
                              }
                          }
                          return allHeadersProvided;
                      }
                  
                      FakeXMLHttpRequest.UNSENT = XMLHttpRequest.UNSENT;
                      FakeXMLHttpRequest.OPENED = XMLHttpRequest.OPENED;
                      FakeXMLHttpRequest.HEADERS_RECEIVED = XMLHttpRequest.HEADERS_RECEIVED;
                      FakeXMLHttpRequest.LOADING = XMLHttpRequest.LOADING;
                      FakeXMLHttpRequest.DONE = XMLHttpRequest.DONE;
                  
                      var originalXMLHttpRequest = XMLHttpRequest;
                      global.XMLHttpRequest = FakeXMLHttpRequest;
                  
                      //hex_sha1 lib
                  
                      var hexcase = 0;
                  
                      function hex_sha1(s)    { return rstr2hex(rstr_sha1(str2rstr_utf8(s))); }
                  
                      function rstr_sha1(s) {
                          return binb2rstr(binb_sha1(rstr2binb(s), s.length * 8));
                      }
                  
                      function rstr2hex(input) {
                          try { hexcase } catch(e) { hexcase=0; }
                          var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
                          var output = "";
                          var x;
                          for(var i = 0; i < input.length; i++) {
                              x = input.charCodeAt(i);
                              output += hex_tab.charAt((x >>> 4) & 0x0F)
                                  +  hex_tab.charAt( x        & 0x0F);
                          }
                          return output;
                      }
                  
                      function str2rstr_utf8(input) {
                          var output = "";
                          var i = -1;
                          var x, y;
                  
                          while(++i < input.length) {
                              x = input.charCodeAt(i);
                              y = i + 1 < input.length ? input.charCodeAt(i + 1) : 0;
                              if(0xD800 <= x && x <= 0xDBFF && 0xDC00 <= y && y <= 0xDFFF) {
                                  x = 0x10000 + ((x & 0x03FF) << 10) + (y & 0x03FF);
                                  i++;
                              }
                  
                              if(x <= 0x7F)
                                  output += String.fromCharCode(x);
                              else if(x <= 0x7FF)
                                  output += String.fromCharCode(0xC0 | ((x >>> 6 ) & 0x1F),
                                      0x80 | ( x         & 0x3F));
                              else if(x <= 0xFFFF)
                                  output += String.fromCharCode(0xE0 | ((x >>> 12) & 0x0F),
                                      0x80 | ((x >>> 6 ) & 0x3F),
                                      0x80 | ( x         & 0x3F));
                              else if(x <= 0x1FFFFF)
                                  output += String.fromCharCode(0xF0 | ((x >>> 18) & 0x07),
                                      0x80 | ((x >>> 12) & 0x3F),
                                      0x80 | ((x >>> 6 ) & 0x3F),
                                      0x80 | ( x         & 0x3F));
                          }
                          return output;
                      }
                  
                      function rstr2binb(input) {
                          var output = Array(input.length >> 2);
                          for(var i = 0; i < output.length; i++)
                              output[i] = 0;
                          for(var i = 0; i < input.length * 8; i += 8)
                              output[i>>5] |= (input.charCodeAt(i / 8) & 0xFF) << (24 - i % 32);
                          return output;
                      }
                  
                      function binb2rstr(input) {
                          var output = "";
                          for(var i = 0; i < input.length * 32; i += 8)
                              output += String.fromCharCode((input[i>>5] >>> (24 - i % 32)) & 0xFF);
                          return output;
                      }
                  
                      function binb_sha1(x, len)
                      {
                          /* append padding */
                          x[len >> 5] |= 0x80 << (24 - len % 32);
                          x[((len + 64 >> 9) << 4) + 15] = len;
                  
                          var w = Array(80);
                          var a =  1732584193;
                          var b = -271733879;
                          var c = -1732584194;
                          var d =  271733878;
                          var e = -1009589776;
                  
                          for(var i = 0; i < x.length; i += 16) {
                              var olda = a;
                              var oldb = b;
                              var oldc = c;
                              var oldd = d;
                              var olde = e;
                  
                              for(var j = 0; j < 80; j++) {
                                  if(j < 16) w[j] = x[i + j];
                                  else w[j] = bit_rol(w[j-3] ^ w[j-8] ^ w[j-14] ^ w[j-16], 1);
                                  var t = safe_add(safe_add(bit_rol(a, 5), sha1_ft(j, b, c, d)),
                                      safe_add(safe_add(e, w[j]), sha1_kt(j)));
                                  e = d;
                                  d = c;
                                  c = bit_rol(b, 30);
                                  b = a;
                                  a = t;
                              }
                  
                              a = safe_add(a, olda);
                              b = safe_add(b, oldb);
                              c = safe_add(c, oldc);
                              d = safe_add(d, oldd);
                              e = safe_add(e, olde);
                          }
                          return Array(a, b, c, d, e);
                      }
                  
                      function sha1_ft(t, b, c, d) {
                          if(t < 20) return (b & c) | ((~b) & d);
                          if(t < 40) return b ^ c ^ d;
                          if(t < 60) return (b & c) | (b & d) | (c & d);
                          return b ^ c ^ d;
                      }
                  
                      function sha1_kt(t) {
                          return (t < 20) ?  1518500249 : (t < 40) ?  1859775393 :
                                                          (t < 60) ? -1894007588 : -899497514;
                      }
                  
                      function safe_add(x, y) {
                          var lsw = (x & 0xFFFF) + (y & 0xFFFF);
                          var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
                          return (msw << 16) | (lsw & 0xFFFF);
                      }
                  
                      function bit_rol(num, cnt) {
                          return (num << cnt) | (num >>> (32 - cnt));
                      }
                  
                  
                  }(global));
              
                  function setAttributes (_attributes, xhr) {
                      var resultAttributes = {},
                          defaultAttributes = Object.keys(XHR.defaults.attributes),
                          attr,
                          attributesNames,
                          i, l;
                      for (i = 0, l = defaultAttributes.length; i < l; i++) {
                          attr = defaultAttributes[i];
                          resultAttributes[attr] = XHR.defaults.attributes[attr];
                      }
                      if (_attributes && typeof _attributes === 'object') {
                          var userAttributes = Object.keys(_attributes);
                          for (i = 0, l = userAttributes.length; i < l; i++) {
                              attr = userAttributes[i];
                              resultAttributes[attr] = _attributes[attr];
                              xhr[attr] = _attributes[attr];
                          }
                      }
                      attributesNames = Object.keys(resultAttributes);
                      for (i = 0, l = attributesNames.length; i < l; i++) {
                          attr = attributesNames[i];
                          xhr[attr] = resultAttributes[attr];
                      }
                  }
              
                  function setQueryParams (_params) {
                      var queryParams = '';
                      if (_params && typeof _params === 'object') {
                          var params = [],
                              paramsKeys = Object.keys(_params);
                          paramsKeys.forEach(function (param) {
                              var value = _params[param];
                              if (Array.isArray(value)) {
                                  value.forEach(function (val) {
                                      params.push(param + '=' + val);
                                  });
                              } else if (typeof value === 'object' && value) {
                                  params.push(param + '=' + JSON.stringify(value));
                              } else if (typeof value !== 'undefined') {
                                  params.push(param + '=' + value);
                              }
                          });
                          if (params.length) {
                              queryParams = '?' + params.join('&');
                          }
                      }
                      return queryParams;
                  }
              
                  function setData (data) {
                      var dataForSend = null;
                      if (data !== undefined && data !== null) {
                          var d = data;
                          if (d instanceof (global.ArrayBufferView || global.ArrayBuffer) || d instanceof global.Blob ||
                              (!XHR.workerMode ? d instanceof global.Document : false) || (!XHR.workerMode ? d instanceof global.FormData : false)) {
                              dataForSend = d;
                          } else {
                              if (typeof d === 'object' && d) {
                                  dataForSend = JSON.stringify(d);
                              } else {
                                  dataForSend = String(d);
                              }
                          }
                      }
                      return dataForSend;
                  }
              
                  function setHeaders (xhr, headers) {
                      var resultHeaders = {},
                          defaultHeadersKeys = Object.keys(XHR.defaults.headers),
                          userHeadersKeys,
                          resultHeadersKeys,
                          header,
                          value,
                          i, l;
                      for (i = 0, l = defaultHeadersKeys.length; i < l; i++) {
                          header = defaultHeadersKeys[i];
                          resultHeaders[header.toLowerCase()] = XHR.defaults.headers[header];
                      }
                      if (headers && typeof headers === 'object') {
                          userHeadersKeys = Object.keys(headers);
                          for (i = 0, l = userHeadersKeys.length; i < l; i++) {
                              header = userHeadersKeys[i];
                              resultHeaders[header.toLowerCase()] = headers[header];
                          }
                      }
                      resultHeadersKeys = Object.keys(resultHeaders);
                      for (i = 0, l = resultHeadersKeys.length; i < l; i++) {
                          header = resultHeadersKeys[i];
                          value = resultHeaders[header];
                          if (typeof value !== 'undefined' && value !== null) {
                              xhr.setRequestHeader(header, String(value));
                          }
                      }
                  }
              
                  function createListener (originalListener, promise, xhr) {
                      return function (e) {
                          if (typeof originalListener === 'string') {
                              return promise.applyCallback(originalListener, e, xhr);
                          } else if (typeof originalListener === 'function') {
                              return originalListener.call(this, e, promise, xhr);
                          }
                      };
                  }
                  
                  function autoParseResponseText (xhr) {
                      var response;
                      try {
                          response = JSON.parse(xhr.responseText);
                      } catch (e) {
                          response = xhr.responseText;
                      }
                      return response;
                  }
                  
                  function makeNextRequestFromConfigObject (configObject, result, xhr) {
                      try {
                          XHR(configObject, result);
                      } catch (e) {
                          result.applyCallback('error', e, xhr);
                      } 
                  }
              
                  function loadEndListener (e, result, xhr) {
                      result.applyCallback('loadend', e, xhr);
                      var response = xhr.response;
                      if (xhr.responseType === '' || xhr.responseType === 'text') {
                          response = autoParseResponseText(xhr);
                      }
                      if (xhr.status >= 200 && xhr.status < 400) {
                          var applyQueue = function (response) {
                              if (result.queue.length) {
                                  var nextRequest = result.getNext();
                                  if (typeof nextRequest === 'function' && !result.xhrCollection.aborted) {
                                      var interceptorResult = result.checkInterceptor('response', xhr),
                                          makeNextRequest = function () {
                                              var configObject = nextRequest(response);
                                              if (configObject) {
                                                  if (configObject instanceof XHRActions) {
                                                      configObject
                                                          .success(function (data) {
                                                              applyQueue(data);
                                                          })
                                                          .error(function (error) {
                                                              applyQueue(error);
                                                          });
                                                  } else {
                                                      makeNextRequestFromConfigObject(configObject, result);
                                                  }
                                              } else {
                                                  result.applyCallback('success', response, xhr);
                                              }
                                          };
                                      if (Promise && interceptorResult instanceof Promise) {
                                          interceptorResult.then(makeNextRequest);
                                      } else if (interceptorResult) {
                                          makeNextRequest();
                                      }
                                  }
                              } else {
                                  result.applyCallback('success', response, xhr);
                              }
                          };
                          applyQueue(response);
                      } else if (xhr.status >= 400 && xhr.status < 600) {
                          result.applyCallback('error', response, xhr);
                      }
                  }
              
                  /**
                   * @param {Object} config
                   * @param {XHRPromise} [promise]
                   * @returns {XHRActions}
                   */
                  function XHR (config, promise) {
                      if (!config) {
                          throw new Error('Config object is required.');
                      } else if (!config.url) {
                          throw new Error('URL option is required.');
                      } else {
                          var xhr = this instanceof XHRWorker ? this : new XMLHttpRequest(),
                              result = promise ? promise.addToQueue(xhr) : new XHRPromise(xhr),
                              queryParams,
                              async = true,
                              dataForSend,
                              events = [
                                  'error',
                                  'timeout',
                                  'progress',
                                  'loadstart',
                                  'load',
                                  'abort',
                                  'readystatechange',
                                  {
                                      type: 'loadend',
                                      listener: loadEndListener
                                  }
                              ];
              
                          // setting HTTP method
                          config.method = typeof config.method === 'string' ? config.method : XHR.defaults.method;
              
                          // setting async
                          if (config.async !== undefined) {
                              async = !!config.async;
                          }
              
                          // applying attributes to instance of XMLHttpRequest
                          setAttributes(config.attributes, xhr);
              
                          // setting query params
                          queryParams = setQueryParams(config.params);
              
                          // setting data
                          dataForSend = setData(config.data);
              
                          if (xhr instanceof XHRWorker) {
                              xhr.addEventListener('event', function (eventName, data, xhr) {
                                  result.applyCallback(eventName, data, xhr);
                              });
                          } else {
                              // event listeners subscription
                              events = events.map(function (listenerData) {
                                  var type = listenerData instanceof Object ? listenerData.type : listenerData,
                                      listener = listenerData instanceof Object ? listenerData.listener : listenerData,
                                      _listener = createListener(listener, result, xhr);
                                  xhr.addEventListener(type, _listener);
                                  return {
                                      type: type,
                                      listener: _listener
                                  };
                              });
                          }
              
                          result.addEventListener('destroy', function destroyListener () {
                              result.removeEventListener('destroy', destroyListener);
                              events.forEach(function (eventData) {
                                  xhr.removeEventListener(eventData.type, eventData.listener);
                              });
                          });
              
                          // waits for opening
                          xhr.addEventListener('readystatechange', function openListener () {
                              if (xhr.readyState === XMLHttpRequest.OPENED) {
                                  xhr.removeEventListener('readystatechange', openListener);
                                  // setting default and user headers
                                  setHeaders(xhr, config.headers);
                                  // sending
                                  xhr.send(dataForSend);
                                  result.applyCallback('request', dataForSend, xhr);
                              }
                          });
              
                          setTimeout(function () {
                              if (!result.xhrCollection.aborted) {
                                  xhr.open(config.method, config.url + queryParams, async);
                              } else {
                                  result.applyCallback('abort', null, xhr);
                              }
                          }, 0);
              
                          return result.actions;
                      }
                  }
              
                  function guid () {
                      function s4() {
                          return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
                      }
                      return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
                  }
              
                  function inWorker (config, promise) {
                      if (!config) {
                          throw new Error('Config object is required.');
                      } else if (!config.url) {
                          throw new Error('URL option is required.');
                      } else {
                          var xhrWorker = new XHRWorker(guid(), config);
                          return XHR.call(xhrWorker, config, promise);
                      }
                  }
              
                  XHR.enableWorker = function () {
                      return new Promise(function (resolve, reject) {
                          if (!XHR.workerMode) {
                              if (XHR._worker) {
                                  resolve();
                              } else {
                                  var libSource = XHRlibContent.toString();
                                  libSource = '(' + libSource + '.call(this));\nthis.postMessage("XHR.active");\n';
              
                                  var scriptBlob = new Blob([libSource], {type: 'application/javascript'}),
                                      url = URL.createObjectURL(scriptBlob);
              
                                  Object.defineProperties(XHR, {
                                      _worker: {
                                          value: new Worker(url)
                                      },
                                      inWorker: {
                                          value: inWorker
                                      }
                                  });
              
                                  XHR._worker.addEventListener('message', function activateListener (event) {
                                      if (event.data === 'XHR.active') {
                                          XHR._worker.removeEventListener('message', activateListener);
                                          resolve();
                                      }
                                  });
                              }
                          } else {
                              reject(new Error('Worker can be enabled only in main thread.'));
                          }
                      });
                     
                  };
              
                  Object.defineProperty(XHR, 'defaults', {
                      value: {
                          method: 'GET',
                          headers: {},
                          attributes: {
                              responseType: '',
                              timeout: 0
                          }
                      },
                      configurable: false,
                      writable: false
                  });
              
                  Object.defineProperty(XHR, 'interceptors', {
                      value: {
                          response: null,
                          responseError: null,
                          request: null
                      },
                      configurable: true,
                      writable: true
                  });
              
                  return XHR;
              
              }(this)),

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
                data.options.url = new URL(data.options.url, location.origin);
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
