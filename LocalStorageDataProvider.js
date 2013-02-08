(function (ns) {
    "use strict";

    /**
     * @name wader.LocalStorageDataProvider
     * @class Wader LocalStorage Data Provider
     * @augments wader.ADataProvider
     * @author sc0rp10 <dev@weblab.pro>
     * @version 0.3
     */
    ADataProvider.extend("wader.LocalStorageDataProvider",

    /** @lends wader.LocalStorageDataProvider# */
    {
        _ls: window.localStorage,

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
        ns.LocalStorageDataProvider = wader.LocalStorageDataProvider;
    };
})(window.WADER_NS || window);
