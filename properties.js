/* global _ */
define(function(require, exports, module) {
    main.consumes = ["c9", "util", "Panel", "panels", "ui", "layout", "model"];
    main.provides = ["properties"];
    return main;

    function main(options, imports, register) {
        var c9 = imports.c9;
        var util = imports.util;
        var Panel = imports.Panel;
        var panels = imports.panels;
        var ui = imports.ui;
        var layout = imports.layout;
        var model = imports.model;

        var Tree = require("ace_tree/tree");
        var TreeData = require("ace_tree/data_provider");

        var markup = require("text!./properties.xml");

        var staticPrefix = "/static/plugins/c9.ide.layout.classic";

        var plugin = new Panel("epotvin", main.consumes, {
            index: options.index || 100,
            caption: "Properties",
            panelCSSClass: "workspace_files",
            minWidth: 130,
            where: options.where || "right"
        });

        var grid, container, viewer;

        var loaded = false;

        function load() {
            if (loaded) return false;
            loaded = true;

            panels.on("afterAnimate", function(e) {
                if (panels.isActive("tree"))
                    grid && grid.resize();
            });

            // On Ready Resize initially
            c9.once("ready", function() {
                grid && grid.resize();
            });

            var css = require("text!./browser.css");
            ui.insertCss(util.getFileIconCss(staticPrefix), false, plugin);
            ui.insertCss(css, options.staticPrefix, plugin);

            layout.on("eachTheme", function(e) {
                if (e.changed && grid)(grid).resize(true);
            });
        }


        var drawn = false;

        function draw(options) {
            if (drawn) return;
            drawn = true;

            ui.insertMarkup(options.aml, markup, plugin);

            container = plugin.getElement("container");
            viewer = options.aml;

            grid = new Tree(container.$int);
            var treeData = new TreeData();
            treeData.columns = [{
                caption: "Property",
                value: "name",
                width: "50%",
                type: 'tree'
            }, {
                caption: "Value",
                value: "value",
                width: "50%"
            }];

            model.on('select', function(e) {
                var element = e.element;
                var items = _.map(_.keys(element), function(key) {
                    return {
                        label: key,
                        value: element[key].name ? element[key].name : element[key]
                    };
                });
                treeData.setRoot({
                    label: "root",
                    items: items
                });
            });

            treeData.getIconHTML = function(node) {
                return "<span class='dbgVarIcon'></span>";
            };
            grid.setDataProvider(treeData);

            $hookIntoApfFocus(grid, container);
            grid.renderer.setScrollMargin(10, 10);
            grid.renderer.setTheme({
                cssClass: "blackdg"
            });

            grid.renderer.scrollBarV.$minWidth = 10;

            layout.on("resize", function() {
                grid.resize(true);
            }, plugin);

            layout.on("eachTheme", function(e) {
                var height = parseInt(ui.getStyleRule(".filetree .tree-row", "height"), 10) || 22;
                treeData.rowHeightInner = height;
                treeData.rowHeight = height;

                if (e.changed && grid)(grid).resize(true);
            });

            grid.setDataProvider(treeData);

            var btnTreeSettings = plugin.getElement("btnTreeSettings");
            var mnuFilesSettings = plugin.getElement("mnuFilesSettings");

            btnTreeSettings.setAttribute("submenu", mnuFilesSettings);
            grid.renderer.on("scrollbarVisibilityChanged", updateScrollBarSize);
            grid.renderer.on("resize", updateScrollBarSize);
            grid.renderer.scrollBarV.$minWidth = 10;

            function updateScrollBarSize() {
                var scrollBarV = grid.renderer.scrollBarV;
                var w = scrollBarV.isVisible ? scrollBarV.getWidth() : 0;
                btnTreeSettings.$ext.style.marginRight = Math.max(w - 2, 0) + "px";
            }

            plugin.panel = viewer;

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
            grid && grid.destroy();
            container = null;
            viewer = null;
        });

        register(null, {
            "properties": plugin
        });
    }
});