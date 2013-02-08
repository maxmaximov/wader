(function (ns) {
    "use strict";

    /**
     * @name wader.ADataProvider
     * @class Wader Abstract Data Provider
     * @abstract
     * @author sc0rp10 <dev@weblab.pro>
     * @version 0.3
     */
    $.Class.extend("wader.ADataProvider",

    /** @lends wader.ADataProvider */
    {
        errorHandlers: {
            "critical": [],
            "error": [],
            "notice": [],
            "login": []
        },

        /**
         * @param {String} level
         * @param {Function} callback
         * @return {undefined}
         */
        addErrorHandler: function (level, callback) {
            if (level in this.errorHandlers) {
                this.errorHandlers[level].push(callback);
            };
        },

        /**
         * @param {String} level
         * @param {*} data
         * @return {undefined}
         */
        handleError: function (level, data) {
            if (level in this.errorHandlers) {
                this.errorHandlers[level].forEach(function (cb) {
                    cb(data);
                });
            };
        }
    },

    /** @lends wader.ADataProvider# */
    {
        /*
        * @var resourse {String} общий ключ объектов, например, таблица в БД
        */
        resource: null,

        /**
         * @param {String} resource
         * @return {undefined}
         */
        init: function (resource) {
            this.resource = resource;
        },

        /**
         * @param {String} key
         * @return {$.Deferred}
         */
        get: function (key) {
            return this._makeRequest("get", key);
        },

        /**
         * @param {String} key
         * @param {String} value
         * @return {$.Deferred}
         */
        set: function (key, value) {
            return this._makeRequest("post", key, value);
        },

        /**
         * @param {String} key
         * @param {String} value
         * @return {$.Deferred}
         */
        update: function (key, value) {
            return this._makeRequest("put", key, value);
        },

        /**
         * @param {String} key
         * @return {$.Deferred}
         */
        remove: function (key) {
            return this._makeRequest("delete", key);
        },

        /**
         * @param {String} filter
         * @return {$.Deferred}
         */
        getMulti: function (filter) {
            return this._makeRequest("getMulti", filter);
        },

        /**
         * @abstract
         * @return {$.Deferred}
         */
        _makeRequest: function () {
            throw new Error(this.constructor.fullName + ": не реализован метод _makeRequest");
        }
    });

    if (ns !== wader) {
        ns.ADataProvider = wader.ADataProvider;
    }
})(window.WADER_NS || window);
