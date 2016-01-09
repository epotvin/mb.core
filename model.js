/* global _*/
define(function(require, exports, module) {
    main.consumes = ["Plugin", "fs"];
    main.provides = ["model"];
    return main;

    function main(options, imports, register) {
        var Plugin = imports.Plugin;
        var fs = imports.fs;

        var model = new Plugin('model', main.comsumes);
        var emit = model.getEmitter();
        emit.setMaxListeners(500);

        model.root = {
            name: 'root',
            instanceOf: 'core.Package',
            elements: []
        };

        model.elements = {};

        model.select = function(element) {
            model.selected = element;
            emit('select', {
                element: element
            });
        };

        function loadPkg(path, pkg, callback) {
            fs.readdir(path, function(err, files) {
                if (err) return callback(err);

                var loadedElements = 0;

                _.each(files, function(file) {
                    if (file.name.substring(0, 1) === '.') {
                        return done();
                    }

                    switch (file.mime) {
                        case 'inode/directory':
                            var element = {
                                name: file.name,
                                instanceOf: 'core.Package',
                                elements: []
                            };
                            pkg.elements.push(element);
                            loadPkg(path + '/' + file.name, element, done);
                            break;
                        case 'application/json':
                            fs.readFile(path + '/' + file.name, function(err, data) {
                                if (err) return callback(err);
                                var element = JSON.parse(data);
                                pkg.elements.push(element);
                                done();
                            });
                            break;
                        default:
                            done();
                    }

                });

                function done(err) {
                    if (err) return callback(err);
                    if (++loadedElements == files.length) {
                        callback();
                    }
                }

            });
        }

        function mapElement(location, element) {
            var fullName = (location ? location + '.' : '') + element.name;
            model.elements[fullName] = element;
            _.each(_.keys(element), function(attribute) {
                if (element[attribute].instanceOf) {
                    mapElement(fullName, element[attribute]);
                }
                if (Array.isArray(element[attribute])) {
                    _.each(element[attribute], function(attr) {
                        if (attr.instanceOf) {
                            mapElement(fullName, attr);
                        }
                    });
                }
            });
        }

        function getAllAttributes(clazz) {
            var attributes = [];
            if (clazz.extends) {
                _.each(clazz.extends, function(extended) {
                    attributes.push(getAllAttributes(extended));
                });
            }
            attributes.push(clazz.attributes);
            return attributes;
        }
        
        function elementsOfType(clazz) {
            return _.filter(model.elements, function(element) {
                return isType(element.instanceOf, clazz);
            });
        }
        
        function isType(clazz1, clazz2) {
            if (clazz1 === clazz2) {
                return true;
            }
            if (clazz1.extends) {
                return _.filter(clazz1.extends, function(extended) {
                    return isType(extended, clazz2);
                }).length > 0;   
            }
            return false;
        }
        
        loadPkg('', model.root, function(err) {
            if (err) return console.log(err);
            
            // Map elements in model.elements
            _.each(model.root.elements, function(element) {
                mapElement(null, element);
            });
            
            // Map instanceOf attributes to all elements
            _.each(model.elements, function(element) {
                element.instanceOf = model.elements[element.instanceOf];
            });
            
            // Link classes extends attributes
            var classes = _.where(model.elements, {instanceOf: model.elements['core.Class']});
            _.forEach(classes, function(clazz) {
                clazz.extends = _.map(clazz.extends, function(extend) {
                    return model.elements[extend];
                });
            });
            
            emit('loaded');
        });

        
        register(null, {
            "model": model
        });

    }
});