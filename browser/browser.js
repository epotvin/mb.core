/* global _ */
define(function(require, exports, module) {
    main.consumes = ["Panel", "Tree", "vfs", "metaburger.model"];
    main.provides = ["metaburger.browser"];
    return main;

    function main(options, imports, register) {
        var Panel = imports.Panel;
        var Tree = imports.Tree;
        var vfs = imports.vfs;

        var model = imports['metaburger.model'];

        var plugin = new Panel("epotvin", main.consumes, {
            index: options.index || 100,
            caption: "Meta Browser",
            minWidth: 130,
            where: options.where || "left"
        });

        var tree;

        plugin.on("load", function() {});

        plugin.on("draw", function(e) {

            tree = new Tree({
                container: e.html,
                getIconHTML: getIconHTML,
                getCaptionHTML: getCaptionHTML,
                getChildren: getChildren,
                hasChildren: hasChildren
            }, plugin);

            tree.on('userSelect', function() {
                var element;
                if (tree.selectedNodes[0]) {
                    element = tree.selectedNodes[0].element;
                }
                model.select(element);
            });

            reloadModel();

            model.on('loaded', reloadModel);
        });

        plugin.on("unload", function() {
            tree.unload();
        });

        function reloadModel() {
            var root = {
                children: []
            };

            root.children.push({
                label: "m3",
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
            });

            //_.each(model.m3.get('elements'), function(element) {
            //    root.children.push(getNodeFromElement(element));
            //});
            root.children.push(getNodeFromElement(model.m3));
            
            root.children.push({
                label: "m2",
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
            });

            _.each(model.m2.elements, function(element) {
                root.children.push(getNodeFromElement(element));
            });

            root.children.push({
                label: "m1",
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
            });

            _.each(model.m1.elements, function(element) {
                root.children.push(getNodeFromElement(element));
            });

            tree.setRoot(root);
        }

        function getIconHTML(node) {
            if (node.element) {
                var iconPath = node.element.instanceOf.getIcon();
                var url = vfs.url(iconPath);
                return '<span class="ace_tree-icon" style="background-image: url(' + url + ')"></span>';
            }
            return '';
        }

        function getCaptionHTML(node) {
            return node.element ? node.element.name : node.label;
        }

        function getChildren(node) {
            if (!node.children && node.element) {
                var children = [];
                _.each(node.element.instanceOf.getAllAttributes(), function(attribute) {
                    if (node.element.get(attribute) && attribute.composition && !attribute.type.isInstanceOf('core.type.Type')) {
                        if (attribute.multiple) {
                            children = children.concat(_.map(node.element.get(attribute), getNodeFromElement));
                        }
                        else {
                            children.push(getNodeFromElement(node.element(attribute)));
                        }
                    }
                });
                node.children = children;
            }

            if (node.children && node.children[0]) {
                var d = (node.$depth + 1) || 0;
                node.children.forEach(function(n) {
                    n.$depth = d;
                    n.parent = node;
                });
            }

            return node.children;
        }

        function hasChildren(node) {
            if (node.children && node.children[0]) {
                return true;
            }
            if (!node.element) {
                return false;
            }
            var hasChildren = false;
            _.each(node.element.instanceOf.getAllAttributes(), function(attribute) {
                if (node.element.get(attribute) && attribute.composition && !attribute.type.isInstanceOf('core.type.Type')) {
                    if (!attribute.multiple || node.element.get(attribute.name)[0]) {
                        hasChildren = true;
                    }
                }
            });
            return hasChildren;
        }

        function getNodeFromElement(element) {
            element.on('changed', function(e) {
                tree.refresh(true);
            });
            return {
                label: element.name,
                isFolder: element.elements && element.elements.length > 0,
                element: element
            };
        }

        register(null, {
            "metaburger.browser": plugin
        });

    }
});