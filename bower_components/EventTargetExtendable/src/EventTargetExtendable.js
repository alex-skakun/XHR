(function () {

    'use strict';

    var EVENT_LISTENERS = [];

    function findInAll (checker) {
        if (typeof checker === 'function') {
            var c = EVENT_LISTENERS;
            for (var i = 0, l = c.length; i < l; i++) {
                var item = c[i];
                if (checker(item)) {
                    return item;
                }
            }
            return null;
        } else {
            return null;
        }
    }

    function findListeners (target, type) {
        var allForThisTarget = findInAll(function (item) {
            return item.target === target;
        });
        if (allForThisTarget) {
            var allForThisType = allForThisTarget.listeners[type];
            if (!allForThisType) {
                allForThisTarget.listeners[type] = [];
                allForThisType = allForThisTarget.listeners[type];
            }
            return allForThisType;
        } else {
            var item = {
                target: target,
                listeners: {}
            };
            item.listeners[type] = [];
            var length = EVENT_LISTENERS.push(item);
            return EVENT_LISTENERS[length - 1].listeners[type];
        }
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
            var listeners = findListeners(this, eventType);
            if (Array.isArray(listeners)) {
                listeners.push(listener);
            }
            return true;
        }
        return false;
    };

    EventTargetExtendable.prototype.removeEventListener = function removeEventListener (eventType, listener) {
        var listeners = findListeners(this, eventType);
        if (Array.isArray(listeners)) {
            var index = listeners.indexOf(listener);
            if (index > -1) {
                listeners.splice(index, 1);
                return true;
            }
            return false;
        }
        return false;
    };

    EventTargetExtendable.prototype.dispatchEvent = function dispatchEvent (eventType) {
        var listeners = findListeners(this, eventType),
            _this = this,
            args = Array.prototype.slice.call(arguments, 1);
        if (Array.isArray(listeners)) {
            listeners.forEach(function (listener) {
                if (typeof listener === 'function') {
                    listener.apply(_this, args);
                }
            });
        }
    };

    EventTargetExtendable.prototype.removeAllListeners = function removeAllListeners () {
        var _this = this,
            listeners = findInAll(function (item) {
                return item.target === _this;
            });
        if (listeners) {
            var index = EVENT_LISTENERS.indexOf(listeners);
            if (index > -1) {
                var removed = EVENT_LISTENERS.splice(index, 1);
                return removed.length === 1;
            }
            return false;
        }
        return false;
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

    if (window) {
        window.EventTargetExtendable = EventTargetExtendable;
    }
    if (typeof define === 'function' && define.amd !== null) {
        define('EventTargetExtendable', [], function () {
            return EventTargetExtendable;
        });
    }

}());




