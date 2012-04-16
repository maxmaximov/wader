/**
 * Wader Logger module
 *
 * @author Max Maximov <max.maximov@gmail.com>
 * @version 0.3
 */
(function(ns) {
    "use strict";

    $.Class.extend("wader.Logger",
    /* @static */
    {
        NONE: 0,
        ERROR: 1,
        WARN: 2,
        INFO: 3,
        DEBUG: 4,
        LOG: 5,

        level: 1,
        ie: false,

        _parseArgs: function () {
            var args = Array.prototype.slice.call(arguments[0]);

            // Тут бы, по-хорошему, интерфейс нужен, вместо typeof args[0] == "object"
            return ([typeof args[0] == "object" ? "[" + args[0].constructor.fullName + "]" : args[0]].concat(args.slice(1)));
        },

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

        log: function () {
            if (wader.Logger.level >= wader.Logger.LOG) wader.Logger._echo(arguments, "log");
        },

        debug: function () {
            if (wader.Logger.level >= wader.Logger.DEBUG) wader.Logger._echo(arguments, "debug");
        },

        info: function () {
            if (wader.Logger.level >= wader.Logger.INFO) wader.Logger._echo(arguments, "info");
        },

        warn: function () {
            if (wader.Logger.level >= wader.Logger.WARN) wader.Logger._echo(arguments, "warn");
        },

        error: function () {
            if (wader.Logger.level >= wader.Logger.ERROR) wader.Logger._echo(arguments, "error");
        }
    },
    /* @prototype */
    {
    });

    if (ns !== wader) ns.Logger = wader.Logger;
})(window.WADER_NS || window);
