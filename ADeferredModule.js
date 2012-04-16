/**
 * App Deferred Module Abstract Class
 *
 * @author Max Maximov <max.maximov@gmail.com>
 * @version 0.2.2
 */
(function(ns) {
    "use strict";

    wader.IModule.extend("wader.ADeferredModule", {
    });

    if (ns !== wader) ns.ADeferredModule = wader.ADeferredModule;
})(window.WADER_NS || window);
