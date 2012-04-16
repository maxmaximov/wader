/**
 * Wader Abstract Model
 *
 * @author Max Maximov <max.maximov@gmail.com>
 * @version 0.3
 */
(function(ns) {
    "use strict";

    /*
    * @abstract wader.AModel
    */
    $.Class.extend("wader.AModel",

    /* @Static */
    {
        generateId: function () {
            if (!wader.AModel.count) wader.AModel.count = 0;
            return wader.AModel.count++;
        }
    },

    /* @Prototype */
    {
        setup: function () {
            this._id = this.constructor.generateId();

            this._state = null;
            this._collection = null;
            this._dependencies = [];
            this._dp = null;
            this._disabled = false;
        },

        create: function () {
            this.setState("null");
            this._collection.add(this);
        },

        add: function (data) {
            this.parse(data);
            this.setState("created");
            this._collection.refresh();
        },

        load: function (data) {
            this.parse(data);
            this.setState("exist");
        },

        edit: function (data) {
            this.parse(data);
            this.setState("updated");
            this._collection.refresh();
        },

        save: function () {
            var promise = new $.Deferred();

            if (this.getState() == "created") {
                $.when(this._dp.set(this.toJson())).done(this.proxy("_onSave", promise)).fail(this.proxy("_onSaveError", promise));
            } else {
                $.when(this._dp.update(this.toJson())).done(this.proxy("_onSave", promise)).fail(this.proxy("_onSaveError", promise));
            }

            return promise;
        },

        remove: function (silent) {
            this.setState("deleted");
            this._collection.remove(this);
            if (!silent) this._collection.refresh();

            var promise = new $.Deferred();

            if (silent) {
                this._onRemove(promise);
            } else {
                $.when(this._dp.delete(this.toJson())).done(this.proxy("_onRemove", promise)).fail(this.proxy("_onRemoveError", promise));
            }

            return promise;
        },

        _onSave: function (promise, response) {
            this.setState("exist");

            promise.resolve(response);
        },

        _onRemove: function (promise, response) {
            this.setState("null");

            promise.resolve(response);
        },

        _onSaveError: function (promise, response) {
            promise.reject(response);
        },

        _onRemoveError: function (promise, response) {
            promise.reject(response);
        },

        disable: function () {
            this._disabled = true;
            this._collection.refresh();
        },

        enable: function () {
            this._disabled = false;
            this._collection.refresh();
        },

        isDisabled: function () {
            return this._disabled;
        },

        getState: function () {
            return this._state;
        },

        setState: function (state) {
            this._state = state;
        },

        getId: function () {
            return this._id;
        }
    });

    if (ns !== wader) ns.AModel = wader.AModel;
})(window.WADER_NS || window);