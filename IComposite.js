/**
 * App Composite Interface
 *
 * @author Max Maximov <max.maximov@gmail.com>
 * @version 0.2.2
 */
define("app/IComposite", ["app/Hub", "app/Logger"], function (Hub, Logger) {
    "use strict";

    /*
    * @interface app.IComposite
    */
    $.Class.extend("app.IComposite",

    /* @Static */
    {
    },

    /* @Prototype */
    {
        init: function () {
            throw new Error(this.constructor.fullName + ": не реализован метод init");
        },

        add: function () {
            throw new Error(this.constructor.fullName + ": не реализован метод add");
        },

        remove: function () {
            throw new Error(this.constructor.fullName + ": не реализован метод remove");
        },

        getChild: function () {
            throw new Error(this.constructor.fullName + ": не реализован метод getChild");
        }
    });

    return app.IComposite;
});

