(function (ns) {
    "use strict";

    /**
     * @name wader.ADeferredModule
     * @class Wader Abstract Deferred Module
     * @abstract
     * @implements wader.IModule
     * @author Max Maximov <max.maximov@gmail.com>
     * @version 0.3
     */
    wader.IModule.extend("wader.ADeferredModule",

    /** @lends wader.ADeferredModule */
    {
    });

    if (ns !== wader) ns.ADeferredModule = wader.ADeferredModule;
})(window.WADER_NS || window);
