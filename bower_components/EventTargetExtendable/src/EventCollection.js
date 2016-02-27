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

}())