(function(ns) {
	"use strict";

	ADataProvider.extend("wader.RESTDataProvider", {
		/* @Private */
		init: function(resource, baseUrl) {
			this.resource = resource;
			this.baseUrl = baseUrl;
		},
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
		_makeRequest: function(method, key, value) {
			var url = this.baseUrl + this.resource + "/",
				data = {};

			switch (method) {
				case "get":
					if (key) {
						url += key;
					};
					return this._handleResult(url, method);
				case "post":
					delete value["disabled"];
					delete value["_created_at"];
					delete value["model_id"];
					return this._handleResult(url, method, JSON.stringify(value));
				case "put":
					url += key;
					delete value["disabled"];
					delete value["_created_at"];
					delete value["model_id"];
					delete value["uid"];
					return this._handleResult(url, method, JSON.stringify(value));
				case "delete":
					url += key;
					return this._handleResult(url, method);
				case "getMulti":
					url += this._buildQueryParams(key);
					return this._handleResult(url, "get");
			}
		},
		_handleResult: function(url, method, data) {
			return $.ajax({
				url: url,
				data: data,
				type: method,
				dataType: "json",
				contentType: "application/json; charset=utf-8"
			});
		}
	});

	if (ns !== wader) {
		ns.RESTDataProvider = wader.RESTDataProvider;
	}
})(window.WADER_NS || window);