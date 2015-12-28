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
                model.rowHeightInner = height;
                model.rowHeight = height;

                if (e.changed && tree)(tree).resize(true);
            });

            tree.setDataProvider(model);
            
            var btnTreeSettings = plugin.getElement("btnTreeSettings");
            var mnuFilesSettings = plugin.getElement("mnuFilesSettings");
            
            btnTreeSettings.setAttribute("submenu", mnuFilesSettings);
            tree.renderer.on("scrollbarVisibilityChanged", updateScrollBarSize);
            tree.renderer.on("resize", updateScrollBarSize);
            tree.renderer.scrollBarV.$minWidth = 10;
            function updateScrollBarSize() {
                var scrollBarV = tree.renderer.scrollBarV;
                var w = scrollBarV.isVisible ? scrollBarV.getWidth() : 0;
                btnTreeSettings.$ext.style.marginRight = Math.max(w - 2,  0) + "px";
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
            tree && tree.destroy();
            container = null;
            viewer = null;
        });

        register(null, {
            "browser": plugin
        });
    }
});