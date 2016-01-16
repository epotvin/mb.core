/* global _ */
define(function(require, exports, module) {
    main.consumes = ["Panel", "Tree", "model", "vfs"];
    main.provides = ["browser"];
    return main;

    function main(options, imports, register) {
        var Panel = imports.Panel;
        var Tree = imports.Tree;
        var model = imports.model;
        var vfs = imports.vfs;

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
                }]
            };

            _.each(model.root.elements, function(element) {
                root.children.push(getNodeFromElement(element));
            });
            tree.setRoot(root);
        }

        register(null, {
            "browser": plugin
        });

        function getIconHTML(node) {
            if (node.element) {
                var iconPath = node.element.instanceOf.getIcon();
                var url = vfs.url(iconPath);
                return '<span class="ace_tree-icon" style="background-image: url(' + url + ')"></span>';
            }
            return '';
        }

        function getChildren(node) {
            if (!node.children && node.element) {
                var children = [];
                _.each(node.element.instanceOf.attributes, function(attribute) {
                    if (node.element[attribute.name] && attribute.composition) {
                        if (attribute.multiple) {
                            children = children.concat(_.map(node.element[attribute.name], getNodeFromElement));
                        }
                        else {
                            children.push(getNodeFromElement(node.element[attribute.name]));
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
            _.each(node.element.instanceOf.attributes, function(attribute) {
                if (node.element[attribute.name] && attribute.composition && !attribute.type.isInstanceOf(model.elements['core.type.Type'])) {
                    if (node.element[attribute.name] && (!attribute.multiple || node.element[attribute.name][0])) {
                        hasChildren = true;
                    }
                }
            });
            return hasChildren;
        }

        function getNodeFromElement(element) {
            return {
                label: element.name,
                isFolder: element.elements && element.elements.length > 0,
                element: element
            };
        }
    }
});