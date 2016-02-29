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
