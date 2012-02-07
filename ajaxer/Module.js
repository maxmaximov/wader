define("ajaxer/Module", ["ajaxer/Core"], function(Ajaxer) {
    "use strict";

    Ajaxer.extend("ajaxer.Module", {
        postInit: function () {},

        run: function (group) {
            this.module = true;
            this.changePage(group);
        }
    });

    return ajaxer.Module;
});

