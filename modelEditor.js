define(function(require, exports, module) {
    main.consumes = ["Editor", "editors", "ui", "commands", "tabManager", "layout"];
    main.provides = ["modelEditor"];
    return main;

    function main(options, imports, register) {

        var Editor = imports.Editor;
        var editors = imports.editors;
        var ui = imports.ui;
        var commands = imports.commands;
        var tabManager = imports.tabManager;

        // TODO Need to do that in order to load backbone correctly
        require('jquery');
        require('underscore');
        var joint = require('jointjs/joint');

        var markup = require("text!./modelEditor.xml");

        var handle = editors.register("modelEditor", "ModelEditor", ModelEditor, []);
        handle.developer = 'epotvin';
        var handleEmit = handle.getEmitter();
        handleEmit.setMaxListeners(1000);

        handle.on("load", function() {

            commands.addCommand({
                name: "openModel",
                group: "Model",
                bindKey: {
                    mac: "Shift-Command-7",
                    win: "Ctrl-Shift-7"
                },
                exec: function() {
                    var pane = tabManager.focussedTab && tabManager.focussedTab.pane;
                    if (tabManager.getTabs(tabManager.container).length === 0)
                        pane = null;

                    tabManager.open({
                        editorType: "modelEditor",
                        focus: true,
                        pane: pane
                    }, function(err, tab) {
                        console.log(err);
                    });
                }
            }, handle);

        });

        function ModelEditor() {
            var plugin = new Editor("Model", main.consumes, []);

            var container;
            plugin.on("draw", function(e) {
                ui.insertMarkup(e.tab, markup, plugin);

                ui.insertCss(require("text!./modelEditor.css"), options.staticPrefix, plugin);
                ui.insertCss(require("text!./joint.css"), options.staticPrefix, plugin);

                container = plugin.getElement("barModelEditor").$int;

                handleEmit.sticky("create", {
                    editor: plugin
                }, plugin);

                var graph = new joint.dia.Graph;

                var paper = new joint.dia.Paper({
                    el: container,
                    width: $(container).width(),
                    height: $(container).height(),
                    model: graph,
                    gridSize: 1
                });

                plugin.on("resize", function() {
                    paper.setDimensions($(container).width(), $(container).height());
                }, plugin);

                var rect = new joint.shapes.basic.Rect({
                    position: {
                        x: 100,
                        y: 30
                    },
                    size: {
                        width: 100,
                        height: 30
                    },
                    attrs: {
                        rect: {
                            fill: 'blue'
                        },
                        text: {
                            text: 'my box',
                            fill: 'white'
                        }
                    }
                });

                var rect2 = rect.clone();
                rect2.translate(300);

                var link = new joint.dia.Link({
                    source: {
                        id: rect.id
                    },
                    target: {
                        id: rect2.id
                    }
                });

                graph.addCells([rect, rect2, link]);

            });

            // Register the API
            plugin.freezePublicAPI({});

            plugin.on("documentLoad", function(e) {
                var doc = e.doc;
                doc.tab.classList.add("dark");
                doc.title = 'Model Editor';
            });

            plugin.load();
            return plugin;
        }
        register(null, {
            "modelEditor": handle
        });
    }
});