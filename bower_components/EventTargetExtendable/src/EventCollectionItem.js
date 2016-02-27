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