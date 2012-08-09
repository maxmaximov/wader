/**
 * Wader Abstract View
 *
 * @author Max Maximov <max.maximov@gmail.com>
 * @version 0.3
 */
(function(ns) {
    "use strict";

    /*
    * @abstract wader.AView
    */
    $.Class.extend("wader.AView",
        /* @Static */
        {
        },
        /* @Prototype */
        {
            setup: function () {
            }
        });
    if (ns !== wader) {
        ns.AView = wader.AView;
    }
})(window.WADER_NS || window);
