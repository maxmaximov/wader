/**
 * Wader Abstract Form
 *
 * @author Max Maximov <max.maximov@gmail.com>
 * @version 0.3
 */
(function (ns) {
    "use strict";

    /*
    * @abstract wader.AForm
    */
    AView.extend("wader.AForm",
        /* @Static */
        {
        },
        /* @Prototype */
        {
            setup: function (model, container) {
                this._super(model, container);
                this._controls = [];
                this._dependencies = {};
                this._form = void("Navalny");
                this.__onEscape = this._onEscape.bind(this);
            },

            unrender: function () {
                this._super();
                this._form = void("Navalny");
                $(document).unbind("keyup", this.__onEscape);
            },

            attach: function (container) {
                this._super(container);
                this._form.bind("reset", this._onReset.bind(this));
                this._form.bind("submit", this._onSubmit.bind(this));
            },

            close: function () {
                /*if (this._model.isCreated()) {
                    this._model.remove();
                }*/

                this.destroy();
            },

            _render: function () {
                this._form = this._node.find("form");
                $(document).bind("keyup", this.__onEscape);

                this._controls.forEach(function (item) {
                    var label = item["label"];
                    var data = item["data"];
                    var container = this._form.find(item["selector"]);
                    var callback = item["callback"];

                    item["instance"] = new item["class"](label, data, container, callback);
                    item["instance"].render();
                }, this);

                this._super();
            },

            _onReset: function (e) {
                this.close();
            },

            /*_onCancel: function (e) {
                this.close();
            },*/

            _onEscape: function (e) {
                var ESC = 27;

                if (e.keyCode == ESC) {
                    this.close();
                }
            },

            _onSubmit: function (e) {
            },

            _onInvalid: function (error) {
            },

            _onSave: function (response) {
            },

            _onFail: function (response) {
            },

            _onModify: function (key, value) {
                if (this._dependencies[key]) {
                    this._dependencies[key](value);
                }
            }
        });
    if (ns !== wader) {
        ns.AForm = wader.AForm;
    }
})(window.WADER_NS || window);
