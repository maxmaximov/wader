/**
 * Wader Abstract Form Control
 *
 * @author Max Maximov <max.maximov@gmail.com>
 * @version 0.3
 */
(function (ns) {
    "use strict";

    /*
    * @abstract wader.AFormControl
    */
    $.Class.extend("wader.AFormControl",
        /* @Static */
        {
        },
        /* @Prototype */
        {
            setup: function (label, data, container, callback) {
                this._label = label;
                this._data = data;
                this._container = container;
                this._callback = callback;

                this._models = App.getInstance().models;

                this._node = void("Navalny");

                this._settingsProvider = App.getInstance().settingsProvider;
            },

            destroy: function () {
                this.unrender();

                this._data = void("Navalny");
                this._container = void("Navalny");
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
                if (container) this._container = container;
                this._container.append(this._node);
            },

            render: function (container) {
                if (container) this._container = container;
                this._render();
            },

            _render: function () {
                this.attach();
            },

            restore: function (container) {
                if (container) this._container = container;
                this.attach();
            },

            setValue: function (data) {
                this._data = data;
                return this;
            },

            getValue: function () {
            },

            callback: function () {
                this._callback(this.getValue());
            }
        });
    if (ns !== wader) {
        ns.AFormControl = wader.AFormControl;
    }
})(window.WADER_NS || window);
