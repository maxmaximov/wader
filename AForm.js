(function (ns) {
    "use strict";

    /**
     * @name wader.AForm
     * @class Wader Abstract Form
     * @abstract
     * @augments wader.AView
     * @author Max Maximov <max.maximov@gmail.com>
     * @version 0.3
     */
    AView.extend("wader.AForm",

        /** @lends wader.AForm */
        {
        },

        /** @lends wader.AForm# */
        {
            /**
             * @param {wader.AModel} model
             * @param {jQuery} container
             * @param {Hash} options
             * @return {undefined}
             */
            setup: function (model, container, options) {
                this._super(model, container, options);
                this._controls = [];
                this._form = void("Navalny");
                this._lastFocusedField = {};
                this._escaper = Escaper.getInstance();
            },

            /**
             * @return {undefined}
             */
            unrender: function () {
                this._escaper.unsub(this.close);
                this._form = void("Navalny");
                this._super();
            },

            /**
             * @param {jQuery} container
             * @return {undefined}
             */
            attach: function (container) {
                this._super(container);

                if (!this._form) {
                    return;
                }

                this._form.off("reset").on("reset", this._onReset);
                this._form.off("submit").on("submit", this._onSubmit);

                this._form.find("input, textarea").on("focus", function(e) {
                    if (document.activeElement && document.activeElement.name) {
                        this._activeFieldName = document.activeElement.name;
                    }
                }.bind(this));
            },

            /**
             * @return {undefined}
             */
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

            /**
             * @return {undefined}
             */
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

            /**
             * @param {jQuery} container
             * @return {undefined}
             */
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

            /**
             * @return {undefined}
             */
            _onReset: function (e) {
                this.close();
            },

            /*_onCancel: function (e) {
                this.close();
            },*/

            /**
             * @abstract
             */
            _onSubmit: function (e) {
            },

            /**
             * @abstract
             */
            _onInvalid: function (error) {
            },

            _onSave: function (response) {
            },

            /**
             * @abstract
             */
            _onFail: function (response) {
            },

            /**
             * @param {String} key
             * @return {undefined}
             */
            _onModify: function (key) {
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
