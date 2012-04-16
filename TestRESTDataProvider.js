(function(ns) {
    "use strict";

    ADataProvider.extend("wader.TestRESTDataProvider", {
        _handleResult: function(url, data, method) {
            return {
                url: url,
                data: data,
                type: method
            };
        }
    });

    if (ns !== wader) ns.TestRESTDataProvider = wader.TestRESTDataProvider;
})(window.WADER_NS || window);
