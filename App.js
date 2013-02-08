(function (ns) {
    "use strict";

    /**
     * @namespace Неймспейс
     * @name wader
     */

    /**
     * Contains various helper methods, store and handle "Controller" modules.
     * @name wader.App
     * @class Base application class
     * @author Andrew Tereshko <andrew.tereshko@gmail.com>
     * @author Max Maximov <max.maximov@gmail.com>
     * @version 0.3
     */
    $.Class.extend("wader.App",

    /** @lends wader.App */
    {
        _instance: null,
        _timestamp: null,
        _timeout: 1000,

        _interval: null,
        _intervalDelay: 10,
        _killInterval: 3000,

        _selectors: [],
        _questions: [],
        _answers: {},

        /**
         * @return {wader.App}
         */
        getInstance: function () {
            if (!wader.App._instance) {
                wader.App._instance = new wader.App();
                wader.App._timestamp = new Date();
            }

            return wader.App._instance;
        },

        /**
         * @param {String|jQuery} selector
         * @param {Function} callback
         * @return {jQuery.Deferred}
         */
        when: function (selector, callback) {
            if (!wader.App._instance) throw new Error("[wader.App] класс должен быть инстанцирован");

            if (arguments.length = 1) {
                if (arguments[0] instanceof Function) {
                    callback = arguments[0];
                    selector = undefined;
                } else if (arguments[0] instanceof String) {
                    callback = arguments[0];
                    selector = undefined;
                }
            }

            if (!(selector || callback)) throw new Error("[wader.App] аргументы неок");

            var deferred = new $.Deferred();

            wader.App._selectors.push({
                "selector": selector,
                "callback": callback,
                "deferred": deferred
            });

            wader.App._check();

            return deferred;
        },

        /**
         * @param {String} question
         * @param {Function} callback
         * @return {jQuery.Deferred}
         */
        ask: function (question, callback) {
            if (!wader.App._instance) throw new Error("[wader.App] класс должен быть инстанцирован");

            Logger.info("Ask the question \"" + question + "\"");

            var deferred = new $.Deferred();

            wader.App._questions.push({
                "question": question,
                "callback": callback,
                "deferred": deferred
            });

            wader.App._check();

            return deferred;
        },

        /**
         * @param {String} question
         * @param {*} data
         * @return {undefined}
         */
        answer: function (question, data) {
            if (!wader.App._instance) throw new Error("[wader.App] класс должен быть инстанцирован");

            Logger.info("Answer the question \"" + question + "\"", data);
            wader.App._answers[question] = data;

            wader.App._check();
        },

        /**
         * @return {undefined}
         */
        _check: function () {
            var timestamp = new Date();

            if (!wader.App._interval) {
                wader.App._interval = setInterval(wader.App._check, wader.App._intervalDelay);
            }


            var selectors = wader.App._selectors;

            if (wader.App._instance._ready) {
                for (var i = 0; i < selectors.length; i++) {
                    var callback = selectors[i]["callback"];
                    var selector = selectors[i]["selector"];
                    var deferred = selectors[i]["deferred"];

                    if (selector) {
                        var element = $(selector);

                        if (element.length > 0) {
                            selectors.splice(i, 1);
                            if (callback !== undefined) callback.apply(element);
                            if (deferred !== undefined) deferred.resolve(element);
                        }
                    } else {
                        selectors.splice(i, 1);
                        if (callback !== undefined) callback();
                    }
                }
            }


            var questions = wader.App._questions;
            var answers = wader.App._answers;

            for (var i = 0; i < questions.length; i++) {
                var question = questions[i]["question"];
                var callback = questions[i]["callback"];
                var deferred = questions[i]["deferred"];
                var answer = answers[question];

                if (answer !== undefined) {
                    questions.splice(i, 1);
                    if (callback !== undefined) callback(answer);
                    if (deferred !== undefined) deferred.resolve(answer);
                }
            }

            if (wader.App._interval && selectors.length < 1) {
                clearInterval(wader.App._interval);
                wader.App._interval = null;
            }

            if (wader.App._interval && timestamp - wader.App._timestamp > wader.App._timeout) {
                //Logger.warn("[wader.App] timeout (" + wader.App._timeout + " ms) expired.", { "ready": wader.App._instance._ready, "modules": wader.App._instance._modules, "modules to ready": wader.App._instance._modulesToReady, "selectors": wader.App._selectors, "questions": wader.App._questions });
            }
        }
    },

    /** @lends wader.App# */
    {
        options: {
            routes: {}
        },

        _modules: {},

        _modulesToReady: {},

        _ready: false,

        init: function (options) {
            $.extend(this.options, options || {});

            Logger.log(this, "init");

            var history = window.History, url = history.getState().url;

/*            if (window.location.toString().search(/#/) && !history.isTraditionalAnchor(history.getHash())) {
                if (history.getHash().search(/^\//)) {
                    window.location = history.getHash();
                } else {
                    window.location = history.getBasePageUrl() + history.getHash();
                }
            } else {
                // App run on every hash change
                $(window).bind("statechange.wader", this.proxy("run"));
            }*/

            $(window).bind("statechange.wader", this.proxy("run"));

            Hub.sub("wader/module/ready", this.proxy("_onReadyModule"));
        },

        /**
         * @param {Object[]} routes
         * @return {undefined}
         */
        setRoute: function (routes) {
            // Binding route rules to modules
            $.each(routes, function (moduleName, routes) {
                $.each(routes, function (i, routeRule) {
                    Router.add(routeRule, moduleName);
                });
            });
        },

        /**
         * @return {undefined}
         */
        run: function () {
            Logger.log(this, "run");

            this._unready();

            var matches = Router.match(), self = this;

            // 404 behavior
            if($.isEmptyObject(matches)) {
                Logger.log(this, "request unresolved (" + Router.getCurrentPath() + ")");

                this.cleanup();
            }

            // Check whitch modules must be destroyed
            for (var className in this._modules) {
                if (undefined === matches[className]) this._unregisterModule(className);
            }

            for (var className in matches) {
                this._modulesToReady[className] = className;
            }

            // Run matched modules
            for (var className in matches) {
                //require([this._getModuleNameByClass(className)], this.proxy("_onLoadModule", className, matches[className]));
                this._onLoadModule(className, matches[className]);
            }
        },

        /**
         * @return {undefined}
         */
        cleanup: function () {
            Logger.log(this, "cleanup");

            for (moduleName in this._modules) {
                this._unregisterModule(moduleName);
            }

            this._modules = {};

            this._unready();
        },

        /**
         * @param {String} className
         * @return {Boolean}
         */
        _registerModule: function (className) {
            if (undefined === this._modules[className]) {
                var classInstance = $.String.getObject(className , window, true);

                if(classInstance && typeof classInstance == "function") {
                    var module = new classInstance();

                    Logger.log(module, "init");

                    this._modules[className] = module;

                    Logger.log(this, className + " module registered");
                } else {
                    throw new Error("[wader.App] can not create instance of class \"" + className + "\" requested by path \"" + this._getModuleNameByClass(className) + "\"");
                }
            }

            return this._modules[className] ? true : false;
        },

        /**
         * @param {String} className
         * @return {undefined}
         */
        _unregisterModule: function (className) {
            if (undefined === this._modules[className]) return false;

            if (this._modules[className].destruct !== undefined) {
                Logger.log(this._modules[className], "destruct");

                this._modules[className].destruct();
            }

            // crunch
            delete(this._modules[className]);
        },

        /**
         * @param {String} className
         * @param {String[]} params
         * @return {undefined}
         */
        _onLoadModule: function (className, params) {
            this._registerModule(className);

            //if (this._modules[className] !== undefined && this._modules[className].run !== undefined) {

                Logger.log(this._modules[className], "run");

                this._modules[className].run(params);

                if (this._modules[className] instanceof ADeferredModule) {
                //} else if (this._modules[className] instanceof App.IModule) {
                } else {
                    this._onReadyModule(className);
                }
            //}
        },

        /**
         * @param {String} className
         * @return {undefined}
         */
        _onReadyModule: function (className) {
            Logger.log(this._modules[className], "ready");

            delete(this._modulesToReady[className]);

            var size = 0, key;
            for (key in this._modulesToReady) {
                if (this._modulesToReady.hasOwnProperty(key)) size++;
            }

            if (size == 0) {
                Logger.log(this, "ready");
                this._ready = true;
            }
        },

        /**
         * @return {undefined}
         */
        _unready: function () {
            Logger.log(this, "unready");

            this._ready = false;
            this._modulesToReady = {};
            wader.App._selectors = [];
        },

        /**
         * @param {String} moduleName
         * @return {String}
         */
        _getClassNameByModule: function (moduleName) {
            var nameChunks = moduleName.split("/"), nameChunkCount = nameChunks.length;

            while (nameChunkCount--) {
                nameChunks[nameChunkCount] = nameChunks[nameChunkCount].charAt(0).toUpperCase() + nameChunks[nameChunkCount].slice(1);
            }

            return nameChunks.join(".");
        },

        /**
         * @param {String} className
         * @return {String}
         */
        _getModuleNameByClass: function (className) {
            var nameChunks = className.split( "." ), nameChunkCount = nameChunks.length;

            //while (nameChunkCount--) {
                //nameChunks[ nameChunkCount ] = nameChunks[ nameChunkCount ].charAt(0).toLowerCase() + nameChunks[ nameChunkCount ].slice(1);
            //}

            return nameChunks.join("/");
        }
    });

    if (ns !== wader) ns.App = wader.App;
})(window.WADER_NS || window);
