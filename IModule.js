(function (ns) {
    "use strict";

    /**
     * @name wader.IModule
     * @interface Wader Module Interface
     * @author Max Maximov <max.maximov@gmail.com>
     * @version 0.3
     */
    $.Class.extend("wader.IModule",

    /** @lends wader.IModule */
    {
        /**
         * @abstract
         */
        init: function () {
            throw new Error(this.constructor.fullName + ": не реализован метод init");
        },

        /**
         * @abstract
         */
        run: function () {
            throw new Error(this.constructor.fullName + ": не реализован метод run");
        },

        /**
         * @abstract
         */
        destruct: function () {
            throw new Error(this.constructor.fullName + ": не реализован метод destruct");
        }
    });

    if (ns !== wader) ns.IModule = wader.IModule;
})(window.WADER_NS || window);
