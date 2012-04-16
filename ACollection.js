(function(ns) {
    "use strict";

    /*
    * @class model.ACollection
    * @implements app.IModel
    */
    $.Class.extend("wader.ACollection",

    /* @Static */
    {
    },

    /* @Prototype */
    {
        setup: function () {
            //Logger.warn(this.constructor.fullName, "setup()", arguments);

            this._prepared = false;
            this._items = [];
            this._promises = [];
            this._observers = [];
            this._models = null;
            this._promise = null;
            this._dp = null;
        },

        _addPromise: function (promise) {
            //Logger.warn(this.constructor.fullName, "_addPromise()", arguments);

            this._promises.push(promise);
        },

        // TODO: переименовать в prepare()
        get: function () {
            //Logger.warn(this.constructor.fullName, "get()", arguments);

            if (!this._promise) {
                this._promise = new $.Deferred();
                if (this._prepared) {
                    this._promise.resolve(this._items);
                } else {
                    $.when.apply($, this._promises).done(this.proxy("_get"));
                }
            }

            return this._promise;
        },

        _getDp: function () {
            //Logger.warn(this.constructor.fullName, "_getDp()", arguments);

            return this._dp;
        },

        refresh: function () {
            //Logger.warn(this.constructor.fullName, "refresh()", arguments);

            this._notifyObservers();
        },

        getById: function (id) {
            //Logger.warn(this.constructor.fullName, "getById()", arguments);

            for (var i in this._items) {
                if (this._items[i] && this._items[i].getId() == id) {
                    return this._items[i];
                }
            }
        },

        getAll: function () {
            //Logger.warn(this.constructor.fullName, "getAll()", arguments);

            var items = [];

            for (var i in this._items) {
                if (this._items[i] && !this._items[i].isDisabled() && this._items[i].getState() != "deleted" && this._items[i].getState() != "null") {
                    items.push(this._items[i]);
                }
            }

            return items;
        },

        getAllWithDisabled: function () {
            //Logger.warn(this.constructor.fullName, "getAllWithDisabled()", arguments);

            var items = [];

            for (var i in this._items) {
                if (this._items[i] && this._items[i].getState() != "deleted" && this._items[i].getState() != "null") {
                    items.push(this._items[i]);
                }
            }

            return items;
        },

        toJson: function () {
            //Logger.warn(this.constructor.fullName, "toJson()", arguments);

            var items = [];

            for (var i in this._items) {
                if (this._items[i] && this._items[i].getState() != "deleted" && this._items[i].getState() != "null") {
                    items[i] = this._items[i].toJson();
                }
            }

            return { "objects": items };
        },

        addObserver: function (callback) {
            //Logger.warn(this.constructor.fullName, "addObserver()", arguments);

            this._observers.push(callback);
        },

        removeObserver: function (callback) {
            //Logger.warn(this.constructor.fullName, "removeObserver()", arguments);

            for (var i in this._observers) {
                if (this._observers[i] == callback) {
                    this._observers = this._observers.slice(i, 1);
                }
            }
        },

        _notifyObservers: function () {
            //Logger.warn(this.constructor.fullName, "_notifyObservers()", arguments);

            for (var i in this._observers) {
                this._observers[i]();
            }
        },

        add: function (item) {
            //Logger.warn(this.constructor.fullName, "add()", arguments);

            this._items.push(item);
        },

        remove: function (item) {
            //Logger.warn(this.constructor.fullName, "remove()", arguments);

            for (var i in this._items) {
                if (this._items[i] && this._items[i] == item) {
                    this._items[i] = null;
                    return;
                }
            }
        }
    });

    if (ns !== wader) ns.ACollection = wader.ACollection;
})(window.WADER_NS || window);
