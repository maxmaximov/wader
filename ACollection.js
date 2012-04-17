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
    },

    /* @Prototype */
    {
        setup: function (dependencies) {
            this._dependencies = dependencies;

            this._prepared = false;
            this._items = [];
            this._promises = [];
            this._observers = [];
            this._promise;
            this._dp;
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

        getById: function (id) {
            for (var i in this._items) {
                if (this._items[i] && this._items[i].getId() == id) {
                    return this._items[i];
                }
            }
        },

        getAll: function () {
            var items = [];

            for (var i in this._items) {
                if (this._items[i] && !this._items[i].isDisabled() && this._items[i].getState() != wader.AModel.DELETED && this._items[i].getState() != wader.AModel.NULL) {
                    items.push(this._items[i]);
                }
            }

            return items;
        },

        getAllWithDisabled: function () {
            var items = [];

            for (var i in this._items) {
                if (this._items[i] && this._items[i].getState() != wader.AModel.DELETED && this._items[i].getState() != wader.AModel.NULL) {
                    items.push(this._items[i]);
                }
            }

            return items;
        },

        toJson: function () {
            var items = [];

            for (var i in this._items) {
                if (this._items[i] && this._items[i].getState() != wader.AModel.DELETED && this._items[i].getState() != wader.AModel.NULL) {
                    items[i] = this._items[i].toJson();
                }
            }

            return { "objects": items };
        },

        addObserver: function (callback) {
            this._observers.push(callback);
        },

        removeObserver: function (callback) {
            for (var i in this._observers) {
                if (this._observers[i] == callback) {
                    this._observers = this._observers.slice(i, 1);
                }
            }
        },

        _notifyObservers: function () {
            for (var i in this._observers) {
                this._observers[i]();
            }
        },

        add: function (item) {
            this._items.push(item);
        },

        remove: function (item) {
            for (var i in this._items) {
                if (this._items[i] && this._items[i] == item) {
                    this._items[i] = undefined;
                    return;
                }
            }
        }
    });

    if (ns !== wader) ns.ACollection = wader.ACollection;
})(window.WADER_NS || window);
