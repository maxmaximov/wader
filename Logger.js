/**
 * App Logger module
 *
 * @author Max Maximov <max.maximov@gmail.com>
 * @version 0.2
 */
define("app/Logger", ["app/Hub"], function (Hub) {
    "use strict";

    $.Class.extend("app.Logger",
    /* @static */
    {
        debug: false,

        _parseArgs: function () {
            var args = _.toArray(arguments[0]);

            // Тут бы, по-хорошему, интерфейс нужен, вместо typeof args[0] == "object"
            return ([typeof args[0] == "object" ? "[" + args[0].constructor.fullName + "]" : args[0]].concat(args.slice(1)));
        },

        log: function () {
            var args = app.Logger._parseArgs(arguments);

            if (this.debug && window.console && window.console.log) {
                if (ie) {
                    console.log(args.join(" "));
                } else {
                    console.log.apply(console, args);
                }
            }
        },

        warn: function () {
            this.log(arguments);
        },

        error: function () {
            this.log(arguments);
        },

        notice: function () {
            this.log(arguments);
        }
    },
    /* @prototype */
    {
    });

    return app.Logger;
});

