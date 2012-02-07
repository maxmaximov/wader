define("ajaxer/Page", [], function() {
    "use strict";

    $.Class.extend("ajaxer.Page", {
        debug: false
    }, {
        id: null,
        body: "",
        head: {},
        title: "",
        styles: [],
        scripts: [],
        embeddedScripts: [],
        metas: [],
        url: "",
        callback: null,
        init: function(url, callback) {
            this.url = url;
            this.callback = callback;

            if (this.constructor.debug) console.log("AjaxerPage: getting page");

            $.get(url + "?" + Math.random(), this.proxy("gotPage"), "html");
        },
        gotPage: function(data) {
            if (this.constructor.debug) console.log("AjaxerPage: got page");

            var id = this.url;
            var body = data.replace(/[\r\n]/g, '').match(/<body.*?>(.*?)<\/body>/i)[1];
            var head = data.replace(/[\r\n]/g, '').match(/<head.*?>(.*?)<\/head>/i)[1];
            var title = head.match(/<title.*?>(.*?)<\/title>/i)[1];

            var scripts = [];
            $.merge(scripts, head.match(/<script.*? src=".+?".*?>.*?<\/script>/ig) || []);
            //$.merge(scripts, head.match(/<script.*?\/>/ig) || []);
            //$.merge(scripts, head.match(/<script.*?>.*?<\/script>/ig) || []);
            for (var i in scripts) {
                scripts[i] = [$(scripts[i])[0], 0]
            }

            var embeddedScripts = head.match(/<script>.*?<\/script>/ig) || [];

            var styles = [];
            $.merge(styles, head.match(/<link.*? rel="stylesheet".*?\/>/ig) || []);
            $.merge(styles, head.match(/<link.*? rel="stylesheet".*?>.*?<\/link>/ig) || []);
            $.merge(styles, head.match(/<style.*?>.*?<\/style>/ig) || []);
            for (var i in styles) {
                styles[i] = [styles[i], 0]
            }

            var metas = [];
            $.merge(metas, head.match(/<meta.*?\/>/ig) || []);
            $.merge(metas, head.match(/<meta.*?>.*?<\/meta>/ig) || []);

            this.id = id;
            this.title = title;
            this.scripts = scripts;
            this.embeddedScripts = embeddedScripts;
            this.styles = styles;
            this.metas = metas;
            this.body = body;

            this.callback(this);
        },
        getBody: function() {
            return this.body;
        },
        getStyles: function() {
            return this.styles;
        },
        getScripts: function() {
            return this.scripts;
        },
        getEmbeddedScripts: function() {
            return this.embeddedScripts;
        },
        getId: function() {
            return this.id;
        },
        getUrl: function() {
            return this.url;
        },
        getTitle: function() {
            return this.title;
        }
    });

    return ajaxer.Page;
});

