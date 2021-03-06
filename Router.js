(function(ns) {
    "use strict";

    /**
     * Simple url routing system.
     * @name wader.Router
     * @class Wader Router
     * @author Andrew Tereshko <andrew.tereshko@gmail.com>
     * @version 0.3
     * @example
     *
     *  Wader.Route.add(/^sad\/?([0-9]+)?$/g, "regular");
     *  Wader.Route.add("sad/2", "happy");
     *
     *  var res = Wader.Route.match("sad/2");
     *
     *  res = [
     *      happy:[],
     *      regular: [0: 2]
     * ]
     */
    $.Class.extend("wader.Router", {

    /** @lends wader.Router */
        _rules: [],

        /**
         * @param {RegExp} rule
         * @param {String} name
         * @return {undefined}
         */
        add: function (rule, name) {
            this._rules.push(new this(rule, name));
        },

        /**
         * @param {String} path
         * @return {Hash}
         */
        match: function (path) {
            if (!path) {
                path = this.getCurrentPath();
            }

            var result = {}, rulesCount = this._rules.length;

            for (var i = 0; i < rulesCount; i++) {
                if (result[this._rules[i].name] === undefined) {
                    var params = this._rules[i].match(path);

                    if (params !== false) {
                        result[this._rules[i].name] = params;
                    }
                }
            }

            return result;
        },

        /**
         * @return {String}
         */
        getCurrentPath: function () {
            var path = window.History.getState().url.replace( /^https?:\/\/[^\/]+\//, '');

            path = path.replace(/\?([^#\?]+)?/g, '');

            path = path.replace(/(#|#!).*/, "/");

            // Remove slash duplicates
            path = path.replace(/\/+/, '/');

            return path;
        },

        /**
         * @return {String[]}
         */
        getParams: function () {
            var params = {}, hash;

            var hashes = this.getParamsString().split('&');

            var i = hashes.length;

            while (i--) {
                if (!hashes[i]) continue;

                hash = hashes[i].split('=');

                if (!hash[0]) continue;

                params[hash[0]] = hash[1] || '';
            }

            return params;
        },

        /**
         * @return {String}
         */
        getParamsString: function () {
            var paramsPos = window.History.getState().url.indexOf('?');

            if (paramsPos > 0 && paramsPos + 1 < window.History.getState().url.length) {
                return window.History.getState().url.slice(paramsPos + 1);
            }

            return '';
        },

        /**
         * @param {String[]} params
         * @return {String}
         */
        buildParamsString: function (params) {
            var paramsString = '';

            for (variable in params) {
                paramsString = paramsString + (paramsString.length ? '&' : '') + variable + '=' + params[variable];

            }

            return paramsString;
        }
    },

    /** @lends wader.Router# */
    {
        name: null,
        rule: null,

        /**
         * @param {RegExp} rule
         * @param {String} name
         * @return {undefined}
         */
        init: function (rule, name) {
            this.name = name;

            this.rule = rule;
        },

        /**
         * @param {String} path
         * @return {String[]}
         */
        match: function (path) {
            var params = false, matches, key;

            if (this.rule instanceof RegExp) {
                matches = this.rule.exec(path);

                if (matches) {
                    params = [];

                    for (key = 1; key <= matches.length; key++) {
                        params.push(matches[key]);
                    }
                }
            } else if (path == this.rule) {
                params = [];
            }

            return params;
        }
    });

    if (ns !== wader) ns.Router = wader.Router;
})(window.WADER_NS || window);
