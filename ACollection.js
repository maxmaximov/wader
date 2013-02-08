(function (ns) {
    "use strict";

    /**
     * @name wader.ACollection
     * @class Wader Abstract Collection
     * @abstract
     * @author Max Maximov <max.maximov@gmail.com>
     * @version 0.3
     */
    $.Class.extend("wader.ACollection",

    /** @lends wader.ACollection */
    {
        _instance: void("Putin"),

        /**
         * @return {wader.ACollection}
         */
        getInstance: function () {
            var args = Array.prototype.slice.call(arguments);
            if (!this._instance) {
                this._instance = new this(args);
            }

            return this._instance;
        }
    },

    /** @lends wader.ACollection# */
    {
        /**
         * @return {undefined}
         */
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

        /**
         * @param {$.Deferred} promise
         * @return {undefined}
         */
        _addPromise: function (promise) {
            this._promises.push(promise);
        },

        /**
         * @return {$.Deferred}
         */
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

        /**
         * @param {Hash} data
         * @return {undefined}
         */
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

        /**
         * @return {wader.ADataProvider}
         */
        getDp: function () {
            return this._dp;
        },

        /**
         * @return {undefined}
         */
        refresh: function () {
            this._notifyObservers();
        },

        /**
         * @param {wader.AModel} item
         * @return {undefined}
         */
        refresh2: function (item) {
            this._notifyObservers2("update", item);
        },

        /**
         * @param {Number} id
         * @return {wader.AModel}
         */
        getByModelId: function (id) {
            for (var i = 0, l = this._items.length; i < l; i++) {
                if (this._items[i] && this._items[i].getModelId() == id) {
                    return this._items[i];
                }
            }
        },

        /**
         * @return {wader.AModel[]}
         */
        getAll: function () {
            var items = [];

            for (var i = 0, l = this._items.length; i < l; i++) {
                if (this._items[i] && !this._items[i].isNew() && !this._items[i].isDeleted() && !this._items[i].isDisabled() && !this._items[i].isVirtual()) {
                    items.push(this._items[i]);
                }
            }

            return items;
        },

        /**
         * @return {wader.AModel[]}
         */
        getAllWithDisabled: function () {
            var items = [];

            for (var i = 0, l = this._items.length; i < l; i++) {
                if (this._items[i] && !this._items[i].isNew() && !this._items[i].isDeleted() && !this._items[i].isVirtual()) {
                    items.push(this._items[i]);
                }
            }

            return items;
        },

        /**
         * @param {Boolean} recursive
         * @return {Hash}
         */
        toArray: function (recursive) {
            var items = [];
            for (var i = 0, l = this._items.length; i < l; i++) {
                if (this._items[i] && !this._items[i].isDeleted() && !this._items[i].isNew()) {
                    items.push(this._items[i].toArray(recursive));
                }
            }

            return { "data": items };
        },

        /**
         * @param {Function} callback
         * @return {undefined}
         */
        addObserver: function (callback) {
            this._observers.push(callback);
        },

        /**
         * @param {Function} callback
         * @return {undefined}
         */
        removeObserver: function (callback) {
            for (var i = 0, l = this._observers.length; i < l; i++) {
                if (this._observers[i] === callback) {
                    this._observers.splice(i, 1);
                    break;
                }
            }
        },

        /**
         * @return {undefined}
         */
        _notifyObservers: function () {
            for (var i = 0, l = this._observers.length; i < l; i++) {
                this._observers[i]();
            }
        },

        /**
         * @param {wader.AModel} item
         * @return {wader.AModel}
         */
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

        /**
         * @param {wader.AModel} item
         * @return {wader.AModel}
         */
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

        /**
         * @param {wader.AModel[]} items
         * @param {String} key
         * @return {undefined}
         */
        _sort: function (items, key) {
            items.sort(function (a, b){
                return a[key]() - b[key]();
            });
        },

        /**
         * @param {String} event
         * @param {Function} callback
         * @return {undefined}
         * @throws {Error}
         */
        addObserver2: function (event, callback) {
            if (!event in this._observers2) {
                throw new Error("Unknown event: " + event);
            }

            this._observers2[event].push(callback);
        },

        /**
         * @param {String} event
         * @param {Function} callback
         * @return {undefined}
         * @throws {Error}
         */
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

        /**
         * @param {String} event
         * @param {wader.AModel} data
         * @return {undefined}
         * @throws {Error}
         */
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

        /**
         * @param {Function} callback
         * @return {undefined}
         */
        onAdd: function (callback) {
            return this.addObserver2("add", callback);
        },

        /**
         * @param {Function} callback
         * @return {undefined}
         */
        onRemove: function (callback) {
            return this.addObserver2("remove", callback);
        },

        /**
         * @param {Function} callback
         * @return {undefined}
         */
        onUpdate: function (callback) {
            return this.addObserver2("update", callback);
        },

        /**
         * @param {Function} callback
         * @return {undefined}
         */
        onModify: function (callback) {
            return this.addObserver2("modify", callback);
        },

        /**
         * @param {wader.AModel} model
         * @return {Boolean}
         */
        has: function (model) {
            return this.getAll().indexOf(model) !== -1;
        }
    });

    if (ns !== wader) ns.ACollection = wader.ACollection;
})(window.WADER_NS || window);
