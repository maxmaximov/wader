/**
 * Wader Abstract Deferred Module
 *
 * @author Max Maximov <max.maximov@gmail.com>
 * @version 0.3
 */
(function(ns) {
    "use strict";

    /*
    * @abstract wader.AModel
    */
    wader.IModule.extend("wader.ADeferredModule", {
    });

    if (ns !== wader) ns.ADeferredModule = wader.ADeferredModule;
})(window.WADER_NS || window);
