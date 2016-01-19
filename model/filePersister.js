/* global _*/
define(function(require, exports, module) {
    main.consumes = ["Plugin", "fs", "core", "format.jsbeautify"];
    main.provides = ["filePersister"];
    return main;

    function main(options, imports, register) {
        var Plugin = imports.Plugin;
        var fs = imports.fs;
        var format = imports['format.jsbeautify'];
        
        var filePersister = new Plugin('epotvin', main.consumes);

        var loading = false;

        filePersister.loadFolder = function(model, folder, callback) {
            loading = true;
            loadPkg(folder.path, {
                elements: []
            }, function(err, graph) {
                if (err) {
                    loading = false;
                    return callback(err);
                }
                var elements = {};
                var root = [];
                var updated = 0;

                function mapElement(location, e) {
                    var clazz = model.elements[e.instanceOf] || elements[e.instanceOf];
                    if (!clazz) return;

                    var fullName = (location ? location + '.' : '') + e.name;
                    var element = elements[fullName];
                    if (!element) {
                        element = model.newInstance(clazz, e.name);
                        elements[fullName] = element;
                        updated++;

                        if (e.file) {
                            element.on('changed', function(event) {
                                updateFile(event, e.file);
                            });
                        }
                        if (e.folder) {
                            element.on('changed', function(event) {
                                updateFolder(event, e.folder);
                            });
                        }
                    }

                    _.each(clazz.getAllAttributes(), function(attribute) {
                        if (attribute.referencedBy && attribute.referencedBy.composition) {
                            return element[attribute.name] = elements[location];
                        }

                        if (attribute === model.elements['core.Element.name'] ||
                            attribute === model.elements['core.Element.instanceOf']) return;

                        if (attribute.type.is(model.elements['core.type.Boolean'])) {
                            element[attribute.name] = (e[attribute.name] || false);
                            return;
                        }

                        if (attribute.type.isInstanceOf(model.elements['core.type.Type'])) {
                            return element[attribute.name] = e[attribute.name];
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
                                element[attribute.name] = values;
                            }
                            else {
                                var value = model.elements[e[attribute.name]] || elements[e[attribute.name]];
                                if (value) {
                                    element[attribute.name] = value;
                                }
                            }
                        }
                    });
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

                folder.target.elements = folder.target.elements.concat(root);
                _.extend(model.elements, elements);

                loading = false;
                callback();
            });

            function updateFile(e, file) {
                if (loading) return;
                var element = e.element;
                var json = toJson(element, element.instanceOf);
                delete json.name;
                var content = format.formatString('json', JSON.stringify(json));
                fs.writeFile(folder.path + element.filePath, content, null, function(err) {
                    if (err) return console.log(err);
                    element.file = file;
                });
            }

            function toJson(element, clazz) {
                var json = {};
                _.each(clazz.getAllAttributes(), function(attribute) {
                    if (attribute.multiple) {
                        json[attribute.name] = _.map(element[attribute.name], function(attr) {
                            return jsonValue(attribute, attr);
                        });
                    }
                    else {
                        if (! (attribute.referencedBy && attribute.referencedBy.composition)) {
                            json[attribute.name] = jsonValue(attribute, element[attribute.name]);
                        }
                    }
                });
                return json;
            }

            function jsonValue(attribute, value) {
                if (attribute.type.isInstanceOf(model.elements['core.type.Type'])) return value;
                if (attribute.composition) return toJson(value, attribute.type);
                return value.fullName;
            }

            function updateFolder(e, file) {
                if (loading) return;
                console.log(e);
            }

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
                                elements: [],
                                folder: file
                            };
                            pkg.elements.push(subPkg);
                            loadPkg(path + '/' + file.name, subPkg, done);
                            break;
                        case 'application/json':
                            fs.readFile(path + '/' + file.name, function(err, data) {
                                if (err) return callback(err);
                                var element = JSON.parse(data);
                                element.name = file.name.slice(0, -5);
                                element.file = file;
                                pkg.elements.push(element);

                                var iconPath = path + '/' + file.name.slice(0, -5) + '-icon.png';
                                fs.exists(iconPath, function(exists) {
                                    if (exists) {
                                        element.icon = iconPath;
                                    }
                                    done();
                                });
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