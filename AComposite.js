/**
 * App Composite Abstract Class
 *
 * @author Max Maximov <max.maximov@gmail.com>
 * @version 0.2.2
 */
define("app/AComposite", ["app/Hub", "app/Logger", "app/IComposite"], function(Hub, Logger, IComposite) {
    "use strict";

    /*
    * @class app.AComposite
    * @abstract
    * @implements app.IComposite
    */
    IComposite.extend("app.AComposite",

    /* @Static */
    {
    },

    /* @Prototype */
    {
        _children: [],

        /*
        * @param {<Child>} child
        * @return undefined
        */
        add: function (child) {
            this._children.push(child);
        },

        /*
        * @param {<Child>} child
        * @return undefined
        */
        remove: function (child) {
            for (var i = 0, len = this._children.length; i < len; i++) {
                if (this._children[i] === child) {
                    this._children.splice(i, 1);
                    break;
                }
            }
        },

        /*
        * @param {number} i
        * @return <Child>
        */
        getChild: function (i) {
            return this._children[i];
        }
    });

    return app.AComposite;
});

