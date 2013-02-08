(function (ns) {
    "use strict";

    /**
     * @name wader.RESTDataProvider
     * @class Wader REST Data Provider
     * @augments wader.ADataProvider
     * @author sc0rp10 <dev@weblab.pro>
     * @version 0.3
     */
    ADataProvider.extend("wader.RESTDataProvider",

    /** @lends wader.RESTDataProvider */
    {
    },

    /** @lends wader.RESTDataProvider# */
    {
        init: function (resource, baseUrl) {
            this.resource = resource;
            this.baseUrl = baseUrl;
        },

        /**
         * @param {String|Hash} data
         * @return {String}
         */
        _buildQueryParams: function (data) {
            var value,
                key,
                tmp = [],
                that = this,
                urlencode = function (str) {
                    str = (str + "").toString();
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
            }
            if (typeof data == "string") {
                return data + "/";
            }
            data["email"] = CURRENT_USER.email;
            for (key in data) {
                value = data[key];
                tmp.push(buildQueryHelper(key, value));
            }

            return "?" + tmp.join(arg_separator);
        },

        /**
         * @param {String} method
         * @param {String} key
         * @param {String} value
         * @return {jqXHR}
         */
        _makeRequest: function (method, key, value) {
            var url = this.baseUrl + this.resource + "/",
                data = {},
                value = value || {};

            switch (method) {
                case "get":
                    if (key) {
                        url += key + "/"
                    };
                    url += "?email=" + escape(CURRENT_USER.email);

                    return this._handleResult(url, method);
                case "post":
                    if (key) {
                        url += key + "/";
                    }
                    delete value["disabled"];
                    delete value["_created_at"];
                    delete value["model_id"];
                    return this._handleResult(url, method, JSON.stringify(value));
                case "put":
                    url += key + "/";
                    delete value["disabled"];
                    delete value["_created_at"];
                    delete value["model_id"];
                    delete value["uid"];
                    return this._handleResult(url, method, JSON.stringify(value));
                case "delete":
                    url += key + "/";
                    return this._handleResult(url, method, JSON.stringify(value));
                case "getMulti":
                    if (key && Object.keys(key),length) {
                        key["email"] = CURRENT_USER.email;
                    };
                    url += this._buildQueryParams(key);
                    return this._handleResult(url, "get");
            }
        },

        /**
         * @param {jqXHR} xhr
         * @param {String} status
         * @param {String} error
         * @return {undefined}
         */
        _handleError: function (xhr, status, error) {
            switch (xhr.status) {
                case 12029:
                case 0:
                    ADataProvider.handleError("error", "Произошла ошибка при соединении с сервером, проверьте соединение с сетью и ");
                    RUN_PING = true;
                    break;
                case 401:
                    ADataProvider.handleError("login");
                    break;
                case 400:
                    ADataProvider.handleError("error", "Произошла ошибка при соединении с сервером — ведутся временные технические работы. Пожалуйста, ");
                    break;
                case 502:
                    ADataProvider.handleError("critical", "Произошла ошибка при соединении с сервером — ведутся временные технические работы.");
                case 500:
                    ADataProvider.handleError("critical", "Произошла ошибка при соединении с сервером — ведутся временные технические работы.");
                    break;
            }
        },

        /**
         * @param {String} url
         * @param {String} status
         * @param {Hash} data
         * @return {jqXHR}
         */
        _handleResult: function (url, method, data) {
            if (method != "get") {
                url += "?api_key=" + SECRET + "&email=" + escape(CURRENT_USER.email);
            }

            var request = {
                url: url,
                timeout: 30000,
                data: data,
                type: method,
                /** @inner */
                success: function (response) {
                    if (response && "email" in response) {
                        var currentEmail = CURRENT_USER.email;
                        var newEmail = response.email;
                        if (currentEmail && newEmail != currentEmail) {
                            window.location.reload();
                        }
                    }
                },
                dataType: "json",
                error: this.proxy("_handleError"),
                contentType: "application/json; charset=utf-8"
            };

            return $.ajax(request);
        }
    });

    if (ns !== wader) {
        ns.RESTDataProvider = wader.RESTDataProvider;
    }
})(window.WADER_NS || window);
