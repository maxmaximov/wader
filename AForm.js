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
            setup: function (model, container, options) {
                this._super(model, container, options);
                this._controls = [];
                this._form = void("Navalny");
                this._lastFocusedField = {};
                this._escaper = Escaper.getInstance();
            },

            unrender: function () {
                this._escaper.unsub(this.close);
                this._form = void("Navalny");
                this._super();
            },

            attach: function (container) {
                this._super(container);

                if (!this._form) return;

                this._form.off("reset").on("reset", this._onReset);
                this._form.off("submit").on("submit", this._onSubmit);

                this._form.find("input, textarea").on("focus", function(e) {
                    if (document.activeElement && document.activeElement.name) {
                        this._activeFieldName = document.activeElement.name;
                    }
                }.bind(this));
            },

            close: function () {
                if (this._model) {
                    if (this._model.isCreated()) {
                        this._model.remove();
                    } else {
                        this._model.reset();
                    }
                }

                this.destroy();
            },

            _render: function () {
                this._form = this._node.find("form");
                //this._form[0].waderForm = this;
                this._escaper.sub(this.close);

                this._controls.forEach(function (control) {
                    var label = control["label"];
                    var data = control["data"]();
                    var name = control["name"];
                    var container = this._form.find(control["selector"]);
                    var callback = control["callback"];

                    control["instance"] = new control["class"](label, data, container, callback, name);
                    control["instance"].render();
                }, this);

                this._super();
            },

            restore: function (container) {
                this._super(container);
                this._controls.forEach(function (control) {
                    control["instance"].restore();
                }.bind(this));

                setTimeout(function() {
                    if (this._form && this._form[0] && this._form[0][this._activeFieldName] && "focus" in this._form[0][this._activeFieldName]) {
                        $(this._form[0][this._activeFieldName]).focus();
                    }
                }.bind(this), 20);
            },

            _onReset: function (e) {
                this.close();
            },

            /*_onCancel: function (e) {
                this.close();
            },*/

            _onSubmit: function (e) {
            },

            _onInvalid: function (error) {
            },

            _onSave: function (response) {
            },

            _onFail: function (response) {
            },

            _onModify: function (key, value) {
                this._controls.forEach(function (control) {
                    if (~control["dependencies"].indexOf(key)) {
                        control["instance"].unrender();
                        control["instance"].setValue(control["data"]());
                        control["instance"].render();
                    }
                });
            }
        });
    if (ns !== wader) {
        ns.AForm = wader.AForm;
    }
})(window.WADER_NS || window);
