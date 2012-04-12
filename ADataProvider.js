/**
 * App DataProvider Abstract
 *
 * @author sc0rp10 <dev@weblab.pro>
 * @version 0.0.2
 */
define("app/ADataProvider", [], function () {
    "use strict";

    /*
    * @abstract app.ADataProvider
    */
    $.Class.extend("app.ADataProvider",

    /* @Static */
    {
    },

    /* @Prototype */
    {
        resource: null,
        baseUrl: null,
        init: function(resource, baseUrl, primaryKey) {
            this.primaryKey = primaryKey;
            this.resource = resource;
            this.baseUrl = baseUrl;
        },
        get: function (key) {
            var method = "get";
            if (!key) {
                throw new Error("Empty key");
            };
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

        delete: function () {
            var method = "delete";
            return this._makeRequest(method, object);
        },

        getMulti: function (filter) {
            var method = "get";
            return this._makeRequest(method, filter);
        },
        /* @Private */
        _buildQueryParams: function(data){
            var value,
                key,
                tmp = [],
                that = this,
                urlencode = function(str) {
                    str = (str+"").toString();
                    return encodeURIComponent(str).replace(/!/g, "%21").replace(/"/g, "%27").replace(/\(/g, "%28").replace(/\)/g, "%29").replace(/\*/g, "%2A").replace(/%20/g, "+");
                },
                arg_separator = "&",
                buildQueryHelper = function (key, val) {
                    var k, tmp = [];

                    if (val === true) {
                        val = "1";
                    } else if (val === false) {
                        val = "0";
                    }
                    if (val !== null && typeof(val) === "object") {
                        for (k in val) {
                            if (val[k] !== null) {
                                tmp.push(buildQueryHelper(key + "[" + k + "]", val[k]));
                            }
                        }
                        return tmp.join(arg_separator);
                    } else if (typeof(val) !== "function") {
                        return urlencode(key) + "=" + urlencode(val);
                    } else if (typeof(val) == "function") {
                        return "";
                    } else {
                        throw new Error("Incorrect Parameters");
                    }
                };
            if (!data) {
                return "";
            };
            if (typeof data == "string") {
                return data + "/";
            }
            for (key in data) {
                value = data[key];
                tmp.push(buildQueryHelper(key, value));
            }

            return "?" + tmp.join(arg_separator);
        },
        _makeRequest: function(){
            throw new Error(this.constructor.fullName + ": не реализован метод _makeRequest");
        }
    });

    return app.ADataProvider;
});

