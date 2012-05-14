(function(ns) {
    "use strict";
	ADataProvider.extend("wader.LocalStorageDataProvider", {
		_ls: (function(){
			return window.localStorage,
		})(),
		_makeRequest: function(method, key, value) {
			switch (method) {
				case "get":
					var result = this._ls.getItem(key);
					try {
						return JSON.parse(result);
					} catch (e) {
						return result;
					}
				case "post":
				case "put":
					return this._ls.setItem(key, JSON.stringify(value));
				case "delete":
					return this._ls.removeItem(key);
				default:
					break;
			}
		},
		getMulti: function(){
			throw new Error("\"LocalStorageDataProvider\" not implement MultiGet operation");
		}
	});

	if (ns !== wader) {
		ns.LocalStorageDataProvider = wader.LocalStorageDataProvider;
	};
})(window.WADER_NS || window);
