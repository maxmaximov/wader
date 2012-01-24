define("ajaxer/Core", ["ajaxer/Page"], function(Page) {
    "use strict";

    $.Class.extend("ajaxer.Core", {
        debug: false
    }, {
        module: false,
        pagesByGroups: [],
        activeGroup: null,
        groupsCount: 0,
        scripts: [],
        selectorToRemove: "",
        selectorToAppend: "",
        selectorToPrepend: "",

        init: function(selectorToRemove, selectorToAppend) {
            Page.debug = this.constructor.debug;

            if (this.constructor.debug) console.log("Ajaxer: init");

            this.scripts = [];
            this.selectorToRemove = selectorToRemove;
            this.selectorToAppend = selectorToAppend;
            //this.selectorToPrepend = selectorToPrepend;

            var scripts = $("head > script[src]");
            var exists;
            for (var i = 0; i < scripts.length; i++) {
                exists = false;
                for (var j = 0; j < this.scripts.length; j++) {
                    if (scripts[i].src == this.scripts[j][0].src) {
                        exists = true;
                        break;
                    }
                }

                if (!exists) this.scripts.push([scripts[i], 0]);
            }

            this.catchClick();
            this.postInit();
        },

        postInit: function() {
            this.setGroup(this.groupsCount);
            this.groupsCount++;

            this.pagesByGroups.push([location.href, this.getGroup()]);

            this.catchStateChange();
        },

        getGroup: function() {
            return this.activeGroup;
        },

        setGroup: function(id) {
            this.activeGroup = id;
        },

        catchClick: function() {
            //if (!($(document).data("events") && $(document).data("events")["click"])) {
                $(document).bind("click.ajaxer", this.proxy("catchedClick"));
            //}
        },

        catchedClick: function(event) {
            //var re = new RegExp("^" + window.location.protocol + "\/\/" + window.location.host);
            var o = $(event.target);
            var handlers = o.data("events");
            var ajaxerOn = !(o.data("ajaxer") && o.data("ajaxer") == "off");
            var leftButton = (event.button == 0);
            var isMetaKeys = (event.ctrlKey || event.altKey || event.shiftKey || event.metaKey);

            if (ajaxerOn && leftButton && !isMetaKeys) {
                if (event.target.nodeName.match(/^a$/i) && event.target.href && event.target.href.match(/http(?:s)?:\/\/([^\/]+).*/)[1] == location.host) {
                    if (!event.target.onclick && !(handlers && handlers["click"])) {
                        if (this.constructor.debug) console.log("Ajaxer: catched click on", event.target.href);

                        event.preventDefault();
                        if (!this.page || this.page.getUrl() != event.target.href) {
                            if (this.constructor.debug) console.log("Ajaxer: push state");

                            History.pushState({ ajaxer: true }, null, event.target.href);
                        }
                    }
                }
            }
        },

        catchStateChange: function() {
            $(window).bind('statechange.ajaxer', this.proxy("catchedStateChange"));
        },

        catchedStateChange: function(event) {
            if (this.constructor.debug) console.log("Ajaxer: catched state change on", History.getState().url);

            this.changePage();
        },

        changePage: function(group) {
            var state = History.getState();
            var exists = false;

            if (this.module) {
                if (this.getGroup() == null) {
                    this.setGroup(group);
                    $(window).trigger("pageready");
                } else {
                    if (group != this.getGroup()) {
                        this.page = new Page(state.url, this.proxy("renderPage"));
                        this.setGroup(group);
                    } else {
                        $(window).trigger("pageready");
                    }
                }
            } else {
                for (var i in this.pagesByGroups) {
                    if (this.pagesByGroups[i][0] == state.url) {
                        exists = true;
                        group = this.pagesByGroups[i][1];
                        break;
                    }
                }

                if (state.data.ajaxer) {
                    if (exists) {
                        if (group != this.getGroup()) {
                            this.page = new Page(state.url, this.proxy("renderPage"));
                            this.setGroup(group);
                        } else {
                            $(window).trigger("pageready");
                        }
                    } else {
                        this.page = new Page(state.url, this.proxy("renderPage"));

                        this.setGroup(this.groupsCount);
                        this.groupsCount++;

                        this.pagesByGroups.push([state.url, this.getGroup()]);
                    }
                } else {
                    if (exists) {
                        if (group != this.getGroup()) {
                            this.page = new Page(state.url, this.proxy("renderPage"));
                            this.setGroup(group);
                        } else {
                            $(window).trigger("pageready");
                        }
                    } else {
                        $(window).trigger("pageready");
                        this.pagesByGroups.push([state.url, this.getGroup()]);
                    }
                }
            }

        },

        renderPage: function() {
            if (this.constructor.debug) console.log("Ajaxer: render page");

            var styles, scripts, embeddedScripts, exists;

            document.title = this.page.getTitle();

            $(this.selectorToRemove).remove();
            $("head > script").not("[src]").remove();
            //$("head > script").remove();
            $("head > style, head > link[rel=\"stylesheet\"]").remove();

            //$(window).unbind();
            //$(document).unbind(); // jquery.ui.mouse.js вешает на document mouseup

            $(this.selectorToAppend).append(this.page.getBody());

            styles = this.page.getStyles();
            for (var i in styles) {
                $("head").append($(styles[i][0]));
            }

            embeddedScripts = this.page.getEmbeddedScripts();
            /*for (var i in embeddedScripts) {
                $("head").append($(embeddedScripts[i]));
            }*/

            exists, scripts = this.page.getScripts();
            for (var i = 0; i < scripts.length; i++) {
                exists = false;
                for (var j = 0; j < this.scripts.length; j++) {
                    //if (scripts[i][0].src.replace(/\?.*/, "") == this.scripts[j].src.replace(/\?.*/, "")) {
                    if (scripts[i][0].src == this.scripts[j][0].src) {
                        exists = true;
                        break;
                    }
                }

                if (!exists) {
                    $("head").append(scripts[i][0]);
                    this.scripts.push(scripts[i]);
                }
            }

            $(window).trigger("pageready");
        }
    });

    return ajaxer.Core;
});

