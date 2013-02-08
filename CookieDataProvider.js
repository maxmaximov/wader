(function (ns) {
    "use strict";

    /**
     * @name wader.CookieDataProvider
     * @class Wader Cookie Data Provider
     * @augments wader.ADataProvider
     * @author sc0rp10 <dev@weblab.pro>
     * @version 0.3
     */
    ADataProvider.extend("wader.CookieDataProvider",

    /** @lends wader.CookieDataProvider# */
    {
        _ls: {
            /** @inner */
            setItem: function (k, v, props) {
                props = props || {};
                var exp = props.expires;
                if (typeof exp == "number" && exp) {
                    var d = new Date();
                    d.setTime(d.getTime() + exp*1000);
                    exp = props.expires = d;
                }
                if(exp && exp.toUTCString) {
                    props.expires = exp.toUTCString();
                }

                var updatedCookie = k + "=" + v;
                for(var propName in props) {
                    updatedCookie += "; " + propName;
                    var propValue = props[propName];
                    if(propValue !== true) {
                        updatedCookie += "=" + propValue;
                    }
                }
                document.cookie = updatedCookie;
            },

            /** @inner */
            getItem: function (k) {
                var matches = document.cookie.match(new RegExp(
                    "(?:^|; )" + k.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
                ))

                return matches ? matches[1] : null;
            },

            /** @inner */
            removeItem: function (k) {
                setCookie(k, null, {
                    expires: -1
                })
            }
        },

        /**
         * @param {String} method
         * @param {String} key
         * @param {String} value
         * @return {undefined}
         */
        _makeRequest: function (method, key, value) {
            var newKey = this.resource + "_" + key;
            switch (method) {
                case "get":
                    var result = this._ls.getItem(newKey);
                    try {
                        return JSON.parse(result);
                    } catch (e) {
                        return result;
                    }
                case "post":
                case "put":
                    return this._ls.setItem(newKey, JSON.stringify(value));
                case "delete":
                    return this._ls.removeItem(newKey);
                default:
                    break;
            }
        },

        /**
         * @param {String} pattern
         * @return {Hash[]}
         */
        getMulti: function (pattern) {
            if (!pattern instanceof RegExp) {
                throw new Error("Invalid params in LocalStorageDataProvider.getMulti: pattern must be instance of RegExp");
            };
            var items = [];
            for (var key in this._ls) {
                if (this._ls.hasOwnProperty(key)) {
                    if (pattern.test(key)) {
                        var obj = {};
                        key = key.replace(this.resource + "_", "")
                        obj[key] = this.get(key);
                        items.push(obj);
                    };
                };
            }
            return items;
        }
    });

    if (ns !== wader) {
        ns.CookieDataProvider = wader.CookieDataProvider;
    };
})(window.WADER_NS || window);
