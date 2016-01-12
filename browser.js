/* global _ */
define(function(require, exports, module) {
    main.consumes = ["c9", "util", "Panel", "panels", "ui", "layout", "model"];
    main.provides = ["browser"];
    return main;

    function main(options, imports, register) {
        var c9 = imports.c9;
        var util = imports.util;
        var Panel = imports.Panel;
        var panels = imports.panels;
        var ui = imports.ui;
        var layout = imports.layout;
        var TreeData = require("ace_tree/data_provider");

        var model = imports.model;

        var Tree = require("ace_tree/tree");

        var markup = require("text!./browser.xml");

        var staticPrefix = "/static/plugins/c9.ide.layout.classic";

        var plugin = new Panel("Meta Browser", main.consumes, {
            index: options.index || 100,
            caption: "Meta Browser",
            panelCSSClass: "workspace_files",
            minWidth: 130,
            where: options.where || "left"
        });

        var tree, container, viewer;

        var loaded = false;

        function load() {
            if (loaded) return false;
            loaded = true;

            panels.on("afterAnimate", function(e) {
                if (panels.isActive("tree"))
                    tree && tree.resize();
            });

            // On Ready Resize initially
            c9.once("ready", function() {
                tree && tree.resize();
            });

            var css = require("text!./browser.css");
            ui.insertCss(util.getFileIconCss(staticPrefix), false, plugin);
            ui.insertCss(css, options.staticPrefix, plugin);

            layout.on("eachTheme", function(e) {
                if (e.changed && tree)(tree).resize(true);
            });
        }

        var treeData = getTreeData();

        var drawn = false;

        function draw(options) {
            if (drawn) return;
            drawn = true;

            ui.insertMarkup(options.aml, markup, plugin);

            container = plugin.getElement("container");
            viewer = options.aml;

            tree = new Tree(container.$int);
            $hookIntoApfFocus(tree, container);
            tree.renderer.setScrollMargin(10, 10);
            tree.renderer.setTheme({
                cssClass: "filetree"
            });

            tree.renderer.scrollBarV.$minWidth = 10;

            layout.on("resize", function() {
                tree.resize();
            }, plugin);

            layout.on("eachTheme", function(e) {
                var height = parseInt(ui.getStyleRule(".filetree .tree-row", "height"), 10) || 22;
                treeData.rowHeightInner = height;
                treeData.rowHeight = height;

                if (e.changed && tree)(tree).resize(true);
            });

            tree.on('userSelect', function() {
                var element;
                if (treeData.selectedItems[0]) {
                    element = treeData.selectedItems[0].element;
                }
                model.select(element);
            });

            tree.setDataProvider(treeData);

            var btnTreeSettings = plugin.getElement("btnTreeSettings");
            var mnuFilesSettings = plugin.getElement("mnuFilesSettings");

            btnTreeSettings.setAttribute("submenu", mnuFilesSettings);
            tree.renderer.on("scrollbarVisibilityChanged", updateScrollBarSize);
            tree.renderer.on("resize", updateScrollBarSize);
            tree.renderer.scrollBarV.$minWidth = 10;

            function updateScrollBarSize() {
                var scrollBarV = tree.renderer.scrollBarV;
                var w = scrollBarV.isVisible ? scrollBarV.getWidth() : 0;
                btnTreeSettings.$ext.style.marginRight = Math.max(w - 2, 0) + "px";
            }

            plugin.panel = viewer;

            reloadModel();
        }

        function $hookIntoApfFocus(ace, amlNode) {
            // makes apf to treat barTerminal as codeEditor
            amlNode.$isTextInput = function(e) {
                return true;
            };
            ace.on("focus", function() {
                amlNode.focus();
            });
            ace.on("blur", function() {
                // amlNode.blur();
            });
            amlNode.$focus = function(e, fromContextMenu) {
                if (fromContextMenu) {
                    ace.renderer.visualizeFocus();
                }
                else {
                    ace.textInput.focus();
                }
            };
            amlNode.$blur = function(e) {
                if (!ace.isFocused())
                    ace.renderer.visualizeBlur();
                else
                    ace.textInput.blur();
            };
        }

        plugin.on("draw", function(e) {
            draw(e);
        });

        plugin.on("load", function() {
            load();
        });

        plugin.on("unload", function() {
            loaded = false;
            drawn = false;
            tree && tree.destroy();
            container = null;
            viewer = null;
        });

        model.on('loaded', reloadModel);

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
            treeData.setRoot(root);
        }

        register(null, {
            "browser": plugin
        });

        function getTreeData() {
            var treeData = new TreeData();

            treeData.$indentSize = 12;

            treeData.getIconHTML = function(node) {
                var icon = node.isFolder ? "folder" : "page_white_cup";
                if (node.status === "loading") icon = "loading";
                return "<span class='filetree-icon " + icon + "'></span>";
            };

            treeData.getChildren = function(node) {
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
            };

            treeData.hasChildren = function(node) {
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
            };

            return treeData;
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