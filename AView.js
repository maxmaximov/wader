/**
 * Wader Abstract View
 *
 * @author Max Maximov <max.maximov@gmail.com>
 * @version 0.3
 */
(function (ns) {
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
            setup: function (model, container, options) {
                this._model = model;
                this._container = container;
                this._options = $.extend(this._options, options);

                this._models = App.getInstance().models;

                this._node = void("Navalny");

                this._observers = {};
                this._observers["destroy"] = [];
                this._observers["drag"] = [];

                this._settingsProvider = App.getInstance().settingsProvider;

                this._model.onDelete(this._onDelete);
                this._model.onModify(this._onModify);
                //this._model.onUpdate(this._onUpdate);
            },

            _addObserver: function (event, callback) {
                if (!event in this._observers) {
                    throw new Error("Unknown event: " + event);
                }

                this._observers[event].push(callback);
            },

            _removeObserver: function (event, callback) {
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

            _notifyObservers: function (event) {
                var args = Array.prototype.slice.call(arguments, 1);

                if (!event in this._observers) {
                    throw new Error("Unknown event: " + event);
                }

                for (var i = 0, l = this._observers[event].length; i < l; i++) {
                    this._observers[event][i].apply(this, args);
                }
            },

            onDestroy: function (callback) {
                return this._addObserver("destroy", callback);
            },

            onDrag: function (callback) {
                return this._addObserver("drag", callback);
            },

            _onDelete: function () {
                this.destroy();
            },

            _onModify: function () {
                this.unrender();
                this.render();
            },

            destroy: function () {
                if (this._model) {
                    //this._model._removeObserver(3, this._onUpdate);
                    this._model._removeObserver(4, this._onDelete);
                    this._model._removeObserver(5, this._onModify);
                }

                this.unrender();

                this._model = void("Navalny");
                this._container = void("Navalny");

                this._notifyObservers("destroy");
            },

            detach: function () {
                if (this._node) {
                    this._node.remove();
                }
            },

            unrender: function () {
                this.detach();
                this._node = void("Navalny");
            },

            attach: function (container) {
                if (container) {
                    this._container = container;
                }

                if (this._container) {
                    this._container.append(this._node);
                } else {
                    Logger.warn("Absentee container");
                }
            },

            render: function (container) {
                if (container) {
                    this._container = container;
                }
            },

            _render: function () {
                this._node[0].waderView = this; // задел на когда-нибудь потом
                this.attach();
            },

            restore: function (container) {
                if (container) {
                    this._container = container;
                }
                this.attach();
            }
        });
    if (ns !== wader) {
        ns.AView = wader.AView;
    }
})(window.WADER_NS || window);
