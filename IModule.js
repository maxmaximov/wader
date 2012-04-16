/**
 * Wader Module Interface
 *
 * @author Max Maximov <max.maximov@gmail.com>
 * @version 0.3
 */
(function(ns) {
    "use strict";

    $.Class.extend("wader.IModule", {
        init: function() {
            throw new Error(this.constructor.fullName + ": не реализован метод init");
        },
        run: function() {
            throw new Error(this.constructor.fullName + ": не реализован метод run");
        },
        destruct: function() {
            throw new Error(this.constructor.fullName + ": не реализован метод destruct");
        }
    });

    if (ns !== wader) ns.IModule = wader.IModule;
})(window.WADER_NS || window);
