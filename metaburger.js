define(function(require, exports, module) {
    'use strict';
    main.consumes = ["Plugin", "fs", "metaburger.core", "metaburger.persister"];
    main.provides = ["metaburger"];
    return main;

    function main(options, imports, register) {
        var Plugin = imports.Plugin;
        var fs = imports.fs;
        var core = imports['metaburger.core'];

        var persister = imports['metaburger.persister'];

        var metaburger = new Plugin('epotvin', main.consumes);
        var emit = metaburger.getEmitter();

        metaburger.on('load', function() {
            metaburger.models = [core.getModel()];
            loadWorkspace();
        });

        function loadWorkspace() {
            fs.readFile('/metaburger.json', function(err, data) {
                if (err) return console.log(err);
                var workspace = JSON.parse(data);

                loadNextFolder(workspace, function(err) {
                    if (err) return console.log(err);
                    console.log('Workspace loaded with success');
                    emit('loaded');
                });
            });
        }

        function loadNextFolder(workspace, callback) {
            var folder = workspace.models[0];
            if (!folder) return callback(null);
            persister.loadFolder(folder, metaburger.models, function(err, model) {
                if (err) return callback(err);
                metaburger.models.push(model);
                workspace.models.splice(0, 1);
                loadNextFolder(workspace, callback);
            });
        }

        metaburger.select = function(element) {
            metaburger.selected = element;
            emit('select', {
                element: element
            });
        };

        register(null, {
            "metaburger": metaburger
        });

    }
});