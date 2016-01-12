/* global _*/
define(function(require, exports, module) {
    main.consumes = ["Plugin", "core", "filePersister"];
    main.provides = ["model"];
    return main;

    function main(options, imports, register) {
        var Plugin = imports.Plugin;
        var core = imports.core;
        var filePersister = imports.filePersister;

        var model = new Plugin('model', main.comsumes);
        var emit = model.getEmitter();
        emit.setMaxListeners(500);

        model.root = new core.Package('root');
        model.elements = {};
        
        model.select = function(element) {
            model.selected = element;
            emit('select', {
                element: element
            });
        };

        model.allInstancesOf = function(clazz) {
            return _.filter(model.elements, function(element) {
                return model.isInstanceOf(element.instanceOf, clazz);
            });
        };

        model.on("load", function() {
            core.addToModel(model);
            filePersister.loadFolder(model, 'metamodels');
            filePersister.loadFolder(model, 'models');
            emit('loaded');
        });

        register(null, {
            "model": model
        });

    }
});