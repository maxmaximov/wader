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
        resource: null,
        baseUrl: null,
        primaryKey: null,
        init: function(resource, primaryKey, baseUrl) {
            this.primaryKey = primaryKey;
            this.resource = resource;
            this.baseUrl = baseUrl;
        },
        get: function (key) {
            var method = "get";
            return this._makeRequest(method, key);
        },

        set: function (data) {
            var method = "post";
            return this._makeRequest(method, value);
        },

        update: function () {
            var method = "put";
            return this._makeRequest(method, object);
        },

        remove: function () {
            var method = "delete";
            return this._makeRequest(method, object);
        },

        getMulti: function (filter) {
            var method = "get";
            return this._makeRequest(method, filter);
        },
        _makeRequest: function(){
            throw new Error(this.constructor.fullName + ": не реализован метод _makeRequest");
        }
    });

    if (ns !== wader) ns.ADataProvider = wader.ADataProvider;
})(window.WADER_NS || window);
