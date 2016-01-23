/* global _*/
define(function(require, exports, module) {
    'use strict';
    main.consumes = ["Plugin", "metaburger.core", "metaburger.persister"];
    main.provides = ["metaburger.model"];
    return main;

    function main(options, imports, register) {
        var Plugin = imports.Plugin;
        var core = imports['metaburger.core'];
        var filePersister = imports['metaburger.persister'];

        var model = new Plugin('epotvin', main.comsumes);
        window.model = model; 
        var emit = model.getEmitter();
        emit.setMaxListeners(500);

        model.m1 = {
            elements: []
        };
        model.m2 = {
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
        var folders = [];

        var index = 0;
        model.on("load", function() {
            model.m3 = core.loadModel();
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
                element = class extends clazz {};
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
            return element;
        };

        register(null, {
            "metaburger.model": model
        });

    }
});