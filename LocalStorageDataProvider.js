(function(ns) {
	"use strict";
	ADataProvider.extend("wader.LocalStorageDataProvider", {
		_ls: window.localStorage,
		_makeRequest: function(method, key, value) {
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
		getMulti: function(pattern){
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