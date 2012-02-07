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
                complete: this.proxy("_onClose"),
                timeout: 2000,
                async: true,
                cache: false
            });
        },

        _onClose: function (jqXHR, status) {
            var response;

            if (jqXHR.readyState == 4 && jqXHR.status == 200) {
                response = $.parseJSON(jqXHR.responseText);

                Logger.log(this, "got message", response.data, "to channel \"" + response.channel + "\"");

                Hub.pub(response.channel, response.data);
            } else {
                Logger.log(this, status);
            }

            this._poll();
        }
    });

    return app.Comet;
});

