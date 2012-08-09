/**
 * Wader Abstract View
 *
 * @author Max Maximov <max.maximov@gmail.com>
 * @version 0.3
 */
(function(ns) {
    "use strict";

    /*
    * @abstract wader.AView
    */
    $.Class.extend("wader.AView",
        /* @Static */
        {
        },
        /* @Prototype */
        {
            setup: function (model, container) {
                this._model = model;
                this._container = container;

                this._models = App.getInstance().models;

                this._node = void("Navalny");

                this._observers = {};
                this._observers["destroy"] = [];
                this._observers["drag"] = [];

                this._settingsProvider = App.getInstance().settingsProvider;

                this.__onDelete = this._onDelete.bind(this);
                this.__onModify = this._onModify.bind(this);
                //this.__onUpdate = this._onUpdate.bind(this);

                this._model.onDelete(this.__onDelete);
                this._model.onModify(this.__onModify);
                //this._model.onUpdate(this.__onUpdate);
            },

            _addObserver: function(event, callback) {
                if (!event in this._observers) {
                    throw new Error("Unknown event: " + event);
                }

                this._observers[event].push(callback);
            },

            _removeObserver: function(event, callback) {
                if (!event in this._observers) {
                    throw new Error("Unknown event: " + event);
                };

                for (var i = 0, l = this._observers[event].length; i < l; i++) {
                    if (this._observers[event][i] === callback) {
                        this._observers[event].splice(i, 1);
                        break;
                    }
                }
            },

            _notifyObservers: function(event) {
                if (!event in this._observers) {
                    throw new Error("Unknown event: " + event);
                }

                for (var i = 0, l = this._observers[event].length; i < l; i++) {
                    this._observers[event][i]();
                }
            },

            onDestroy: function(callback) {
                return this._addObserver("destroy", callback);
            },

            onDrag: function(callback) {
                return this._addObserver("drag", callback);
            },

            _onDelete: function() {
                this.destroy();
            },

            _onModify: function() {
                this.unrender();
                this.render();
            },

            destroy: function() {
                if (this._model) {
                    //this._model._removeObserver(3, this.__onUpdate);
                    this._model._removeObserver(4, this.__onDelete);
                    this._model._removeObserver(5, this.__onModify);
                }

                this.unrender();

                this._model = void("Navalny");
                this._container = void("Navalny");

                this._notifyObservers("destroy");
            },

            detach: function() {
                if (this._node) {
                    this._node.remove();
                    this._node = void("Navalny");
                }
            },

            unrender: function() {
                this.detach();
            },

            attach: function() {
            },

            render: function() {
            },

            _render: function() {
            }
        });
    if (ns !== wader) {
        ns.AView = wader.AView;
    }
})(window.WADER_NS || window);
