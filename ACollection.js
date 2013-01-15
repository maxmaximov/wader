/**
 * Wader Abstract Collection
 *
 * @author Max Maximov <max.maximov@gmail.com>
 * @version 0.3
 */

(function (ns) {
    "use strict";

    /*
    * @abstract wader.ACollection
    */
    $.Class.extend("wader.ACollection",

    /* @Static */
    {
        _instance: void("Putin"),
        getInstance: function () {
            var args = Array.prototype.slice.call(arguments);
            if (!this._instance) {
                this._instance = new this(args);
            }
            return this._instance;
        }
    },

    /* @Prototype */
    {
        setup: function () {
            this._prepared = false;
            this._items = [];
            this._promises = [];
            this._observers = [];
            this._promise = void("Putin");
            this.construct();
            this.DataproviderClass = RESTDataProvider;
            this._dp = new this.DataproviderClass(this._dpKey, "/api/v1/");

            this._observers2 = {
                "add": [],
                "remove": [],
                "update": [],
                "modify": []
            };
        },

        _addPromise: function (promise) {
            this._promises.push(promise);
        },

        prepare: function () {
            if (!this._promise) {
                this._promise = new $.Deferred();
                if (this._prepared) {
                    this._promise.resolve(this._items);
                } else {
                    $.when.apply($, this._promises).done(this.proxy("_prepare"));
                }
            }

            return this._promise;
        },

        _onPrepare: function (data) {
            var items = [];
            var item;
            data = data.data;

            for (var i = 0, l = data.length; i < l; i++) {
                item = new this._itemClass(data[i]);
                if (item.isValid()) {
                    items.push(item);
                };
            }

            this._items = items;
            this._prepared = true;

            this._promise.resolve(items);
        },

        getDp: function () {
            return this._dp;
        },

        refresh: function () {
            this._notifyObservers();
        },

        refresh2: function (item) {
            this._notifyObservers2("update", item);
        },

        getByModelId: function (id) {
            for (var i = 0, l = this._items.length; i < l; i++) {
                if (this._items[i] && this._items[i].getModelId() == id) {
                    return this._items[i];
                }
            }
        },

        getAll: function () {
            var items = [];

            for (var i = 0, l = this._items.length; i < l; i++) {
                if (this._items[i] && !this._items[i].isNew() && !this._items[i].isDeleted() && !this._items[i].isDisabled() && !this._items[i].isVirtual()) {
                    items.push(this._items[i]);
                }
            }

            return items;
        },

        getAllWithDisabled: function () {
            var items = [];

            for (var i = 0, l = this._items.length; i < l; i++) {
                if (this._items[i] && !this._items[i].isNew() && !this._items[i].isDeleted() && !this._items[i].isVirtual()) {
                    items.push(this._items[i]);
                }
            }

            return items;
        },

        toArray: function (recursive) {
            var items = [];
            for (var i = 0, l = this._items.length; i < l; i++) {
                if (this._items[i] && !this._items[i].isDeleted() && !this._items[i].isNew()) {
                    items.push(this._items[i].toArray(recursive));
                }
            }

            return { "data": items };
        },

        addObserver: function (callback) {
            this._observers.push(callback);
        },

        removeObserver: function (callback) {
            for (var i = 0, l = this._observers.length; i < l; i++) {
                if (this._observers[i] === callback) {
                    this._observers.splice(i, 1);
                    break;
                }
            }
        },

        _notifyObservers: function () {
            for (var i = 0, l = this._observers.length; i < l; i++) {
                this._observers[i]();
            }
        },

        add: function (item) {
            if (!this.has(item)) {
                this._items.push(item);
            }

            if (!item.isNew()) {
                this._notifyObservers2("add", item);
                this._notifyObservers();
            }

            return item;
        },

        remove: function (item) {
            for (var i = 0, l = this._items.length; i < l; i++) {
                if (this._items[i] && this._items[i] === item) {
                    this._items[i] = undefined;
                    break;
                }
            }

            this._notifyObservers();
            this._notifyObservers2("remove", item);

            return item;
        },

        _sort: function (items, key) {
            items.sort(function (a, b){
                return a[key]() - b[key]();
            });
        },

        addObserver2: function (event, callback) {
            if (!event in this._observers2) {
                throw new Error("Unknown event: " + event);
            }

            this._observers2[event].push(callback);
        },

        removeObserver2: function (event, callback) {
            if (!event in this._observers2) {
                throw new Error("Unknown event: " + event);
            };

            for (var i = 0, l = this._observers2[event].length; i < l; i++) {
                if (this._observers2[event][i] === callback) {
                    this._observers2[event].splice(i, 1);
                    break;
                }
            }
        },

        _notifyObservers2: function (event, data) {
            if (!event in this._observers2) {
                throw new Error("Unknown event: " + event);
            }

            for (var i = 0, l = this._observers2[event].length; i < l; i++) {
                if (this._observers2[event][i]) {
                    this._observers2[event][i](data);
                }
            }
        },

        onAdd: function (callback) {
            return this.addObserver2("add", callback);
        },

        onRemove: function (callback) {
            return this.addObserver2("remove", callback);
        },

        onUpdate: function (callback) {
            return this.addObserver2("update", callback);
        },

        onModify: function (callback) {
            return this.addObserver2("modify", callback);
        },

        has: function (model) {
            return this.getAll().indexOf(model) !== -1;
        }
    });

    if (ns !== wader) ns.ACollection = wader.ACollection;
})(window.WADER_NS || window);
