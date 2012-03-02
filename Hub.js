/**
 * App PubSub Hub module
 *
 * @author Max Maximov <max.maximov@gmail.com>
 * @version 0.2.2
 */
define("app/Hub", ["app/Logger"], function (Logger) {
    "use strict";

    $.Class.extend("app.Hub",
    /* @static */
    {
        _domNode: $("<i/>"),

        pub: function (channel, data) {
            data = data || {};

            Logger.info("Publish to channel \"" + channel + "\"", data);
            //Logger.info(this, "publish to channel \"" + channel + "\"", data);

            this._domNode.trigger.apply(this._domNode, arguments);
        },

        sub: function (channel, callback) {
            Logger.info("Subscribed to channel \"" + channel + "\"");
            //Logger.info(this, "subscribed to channel \"" + channel + "\"");

            function wrapper() {
                return callback.apply(this, Array.prototype.slice.call(arguments, 1));
            }

            wrapper.guid = callback.guid = callback.guid || ($.guid ? $.guid++ : $.event.guid++);

            this._domNode.bind(channel + ".app", wrapper);
        },

        unsub: function (channel, callback) {
            Logger.info("Unsubscribed from channel \"" + channel + "\"");
            //Logger.info(this, "unsubscribed from channel \"" + channel + "\"");

            this._domNode.unbind(channel + ".app", callback);
        }
    },
    /* @prototype */
    {
    });

    return app.Hub;
});

