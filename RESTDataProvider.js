define("app/RESTDataProvider", [], function() {
    "use strict";

    ADataProvider.extend("app.RESTDataProvider", {
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

    return app.RESTDataProvider;
});

