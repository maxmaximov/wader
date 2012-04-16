(function(ns) {
    "use strict";

    /*
    * @class model.AModel
    * @implements app.IModel
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
            //Logger.warn(this.constructor.fullName, "setup()");

            this._id = this.constructor.generateId();

            this._state = null;
            this._collection = null;
            this._dependencies = [];
            this._dp = null;
            this._disabled = false;
        },

        create: function () {
            //Logger.warn(this.constructor.fullName, "create()");

            this.setState("null");
            this._collection.add(this);
        },

        add: function (data) {
            //Logger.warn(this.constructor.fullName, "add()");

            this.parse(data);
            this.setState("created");
            this._collection.refresh();
        },

        load: function (data) {
            //Logger.warn(this.constructor.fullName, "create()");

            this.parse(data);
            this.setState("exist");
        },

        edit: function (data) {
            //Logger.warn(this.constructor.fullName, "update()");

            this.parse(data);
            this.setState("updated");
            this._collection.refresh();
        },

        save: function () {
            //Logger.warn(this.constructor.fullName, "save()");

            var promise = new $.Deferred();

            if (this.getState() == "created") {
                $.when(this._dp.set(this.toJson())).done(this.proxy("_onSave", promise)).fail(this.proxy("_onSaveError", promise));
            } else {
                $.when(this._dp.update(this.toJson())).done(this.proxy("_onSave", promise)).fail(this.proxy("_onSaveError", promise));
            }

            return promise;
        },

        remove: function (silent) {
            //Logger.warn(this.constructor.fullName, "remove()");

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
            //Logger.warn(this.constructor.fullName, "_onSave()");

            this.setState("exist");

            promise.resolve(response);
        },

        _onRemove: function (promise, response) {
            //Logger.warn(this.constructor.fullName, "_onRemove()");

            this.setState("null");

            promise.resolve(response);
        },

        _onSaveError: function (promise, response) {
            //Logger.warn(this.constructor.fullName, "_onSaveError()");

            promise.reject(response);
        },

        _onRemoveError: function (promise, response) {
            //Logger.warn(this.constructor.fullName, "_onRemoveError()");

            promise.reject(response);
        },

        disable: function () {
            //Logger.warn(this.constructor.fullName, "disable()");

            this._disabled = true;
            this._collection.refresh();
        },

        enable: function () {
            //Logger.warn(this.constructor.fullName, "enable()");

            this._disabled = false;
            this._collection.refresh();
        },

        isDisabled: function () {
            //Logger.warn(this.constructor.fullName, "isDisabled()");

            return this._disabled;
        },

        getState: function () {
            //Logger.warn(this.constructor.fullName, "getState()", this._state);

            return this._state;
        },

        setState: function (state) {
            //Logger.warn(this.constructor.fullName, "setState()", state);

            this._state = state;
        },

        getId: function () {
            //Logger.warn(this.constructor.fullName, "getId()", this._state);

            return this._id;
        }
    });

    if (ns !== wader) ns.AModel = wader.AModel;
})(window.WADER_NS || window);
