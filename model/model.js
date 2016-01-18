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

        model.m1 = new core.Package('m1');
        model.m2 = new core.Package('m2');
        model.m3 = new core.Package('m3');
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
            if (clazz.is(this.elements['core.Class'])) {
                return new core.Class(name, this);
            }
            if (clazz.is(this.elements['core.Attribute'])) {
                return new core.Attribute(name, this);
            }
            if (clazz.is(this.elements['core.Package'])) {
                return new core.Package(name, this);
            }
            if (clazz.is(this.elements['core.RootElement'])) {
                return new core.RootElement(name, this);
            }
            return new core.Element(name, this);
        };

        register(null, {
            "model": model
        });

    }
});