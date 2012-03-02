/**
 * App Deferred Module Abstract Class
 *
 * @author Max Maximov <max.maximov@gmail.com>
 * @version 0.2.2
 */
define("app/ADeferredModule", ["app/Hub", "app/Logger", "app/IModule"], function(Hub, Logger, IModule) {
    "use strict";

    IModule.extend("app.ADeferredModule", {
    });

    return app.ADeferredModule;
});

