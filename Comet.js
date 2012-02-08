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
        _instance: null,

        getInstance: function (url) {
            if (!app.Comet._instance) app.Comet._instance = new app.Comet(url);
            return app.Comet._instance;
        },

        send: function (channel, data) {
            if (!app.Comet._instance) throw new Error("app.Comet: класс должен быть инстанцирован");

            app.Comet.getInstance().send(channel, data);
        }
    },
    /* @prototype */
    {
        url: null,

        init: function (url) {
            this.url = url;

            var that = this;
            setTimeout(function () { // подавляем спиннер в Файрфоксе
                that._poll();
            }, 1000)
        },

        send: function (channel, data) {
            Logger.info(this, "sending to " + this.url, channel, data);

            $.ajax({
                url: this.url,
                timeout: 10000,
                async: true,
                cache: false,
                dataType: "jsonp",
                data: { "channel": channel, "data": data }
            });
        },

        _poll: function () {
            Logger.info(this, "polling to " + this.url);

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
            Logger.error(this, this.url, status, error);

            this._poll();
        },

        _onSuccess: function (data) {
            Logger.info(this, "got message", data.data, "to channel \"" + data.channel + "\"");

            Hub.pub(data.channel, data.data);

            this._poll();
        }
    });

    return app.Comet;
});

