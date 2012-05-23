(function(ns) {
	"use strict";

	/*
	* @abstract wader.AModel
	*/
	$.Class.extend("wader.AForm",
		{},
		{
			_modelClass: null,
			_model: {},
			_data:{},
			_selector: {},
			_errors: [],
			_callback: function() {
				throw new Error("not given");
			},
			init: function(params, success) {
				this._params = params;
				this.construct();
			},
			open: function() {
				this._bindEvents();
				this._loadDefaults();
				this._buildDOM();
			},
			close: function() {
				this._removeDOM();
				this._unbindEvents();
				this._model = {};
				this._data = {};
			},
			submit: function() {
				this._model = new this._modelClass(this._data);
				if (this._model.isValid()) {
					this.process();
				} else {
					this.showErrors();
				}
			},
			_loadDefaults: function() {
				throw new Error("not implemented yet");
			},
			_bindEvents: function() {
				throw new Error("not implemented yet");
			},
			_unbindEvents: function() {
				throw new Error("not implemented yet");
			},
			showErrors: function() {
				throw new Error("not implemented yet");
			},
			process: function() {
				$.when(this._model.save()).done(this._onProcess(), this._callback()).fail(this._onError());
			}
		}
	)
	if (ns !== wader) {
		ns.AForm = wader.AForm;
	}
})(window.WADER_NS || window);