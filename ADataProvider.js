/**
 * Wader Abstract DataProvider
 *
 * @author sc0rp10 <dev@weblab.pro>
 * @version 0.3
 */
(function(ns) {
	"use strict";

	/*
	* @abstract wader.ADataProvider
	*/
	$.Class.extend("wader.ADataProvider",

	/* @Static */
	{
	},

	/* @Prototype */
	{
		/*
		* @var resourse {String} общий ключ объектов, например, таблица в БД
		*/
		resource: null,
		init: function(resource) {
			this.resource = resource;
		},
		get: function (key) {
			return this._makeRequest("get", key);
		},

		set: function (key, value) {
			return this._makeRequest("post", key, value);
		},

		update: function (key, value) {
			return this._makeRequest("put", key, value);
		},

		remove: function (key) {
			return this._makeRequest("delete", key);
		},

		getMulti: function (filter) {
			return this._makeRequest("getMulti", filter);
		},
		_makeRequest: function(){
			throw new Error(this.constructor.fullName + ": не реализован метод _makeRequest");
		}
	});

	if (ns !== wader) {
		ns.ADataProvider = wader.ADataProvider;
	}
})(window.WADER_NS || window);
