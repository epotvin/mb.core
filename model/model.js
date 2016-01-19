/* global _*/
define(function(require, exports, module) {
    main.consumes = ["Plugin", "core", "filePersister"];
    main.provides = ["model"];
    return main;

    function main(options, imports, register) {
        var Plugin = imports.Plugin;
        var core = imports.core;
        var filePersister = imports.filePersister;

        var model = new Plugin('epotvin', main.comsumes);
        var emit = model.getEmitter();
        emit.setMaxListeners(500);

        model.m1 = {
            elements: []
        };
        model.m2 = {
            elements: []
        };
        model.m3 = {
            elements: []
        };
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

        // todo Put that in settings
        var folders = [{
            target: model.m2,
            path: '/metamodels'
        }, {
            target: model.m1,
            path: '/models'
        }];

        var index = 0;
        model.on("load", function() {
            core.addToModel(model);
            model.m1.instanceOf = model.elements['core.Package'];
            model.m2.instanceOf = model.elements['core.Package'];
            model.m3.instanceOf = model.elements['core.Package'];
            filePersister.loadFolder(model, folders[index++], loaded);
        });

        function loaded(err) {
            if (err) return console.log(err);
            if (index < folders.length) {
                return filePersister.loadFolder(model, folders[index++], loaded);
            }
            emit('loaded');
        }

        model.newInstance = function(clazz, name) {
            var element = null;
            if (clazz.is(this.elements['core.Class'])) {
                element = new core.Class(name, this);
            }
            else if (clazz.is(this.elements['core.Attribute'])) {
                element = new core.Attribute(name, this);
            }
            else if (clazz.is(this.elements['core.Package'])) {
                element = new core.Package(name, this);
            }
            else if (clazz.is(this.elements['core.RootElement'])) {
                element = new core.RootElement(name, this);
            }
            else {
                element = new core.Element(name, this);
            }
            element.instanceOf = clazz;
            return element;
        };

        register(null, {
            "model": model
        });

    }
});