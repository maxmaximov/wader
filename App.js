/**
 * Base application class
 *
 * Contains various helper methods, store and handle "Controller" modules.
 *
 * @author Andrew Tereshko <andrew.tereshko@gmail.com>
 * @author Max Maximov <max.maximov@gmail.com>
 * @version 0.2.2
 */
define("app/App", ["app/Router", "app/Hub", "app/Logger", "app/IModule", "app/ADeferredModule"], function(Router, Hub, Logger, IModule, ADeferredModule) {
    "use strict";

    $.Class.extend("app.App", {
        /* @static */
        _instance: null,
        _timestamp: null,
        _timeout: 1000,

        _interval: null,
        _intervalDelay: 50,
        _killInterval: 3000,

        _selectors: [],
        _questions: [],
        _answers: {},

        getInstance: function (options) {
            if (!app.App._instance) {
                app.App._instance = new app.App(options);
                app.App._timestamp = new Date();
            }

            return app.App._instance;
        },

        when: function (selector, callback) {
            if (!app.App._instance) throw new Error("[app.App] класс должен быть инстанцирован");

            var callback = arguments.length == 2 ? callback : selector;
            var selector = arguments.length == 2 ? selector : "";

            app.App._selectors.push({
                "selector":  selector,
                "callback": callback
            });

            app.App._check();
        },

        ask: function (question, callback) {
            if (!app.App._instance) throw new Error("[app.App] класс должен быть инстанцирован");

            var deferred = new $.Deferred();

            app.App._questions.push({
                "question": question,
                "callback": callback,
                "deferred": deferred
            });

            app.App._check();

            return deferred;
        },

        answer: function (question, data) {
            if (!app.App._instance) throw new Error("[app.App] класс должен быть инстанцирован");

            app.App._answers[question] = data;

            app.App._check();
        },

        _check: function () {
            var timestamp = new Date();

            if (!app.App._interval) {
                app.App._interval = setInterval(app.App._check, app.App._intervalDelay);
            } else if (timestamp - app.App._timestamp > app.App._timeout) {
                Logger.warn("[app.App] timeout (" + app.App._timeout + " ms) expired.", { "ready": app.App._instance._ready, "modules": app.App._instance._modules, "modules to ready": app.App._instance._modulesToReady, "selectors": app.App._selectors, "questions": app.App._questions });
            }


            var selectors = app.App._selectors;

            if (app.App._instance._ready) {
                for (var i = 0; i < selectors.length; i++) {
                    var callback = selectors[i]["callback"];
                    var selector = selectors[i]["selector"];

                    if (selector) {
                        var element = $(selector);

                        if (element.length > 0) {
                            selectors.splice(i, 1);
                            callback.apply(element);
                        }
                    } else {
                        selectors.splice(i, 1);
                        callback();
                    }
                }
            }


            var questions = app.App._questions;
            var answers = app.App._answers;

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

            //if ((app.App._interval && selectors.length < 1 && questions.length < 1) || timestamp - app.App._timestamp > app.App._killInterval) {
            if ((app.App._interval && selectors.length < 1) || timestamp - app.App._timestamp > app.App._killInterval) {
                clearInterval(app.App._interval);
                app.App._interval = null;
            }
        }
    }, {
        /* @prototype */
        options: {
            routes: {},
            baseNamespace: "App"
        },

        /**
         * current Controller modules
         *
         */
        _modules: {},

        _modulesToReady: {},

        _ready: false,

        init: function (options) {
            $.extend(this.options, options || {});

            Logger.log(this, "init");

            // Binding route rules to modules
            $.each(this.options.routes, function (moduleName, routes) {
                $.each(routes, function (i, routeRule) {
                    Router.add(routeRule, moduleName);
                });
            });

            var history = window.History, url = history.getState().url;

            if (window.location.toString().search(/#/) && !history.isTraditionalAnchor(history.getHash())) {
                if (history.getHash().search(/^\//)) {
                    window.location = history.getHash();
                } else {
                    window.location = history.getBasePageUrl() + history.getHash();
                }
            } else {
                // App run on every hash change
                $(window).bind("statechange.app", this.proxy("run"));
            }

            Hub.sub("app/module/ready", this.proxy("_onReadyModule"));
        },

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
                require([this._getModuleNameByClass(className)], this.proxy("_onLoadModule", className, matches[className]));
            }
        },

        cleanup: function() {
            Logger.log(this, "cleanup");

            for (moduleName in this._modules) {
                this._unregisterModule(moduleName);
            }

            this._modules = {};

            this._unready();
        },

        _registerModule: function(className) {
            if (undefined === this._modules[className]) {
                var classInstance = $.String.getObject(className , window, true);

                if(classInstance && typeof classInstance == "function") {
                    var module = new classInstance();

                    Logger.log(module, "init");

                    this._modules[className] = module;

                    Logger.log(this, className + " module registered");
                } else {
                    throw new Error("[app.App] can not create instance of class \"" + className + " requested by path \"" + this._getModuleNameByClass(className) + "\"");
                }
            }

            return this._modules[className] ? true : false;
        },

        _unregisterModule: function (className) {
            if (undefined === this._modules[className]) return false;

            if (this._modules[className].destruct !== undefined) {
                Logger.log(this._modules[className], "destruct");

                this._modules[className].destruct();
            }

            // crunch
            delete(this._modules[className]);
        },

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

        _unready: function () {
            Logger.log(this, "unready");

            this._ready = false;
            this._modulesToReady = {};
            app.App._selectors = [];
        },

        _getClassNameByModule: function (moduleName) {
            var nameChunks = moduleName.split("/"), nameChunkCount = nameChunks.length;

            if (this.options.baseNamespace) {
                nameChunkCount = nameChunks.unshift(this.options.baseNamespace);
            }

            while (nameChunkCount--) {
                nameChunks[nameChunkCount] = nameChunks[nameChunkCount].charAt(0).toUpperCase() + nameChunks[nameChunkCount].slice(1);
            }

            return nameChunks.join(".");
        },

        _getModuleNameByClass: function (className) {
            if (this.options.baseNamespace) {
                className = className.replace( this.options.baseNamespace + ".", "" );
            }

            var nameChunks = className.split( "." ), nameChunkCount = nameChunks.length;

            //while (nameChunkCount--) {
                //nameChunks[ nameChunkCount ] = nameChunks[ nameChunkCount ].charAt(0).toLowerCase() + nameChunks[ nameChunkCount ].slice(1);
            //}

            return nameChunks.join("/");
        }
    });

    return app.App;
});

