(function(ns) {
    "use strict";
    ADataProvider.extend("wader.LocalStorageDataProvider", {
        _ls: window.localStorage,
        _makeRequest: function(method, extraParams) {
            switch (method) {
                case "get":
                    var result = this._ls.getItem(extraParams);
                    try {
                        return JSON.parse(result);
                    } catch (e) {
                        return result;
                    }
                case "post":
                    if (!extraParams) {
                        throw new Error("empty post");
                    };
                    var pk = extraParams[this._primaryKey];
                    delete extraParams[this._primaryKey];
                    return this._ls.setItem(extraParams[this._primaryKey], JSON.stringify(extraParams));
                case "put":
                    if (!extraParams) {
                        throw new Error("empty put");
                    };
                    if (!extraParams[this.primaryKey]) {
                        throw new Error("empty primary key");
                    };
                    delete extraParams[this._primaryKey];
                    return this._ls.setItem(extraParams[this._primaryKey], JSON.stringify(extraParams));
                    break;
                case "delete":
                    return this._ls.removeItem(extraParams["primaryKey"]);
                    break;
                default:
                    break;
            }
        },
        getMulti: function(){
            throw new Error("for \"LocalStorageDataProvider\" not defined MultiGet operation")
        }
    });

    if (ns !== wader) {
        ns.LocalStorageDataProvider = wader.LocalStorageDataProvider;
    };
})(window.WADER_NS || window);
