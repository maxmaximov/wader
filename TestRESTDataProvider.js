define("app/TestRESTDataProvider", [], function() {
    "use strict";

    ADataProvider.extend("app.TestRESTDataProvider", {
        _handleResult: function(url, data, method) {
            return {
                url: url,
                data: data,
                type: method
            };
        }
    });

    return app.TestRESTDataProvider;
});

