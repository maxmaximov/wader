(function (ns) {
    "use strict";

    /**
     * @name wader.AView
     * @class Wader Abstract View
     * @abstract
     * @author Max Maximov <max.maximov@gmail.com>
     * @version 0.3
     */
    $.Class.extend("wader.AView",

        /** @lends wader.AView */
        {
        },

        /** @lends wader.AView# */
        {
            /**
             * @param {wader.AModel} model
             * @param {jQuery} container
             * @param {Hash} [options]
             * @return {undefined}
             */
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

            /**
             * @param {*} event
             * @param {Function} callback
             * @return {undefined}
             */
            _addObserver: function (event, callback) {
                if (!event in this._observers) {
                    throw new Error("Unknown event: " + event);
                }

                this._observers[event].push(callback);
            },

            /**
             * @param {*} event
             * @param {Function} callback
             * @return {undefined}
             */
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

            /**
             * @param {*} event
             * @return {undefined}
             */
            _notifyObservers: function (event) {
                var args = Array.prototype.slice.call(arguments, 1);

                if (!event in this._observers) {
                    throw new Error("Unknown event: " + event);
                }

                for (var i = 0, l = this._observers[event].length; i < l; i++) {
                    this._observers[event][i].apply(this, args);
                }
            },

            /**
             * @param {Function} callback
             * @return {undefined}
             */
            onDestroy: function (callback) {
                return this._addObserver("destroy", callback);
            },

            /**
             * @param {Function} callback
             * @return {undefined}
             */
            onDrag: function (callback) {
                return this._addObserver("drag", callback);
            },

            /**
             * @return {undefined}
             */
            _onDelete: function () {
                this.destroy();
            },

            /**
             * @return {undefined}
             */
            _onModify: function () {
                this.unrender();
                this.render();
            },

            /**
             * @return {undefined}
             */
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

            /**
             * @return {undefined}
             */
            detach: function () {
                if (this._node) {
                    this._node.remove();
                }
            },

            /**
             * @return {undefined}
             */
            unrender: function () {
                this.detach();
                this._node = void("Navalny");
            },

            /**
             * @param {jQuery} container
             * @return {undefined}
             */
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

            /**
             * @param {jQuery} container
             * @return {undefined}
             */
            render: function (container) {
                if (container) {
                    this._container = container;
                }
            },

            /**
             * @return {undefined}
             */
            _render: function () {
                this._node[0].waderView = this; // задел на когда-нибудь потом
                this.attach();
            },

            /**
             * @param {jQuery} container
             * @return {undefined}
             */
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
