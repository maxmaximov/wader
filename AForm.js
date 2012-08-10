/**
 * Wader Abstract Form
 *
 * @author Max Maximov <max.maximov@gmail.com>
 * @version 0.3
 */
(function(ns) {
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
                this._super();
                this.__onEscape = this.proxy("_onEscape");
            },

            unrender: function() {
                this._super();
                $(document).unbind("keyup", this.__onEscape);
            },

            _onCancel: function(e) {
                this.destroy();
            },

            _onEscape: function(e) {
                var ESC = 27;

                if (e.keyCode == ESC) {
                    this._onCancel();
                }
            },

            _onSubmit: function(e) {
            },

            _onInvalid: function(error) {
            },

            _onSave: function(response) {
            },

            _onFail: function(response) {
            }
        });
    if (ns !== wader) {
        ns.AForm = wader.AForm;
    }
})(window.WADER_NS || window);
