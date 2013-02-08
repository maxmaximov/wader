(function (ns) {
    "use strict";

    /**
     * @name wader.Logger
     * @class Wader Logger
     * @author Max Maximov <max.maximov@gmail.com>
     * @version 0.3
     */
    $.Class.extend("wader.Logger",

    /** @lends wader.Logger */
    {
        NONE: 0,
        ERROR: 1,
        WARN: 2,
        INFO: 3,
        DEBUG: 4,
        LOG: 5,

        level: 1,
        ie: false,

        /**
         * @return {*[]}
         */
        _parseArgs: function () {
            var args = Array.prototype.slice.call(arguments[0]);

            // Тут бы, по-хорошему, интерфейс нужен, вместо typeof args[0] == "object"
            return ([typeof args[0] == "object" ? "[" + args[0].constructor.fullName + "]" : args[0]].concat(args.slice(1)));
        },

        /**
         * @param {Arguments} args
         * @param {String} type
         * @return {undefined}
         */
        _echo: function (args, type) {
            var args = wader.Logger._parseArgs(args);

            /*@cc_on wader.Logger.ie = true; @*/

            if (wader.Logger.debug && window.console && window.console[type]) {
                if (wader.Logger.ie) {
                    console[type](args.join(" "));
                } else {
                    console[type].apply(console, args);
                }
            }
        },

        /**
         * @return {undefined}
         */
        log: function () {
            if (wader.Logger.level >= wader.Logger.LOG) wader.Logger._echo(arguments, "log");
        },

        /**
         * @return {undefined}
         */
        debug: function () {
            if (wader.Logger.level >= wader.Logger.DEBUG) wader.Logger._echo(arguments, "debug");
        },

        /**
         * @return {undefined}
         */
        info: function () {
            if (wader.Logger.level >= wader.Logger.INFO) wader.Logger._echo(arguments, "info");
        },

        /**
         * @return {undefined}
         */
        warn: function () {
            if (wader.Logger.level >= wader.Logger.WARN) wader.Logger._echo(arguments, "warn");
        },

        /**
         * @return {undefined}
         */
        error: function () {
            if (wader.Logger.level >= wader.Logger.ERROR) wader.Logger._echo(arguments, "error");
        }
    },

    /** @lends wader.Logger# */
    {
    });

    if (ns !== wader) ns.Logger = wader.Logger;
})(window.WADER_NS || window);
