(function(ns) {
    "use strict";

    ADataProvider.extend("wader.RESTDataProvider", {
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
        _makeRequest: function(method, extraParams) {
            var url = this.baseUrl + this.resource + "/",
                data = {};
            if (method == "get") {
                url += this._buildQueryParams(extraParams);
            } else {
                if (method == "post") {
                    if (!extraParams) {
                        throw new Error("empty post");
                    };
                    delete extraParams[this.primaryKey];
                    data = JSON.stringify(extraParams);
                } else if (method == "put") {
                    if (!extraParams) {
                        throw new Error("empty put");
                    };
                    if (!extraParams[this.primaryKey]) {
                        throw new Error("empty primary key");
                    };
                    url += extraParams[this.primaryKey] + "/";
                    delete extraParams[this.primaryKey];
                    data = JSON.stringify(extraParams);
                } else if (method == "delete") {
                    if (!extraParams) {
                        throw new Error("empty delete");
                    };
                    if (!extraParams[this.primaryKey]) {
                        throw new Error("empty primary key");
                    };
                    url += extraParams[this.primaryKey] + "/";
                }
                if (typeof extraParams == "string") {
                    url += extraParams + "/";
                }
            }
            return this._handleResult(url, data, method);
        },
        _handleResult: function(url, data, method) {
            return $.ajax({
                url: url,
                data: data,
                type: method,
                dataType: "json",
                contentType: "application/json; charset=utf-8"
            });
        }
    });

    if (ns !== wader) ns.RESTDataProvider = wader.RESTDataProvider;
})(window.WADER_NS || window);
