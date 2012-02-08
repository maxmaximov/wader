/**
 * Base application class
 *
 * Contains various helper methods, store and handle "Controller" modules.
 *
 * @author Andrew Tereshko <andrew.tereshko@gmail.com>
 * @version 0.2.1
 */
define("app/App", ["app/Router", "app/Hub", "app/Logger", "app/IModule", "app/ADeferredModule"], function(Router, Hub, Logger, IModule, ADeferredModule) {
    "use strict";

    $.Class.extend("app.App", {
        /* @static */
        _instance: null,

        _whenReadies: [],

        getInstance: function (options) {
            if (!app.App._instance) app.App._instance = new app.App(options);
            return app.App._instance;
        },

        when: function (selector, callback) {
            if (!app.App._instance) throw new Error("app.App: класс должен быть инстанцирован");

            if (app.App._instance._ready) {
                $(selector).whenReady(callback);
            } else {
                app.App._whenReadies.push([selector, callback]);
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

            Logger.log(this, "Init");

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
            Logger.log(this, "Run");

            this._unready();

            var matches = Router.match(), self = this;

            // 404 behavior
            if($.isEmptyObject(matches)) {
                Logger.log(this, "Request unresolved (" + Router.getCurrentPath() + ")");

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
            Logger.log(this, "Cleanup");

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
                } else if (this.debug) {
                    Logger.error('[App] Can not create instance of class "' + className + '" requested by path "' + this._getModuleNameByClass(className) + '"');
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

            if (this._modules[className] !== undefined && this._modules[className].run !== undefined) {

                Logger.log(this._modules[className], "run");

                this._modules[className].run(params);

                if (this._modules[className] instanceof ADeferredModule) {
                //} else if (this._modules[className] instanceof App.IModule) {
                } else {
                    this._onReadyModule(className);
                }
            }
        },

        _onReadyModule: function (className) {
            Logger.log(this._modules[className], "ready");

            delete(this._modulesToReady[className]);

            var size = 0, key;
            for (key in this._modulesToReady) {
                if (this._modulesToReady.hasOwnProperty(key)) size++;
            }

            if (size == 0) {
                this._setReady();
            }
        },

        _unready: function () {
            Logger.log(this, "Unready");

            this._ready = false;
            this._modulesToReady = {};
            app.App._whenReadies = [];
            $(window).whenReadyKillall();
        },

        _setReady: function () {
            Logger.log(this, "Ready");

            this._ready = true;

            while (app.App._whenReadies.length > 0) {
                $(app.App._whenReadies[0][0]).whenReady(app.App._whenReadies[0][1]);
                app.App._whenReadies.shift();
            }
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

