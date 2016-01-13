/* global _*/
define(function(require, exports, module) {
    main.consumes = ["Plugin", "fs", "core"];
    main.provides = ["filePersister"];
    return main;

    function main(options, imports, register) {
        var Plugin = imports.Plugin;
        var fs = imports.fs;

        var filePersister = new Plugin('epotvin', main.consumes);

        filePersister.loadFolder = function(model, folderName, callback) {
            loadPkg(folderName, {
                elements: []
            }, function(err, graph) {
                if (err) return callback(err);

                var elements = {};
                var root = [];
                var updated = 0;

                function mapElement(location, e) {
                    var clazz = model.elements[e.instanceOf] || elements[e.instanceOf];
                    if (!clazz) return;

                    var created = false;

                    var fullName = (location ? location + '.' : '') + e.name;
                    var element = elements[fullName];
                    if (!element) {
                        element = model.newInstance(clazz, e.name);
                        element.instanceOf = clazz;
                        element.fullName = fullName;
                        created = true;
                    }

                    var ok = true;
                    _.each(clazz.getAllAttributes(), function(attribute) {
                        if (!ok ||
                            attribute === model.elements['core.Element.name'] ||
                            attribute === model.elements['core.Element.instanceOf'] ||
                            attribute === model.elements['core.RootElement.package'] ||
                            attribute === model.elements['core.Attribute.owner']) return;
                        if (attribute.type.isInstanceOf(model.elements['core.type.Type'])) {
                            element[attribute.name] = e[attribute.name];
                            return;
                        }
                        if (attribute.composition) {
                            if (attribute.multiple) {
                                element[attribute.name] = _.map(e[attribute.name], function(attr) {
                                    return mapElement(fullName, attr);
                                });
                            }
                            else {
                                element[attribute.name] = mapElement(fullName, e[attribute.name]);
                            }
                        }
                        else {
                            if (attribute.multiple) {
                                var values = _.map(e[attribute.name], function(name) {
                                    return model.elements[name] || elements[name];
                                });
                                if (values.length === e[attribute.name].length) {
                                    element[attribute.name] = values;
                                }
                                else {
                                    ok = false;
                                }
                            }
                            else {
                                var value = model.elements[e[attribute.name]] || elements[e[attribute.name]];
                                if (value) {
                                    element[attribute.name] = value;
                                }
                                else {
                                    ok = false;
                                }
                            }
                        }
                    });
                    if (ok && created) {
                        elements[fullName] = element;
                        updated++;
                    }
                    return element;
                }

                _.each(graph.elements, function(e) {
                    root.push(mapElement('', e));
                });

                while (updated > 0) {
                    updated = 0;
                    root = [];
                    _.each(graph.elements, function(e) {
                        root.push(mapElement('', e));
                    });
                }

                model.root.elements = model.root.elements.concat(root);
                _.extend(model.elements, elements);

                callback();
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
                            var subPkg = {
                                name: file.name,
                                instanceOf: 'core.Package',
                                elements: []
                            };
                            pkg.elements.push(subPkg);
                            loadPkg(path + '/' + file.name, subPkg, done);
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
                        callback(null, pkg);
                    }
                }

            });
        }

        register(null, {
            "filePersister": filePersister
        });

    }
});