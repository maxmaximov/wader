/**
 * App Comet module
 *
 * @author Max Maximov <max.maximov@gmail.com>
 * @version 0.2.2
 */
(function(ns) {
    "use strict";

    $.Class.extend("wader.Comet",
    /* @static */
    {
        _instance: null,

        getInstance: function (url) {
            if (!wader.Comet._instance) wader.Comet._instance = new wader.Comet(url);
            return wader.Comet._instance;
        },

        send: function (channel, data) {
            if (!wader.Comet._instance) throw new Error("wader.Comet: класс должен быть инстанцирован");

            wader.Comet.getInstance().send(channel, data);
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

    if (ns !== wader) ns.Comet = wader.Comet;
})(window.WADER_NS || window);
