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
            listeners.forEach(function (listener) {
                if (typeof listener === 'function') {
                    listener.apply(_this, args);
                }
            });
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
    /* @include EventCollection.js */,
    /* @include EventCollectionItem.js */
));
