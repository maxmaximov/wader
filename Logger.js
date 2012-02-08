/**
 * App Logger module
 *
 * @author Max Maximov <max.maximov@gmail.com>
 * @version 0.2.1
 */
define("app/Logger", ["app/Hub"], function (Hub) {
    "use strict";

    $.Class.extend("app.Logger",
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
            var args = app.Logger._parseArgs(args);

            /*@cc_on app.Logger.ie = true; @*/

            if (app.Logger.debug && window.console && window.console[type]) {
                if (app.Logger.ie) {
                    console[type](args.join(" "));
                } else {
                    console[type].apply(console, args);
                }
            }
        },

        log: function () {
            if (app.Logger.level >= app.Logger.LOG) app.Logger._echo(arguments, "log");
        },

        debug: function () {
            if (app.Logger.level >= app.Logger.DEBUG) app.Logger._echo(arguments, "debug");
        },

        info: function () {
            if (app.Logger.level >= app.Logger.INFO) app.Logger._echo(arguments, "info");
        },

        warn: function () {
            if (app.Logger.level >= app.Logger.WARN) app.Logger._echo(arguments, "warn");
        },

        error: function () {
            if (app.Logger.level >= app.Logger.ERROR) app.Logger._echo(arguments, "error");
        }
    },
    /* @prototype */
    {
    });

    return app.Logger;
});

