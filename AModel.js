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
        NULL: 0,
        CREATED: 1,
        EXIST: 2,
        UPDATED: 3,
        DELETED: 4,

        generateId: function () {
            if (!wader.AModel.count) wader.AModel.count = 0;
            return wader.AModel.count++;
        }
    },

    /* @Prototype */
    {
        setup: function (collection, dependencies) {
            this._id = this.constructor.generateId();

            this._collection = collection;
            this._dependencies = dependencies;

            this._disabled = false;

            this.setState(wader.AModel.NULL);

            this._dp;
            if (this._collection) {
                this._dp = this._collection._getDp();
                this._collection.add(this);
            }
        },

        add: function (data) {
            if (this.getState() !== wader.AModel.NULL) {
                throw new Error(this, "Model are already added");
            }

            var invalid = this._validate(data);
            if (invalid) {
                return invalid;
            } else {
                this.parse(data);
                this.setState(wader.AModel.CREATED);

                this._collection.refresh();
            }
        },

        load: function (data) {
            if (this.getState() === wader.AModel.CREATED) {
                throw new Error("Model are CREATED");
            }

            var invalid = this._validate(data);
            if (invalid) {
                return invalid;
            } else {
                this.parse(data);
                this.setState(wader.AModel.EXIST);
            }
        },

        edit: function (data) {
            if (this.getState() === wader.AModel.NULL) {
                throw new Error("Model are NULL");
            } else if (this.getState() === wader.AModel.DELETED) {
                throw new Error("Model are DELETED");
            }

            var invalid = this._validate(data);
            if (invalid) {
                return invalid;
            } else {
                this.parse(data);
                if (this.getState() === wader.AModel.EXIST) {
                    this.setState(wader.AModel.UPDATED);
                }

                this._collection.refresh();
            }
        },

        remove: function (silent) {
            if (this.getState() === wader.AModel.NULL) {
                throw new Error("Model are NULL");
            } else if (this.getState() === wader.AModel.DELETED) {
                throw new Error("Model are already DELETED");
            }

            if (this.getState() === wader.AModel.CREATED) {
                this.setState(wader.AModel.NULL);
            } else {
                this.setState(wader.AModel.DELETED);
            }

            this._collection.remove(this);
            if (!silent) this._collection.refresh();
        },

        save: function () {
            if (this.getState() === wader.AModel.NULL) {
                throw new Error("Model are NULL");
            } else if (this.getState() === wader.AModel.EXIST) {
                throw new Error("Model are EXIST");
            }

            var promise = new $.Deferred();

            if (this.getState() === wader.AModel.CREATED) {
                $.when(this._dp.set(this.toJson())).done(this.proxy("_onSave", promise)).fail(this.proxy("_onSaveError", promise));
            } else if (this.getState() === wader.AModel.DELETED) {
                $.when(this._dp.delete(this.toJson())).done(this.proxy("_onSave", promise)).fail(this.proxy("_onSaveError", promise));
            } else {
                $.when(this._dp.update(this.toJson())).done(this.proxy("_onSave", promise)).fail(this.proxy("_onSaveError", promise));
            }

            return promise;
        },

        _onSave: function (promise, response) {
            if (this.getState() === wader.AModel.DELETED) {
                this.setState(wader.AModel.NULL);
            } else {
                this.setState(wader.AModel.EXIST);
            }

            promise.resolve(response);
        },

        _onSaveError: function (promise, response) {
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
        },

        _validate: function () {
        }
    });

    if (ns !== wader) ns.AModel = wader.AModel;
})(window.WADER_NS || window);
