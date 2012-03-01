/**
 * App Model Interface
 *
 * @author Max Maximov <max.maximov@gmail.com>
 * @version 0.2.1
 */
define("app/IModel", ["app/Hub", "app/Logger"], function(Hub, Logger) {
    "use strict";

    $.Class.extend("app.IModel", {
        init: function() {
            throw new Error(this.constructor.fullName + ": не реализован метод init");
        }
    });

    return app.IModel;
});

