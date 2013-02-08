(function (ns) {
    "use strict";

    /**
     * @name wader.Hub
     * @class Wader PubSub Hub
     * @author Max Maximov <max.maximov@gmail.com>
     * @version 0.3
     */
    $.Class.extend("wader.Hub",

    /** @lends wader.Hub */
    {
        _domNode: $("<i/>"),

        /**
         * @param {String} channel
         * @param {*} data
         * @return {undefined}
         */
        pub: function (channel, data) {
            data = data || {};

            Logger.info("Publish to channel \"" + channel + "\"", data);
            //Logger.info(this, "publish to channel \"" + channel + "\"", data);

            this._domNode.trigger.apply(this._domNode, arguments);
        },

        /**
         * @param {String} channel
         * @param {Function} callback
         * @return {undefined}
         */
        sub: function (channel, callback) {
            Logger.info("Subscribed to channel \"" + channel + "\"");
            //Logger.info(this, "subscribed to channel \"" + channel + "\"");

            function wrapper() {
                return callback.apply(this, Array.prototype.slice.call(arguments, 1));
            }

            wrapper.guid = callback.guid = callback.guid || ($.guid ? $.guid++ : $.event.guid++);

            this._domNode.bind(channel + ".wader", wrapper);
        },

        /**
         * @param {String} channel
         * @param {Function} callback
         * @return {undefined}
         */
        unsub: function (channel, callback) {
            Logger.info("Unsubscribed from channel \"" + channel + "\"");
            //Logger.info(this, "unsubscribed from channel \"" + channel + "\"");

            this._domNode.unbind(channel + ".wader", callback);
        }
    },

    /** @lends wader.Hub# */
    {
    });

    if (ns !== wader) ns.Hub = wader.Hub;
})(window.WADER_NS || window);
