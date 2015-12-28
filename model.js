define(function(require, exports, module) {
    main.consumes = ["util"];
    main.provides = ["model"];
    return main;

    function main(options, imports, register) {
        var util = imports.util;

        var TreeData = require("ace_tree/data_provider");

        var model = new TreeData();

        model.$indentSize = 12;
        model.getIconHTML = function(node) {
            var icon = node.isFolder ? "folder" : node.icon;
            if (node.status === "loading") icon = "loading";
            return "<span class='filetree-icon " + icon + "'></span>";
        };
        model.setRoot({
            children: [{
                label: "models",
                path: "!domains",
                isOpen: true,
                className: "heading",
                isRoot: true,
                isFolder: true,
                status: "loaded",
                map: {},
                children: [],
                noSelect: true,
                $sorted: true
            }, {
                label: "core",
                isFolder: true,
                items: [{
                    label: "Class",
                    icon: "brkp_obj_condition"
                }, {
                    label: "Element"
                }, {
                    label: "Package"
                }, {
                    label: "RootElement"
                }, {
                    label: "Attribute"
                }, {
                    label: "Type"
                }, {
                    label: "String"
                }, {
                    label: "Number"
                }, {
                    label: "Boolean"
                }]
            }]
        });

        register(null, {
            "model": model
        });

    }
});