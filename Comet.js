/**
 * App Comet module
 *
 * @author Max Maximov <max.maximov@gmail.com>
 * @version 0.2.1
 */
define("app/Comet", ["app/Hub", "app/Logger"], function(Hub, Logger) {
    "use strict";

    $.Class.extend("app.Comet",
    /* @static */
    {
    },
    /* @prototype */
    {
        url: null,

        init: function (url) {
            this.url = url;
            this._poll();
        },

        _poll: function () {
            Logger.log(this, "polling to " + this.url);

            $.ajax({
                url: this.url,
                success: this.proxy("_onSuccess"),
                error: this.proxy("_onError"),
                timeout: 10000,
                async: true,
                cache: false,
                dataType: "jsonp"
            });
        },

        _onError: function (jqXHR, status, error) {
            Logger.error(this, status, error);

            this._poll();
        },

        _onSuccess: function (data) {
            Logger.log(this, "got message", data.data, "to channel \"" + data.channel + "\"");

            Hub.pub(data.channel, data.data);

            this._poll();
        }
    });

    return app.Comet;
});

