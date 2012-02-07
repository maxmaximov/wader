/**
 * App PubSub Hub module
 *
 * @author Max Maximov <max.maximov@gmail.com>
 * @version 0.2.1
 */
define("app/Hub", ["app/Logger"], function (Logger) {
    "use strict";

    $.Class.extend("app.Hub",
    /* @static */
    {
        _domNode: $("<i/>"),

        pub: function (channel, data) {
            data = data || {};

            Logger.log("Publish to channel \"" + channel + "\"", data);

            this._domNode.trigger.apply(this._domNode, arguments);
        },

        sub: function (channel, callback) {
            Logger.log("Subscribed to channel \"" + channel + "\"");

            function wrapper() {
                return callback.apply(this, Array.prototype.slice.call(arguments, 1));
            }

            wrapper.guid = callback.guid = callback.guid || ($.guid ? $.guid++ : $.event.guid++);

            this._domNode.bind(channel + ".app", wrapper);
        },

        unsub: function (channel, callback) {
            Logger.log("Unsubscribed from channel \"" + channel + "\"");

            this._domNode.unbind(channel + ".app", callback);
        }
    },
    /* @prototype */
    {
    });

    return app.Hub;
});

