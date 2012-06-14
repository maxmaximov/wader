/**
 * Wader Abstract Collection
 *
 * @author Max Maximov <max.maximov@gmail.com>
 * @version 0.3
 */
(function(ns) {
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

        _getDp: function () {
            return this._dp;
        },

        refresh: function () {
            this._notifyObservers();
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
                if (this._items[i] && !this._items[i].isDeleted() && !this._items[i].isDisabled()) {
                    items.push(this._items[i]);
                }
            }

            return items;
        },

        getAllWithDisabled: function () {
            var items = [];

            for (var i = 0, l = this._items.length; i < l; i++) {
                if (this._items[i] && this._items[i].getState() !== wader.AModel.DELETED && this._items[i].getState() !== wader.AModel.NULL) {
                    items.push(this._items[i]);
                }
            }

            return items;
        },

        toArray: function () {
            var items = [];
            for (var i = 0, l = this._items.length; i < l; i++) {
                if (this._items[i] && !this._items[i].isDeleted() && !this._items[i].isNew()) {
                    items[i] = this._items[i].toArray();
                }
            }

            return { "objects": items };
        },

        addObserver: function (callback) {
            this._observers.push(callback);
        },

        removeObserver: function (callback) {
            for (var i = 0, l = this._observers.length; i < l; i++) {
                if (this._observers[i] === callback) {
                    this._observers = this._observers.slice(i, 1);
                }
            }
        },

        _notifyObservers: function () {
            for (var i = 0, l = this._observers.length; i < l; i++) {
                this._observers[i]();
            }
        },

        add: function (item) {
            this._items.push(item);
            this._notifyObservers();
        },

        remove: function (item) {
            for (var i = 0, l = this._items.length; i < l; i++) {
                if (this._items[i] && this._items[i] === item) {
                    this._items[i] = undefined;
                    break;
                }
            }

            this._notifyObservers();
        },

        _sort: function (items, key) {
            items.sort(function(a, b){
                return a[key]() - b[key]();
            });
        }
    });

    if (ns !== wader) ns.ACollection = wader.ACollection;
})(window.WADER_NS || window);
