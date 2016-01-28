/* global _*/
define(function(require, exports, module) {
    main.consumes = ["Plugin", "fs", "format.jsbeautify", "metaburger.core"];
    main.provides = ["metaburger.persister"];
    return main;

    function main(options, imports, register) {
        var Plugin = imports.Plugin;
        var fs = imports.fs;
        var format = imports['format.jsbeautify'];
        var core = imports['metaburger.core'];

        var persister = new Plugin('epotvin', main.consumes);

        var loading = false;

        persister.loadFolder = function(folder, models, callback) {

            var model;

            var tryMaps = [];
            var lastTries = 0;

            loading = true;
            readDir(folder, function(err, dir) {
                if (err) {
                    loading = false;
                    return callback(err);
                }

                mapModel(dir);
                while (tryMaps.length > 0 && tryMaps.length != lastTries) {
                    lastTries = tryMaps.length;

                    var successes = [];
                    _.each(tryMaps, function(tryMap) {
                        if (tryMap()) {
                            successes.push(tryMap);
                        }
                    });
                    tryMaps = _.difference(tryMaps, successes);
                }

                updateOriginal(model);
                loading = false;
                callback(null, model);
            });

            function tryMap(func) {
                if (!func()) {
                    tryMaps.push(func);
                }
            }

            function mapModel(dir) {
                model = core.newModel();
                var containerFile = dir.files['container.json'];
                if (containerFile) {
                    model.name = containerFile.name;
                    model.version = containerFile.version;
                    _.each(containerFile.dependencies, function(version, dependency) {
                        model.dependencies.push(_.findWhere(models, {
                            name: dependency
                        }));
                    });
                }

                model.elements = [];

                _.each(dir.folders, function(folder, name) {
                    folder.name = name;
                    mapContainer(folder, model, function(container) {
                        model.elements.push(container);
                    });
                });

                _.each(dir.files, function(file, name) {
                    if (name === 'container.json') return;
                    if (name.endsWith('.json')) {
                        file.name = name.slice(0, -5);
                        mapElement(file, model, function(element) {
                            model.elements.push(element);
                            element.icon = dir.files[element.name + '-icon.png'];
                        });
                    }
                });

                model.folder = folder;
            }

            function mapElement(src, parent, callback) {
                tryMap(function() {
                    var clazz = model.element(src.instanceOf);
                    if (!clazz) return false;
                    var element = core.newInstance(model, clazz);
                    _.each(clazz.getAllAttributes(), function(attribute) {
                        if (attribute.type.isInstanceOf(model.element('core.type.Type'))) {
                            return element.set(attribute, src[attribute.name]);
                        }
                        if (attribute.referencedBy && attribute.referencedBy.composition) {
                            return element.set(attribute, parent);
                        }
                        if (attribute.multiple) {
                            _.each(src[attribute.name], function(value) {
                                if (attribute.composition) {
                                    mapElement(value, element, function(subElement) {
                                        element.get(attribute).add(subElement);
                                    });
                                }
                                else {
                                    tryMap(function() {
                                        var subElement = model.element(value);
                                        if (subElement) {
                                            element.get(attribute).add(subElement);
                                            return true;
                                        }
                                        return false;
                                    });
                                }
                            });
                        }
                        else {
                            if (src[attribute.name]) {
                                if (attribute.composition) {
                                    mapElement(src[attribute.name], element, function(value) {
                                        element.set(attribute, value);
                                    });
                                }
                                else {
                                    tryMap(function() {
                                        var subElement = model.element(src[attribute.name]);
                                        if (subElement) {
                                            element.set(attribute, subElement);
                                            return true;
                                        }
                                        return false;
                                    });
                                }
                            }
                        }
                    });
                    callback(element);
                    return true;
                });
            }

            function mapContainer(dir, parent, callback) {
                var container = new core.Package();
                container.name = dir.name;
                container.model = model;
                container.container = parent;

                var containerFile = dir.files['container.json'];

                if (containerFile) {
                    container.instanceOf = containerFile.instanceOf;
                }
                else {
                    container.instanceOf = model.element('core.Package');
                }

                _.each(dir.folders, function(folder, name) {
                    folder.name = name;
                    mapContainer(folder, container, function(element) {
                        container.elements.add(element);
                    });
                });

                _.each(dir.files, function(file, name) {
                    if (name === 'container.json') return;
                    if (name.endsWith('.json')) {
                        file.name = name.slice(0, -5);
                        mapElement(file, container, function(element) {
                            container.elements.add(element);
                            element.icon = dir.files[element.name + '-icon.png'];
                        });
                    }
                });
                callback(container);
            }

            function updateOriginal(element) {
                element.original = toJson(element);
                _.each(element.instanceOf.getAllAttributes(), function(attribute) {
                    if (attribute.composition && !attribute.type.isInstanceOf('core.type.Type')) {
                        if (attribute.multiple) {
                            _.each(element.get(attribute), function(value) {
                                updateOriginal(value);
                            });
                        }
                        else {
                            updateOriginal(element);
                        }
                    }
                });

                element.on('changed', function() {
                    if (loading) return;

                    var checked = [];

                    function checkChanges(element) {
                        checked.push(element);
                        if (!_.isEqual(element.original, toJson(element))) {
                            updateFile(element, element.original, function(err) {
                                if (err) return console.log(err);
                            });
                            _.each(element.refs, function(ref) {
                                if (!_.contains(checked, ref.element)) {
                                    checkChanges(ref.element);
                                }
                            });
                            element.original = toJson(element);
                            return true;
                        }
                        return false;
                    }

                    if (checkChanges(element)) model.emit('changed');
                });
            }

            function toJson(element) {
                var json = {};
                _.each(element.instanceOf.getAllAttributes(), function(attribute) {
                    if (attribute.readOnly) return;
                    if (attribute === element.model.element('core.Container.elements')) return;
                    if (element.get(attribute) && attribute != model.element('core.Class.icon')) {
                        if (attribute.multiple) {
                            if (element.get(attribute)[0]) {
                                json[attribute.name] = _.map(element.get(attribute), function(value) {
                                    return jsonValue(attribute, value);
                                });
                            }
                        }
                        else {
                            if (!(attribute.referencedBy && attribute.referencedBy.composition)) {
                                json[attribute.name] = jsonValue(attribute, element.get(attribute));
                            }
                        }
                    }
                });
                return json;
            }

            function jsonValue(attribute, value) {
                if (attribute.type.isInstanceOf(model.element('core.type.Type'))) return value;
                if (attribute.composition) return toJson(value, attribute.type);
                return value.fullName;
            }

            function updateFile(element, original, callback) {
                var json = toJson(element);
                if (element.isInstanceOf('core.RootElement')) {
                    delete json.name;
                    var content = format.formatString('json', JSON.stringify(json));
                    fs.writeFile(element.model.folder + element.filePath, content, null, function(err) {
                        if (err) return callback(err);
                        if (original.name !== element.name) {
                            fs.rmfile(element.model.folder + element.folder + '/' + original.name + '.json', callback);
                        }
                    });
                }
                else {
                    callback();
                }
            }

            function updateFolder(element) {
                if (loading) return;
                element.original = toJson(element);
            }



        };

        function loadPkg(path, pkg, callback) {
            readDir(path, function(err, dir) {
                if (err) return callback(err);

            });
        }

        function readDir(path, callback) {
            var dir = {
                files: {},
                folders: {}
            };

            var readFiles = 0;
            var totalFiles = 0;

            fs.readdir(path, function(err, files) {
                if (err) return callback(err);

                totalFiles = files.length;

                _.each(files, function(file) {
                    switch (file.mime) {
                        case 'inode/directory':
                            readDir(path + '/' + file.name, function(err, subdir) {
                                if (err) return done(err);
                                dir.folders[file.name] = subdir;
                                done();
                            });
                            break;
                        case 'application/json':
                            fs.readFile(path + '/' + file.name, function(err, data) {
                                if (err) return done(err);
                                dir.files[file.name] = JSON.parse(data);
                                done();
                            });
                            break;
                        default:
                            if (!file.name.substring(0, 1) === '.') {
                                dir.files[file.name] = path + '/' + file.name;
                            }
                            done();
                    }

                });
            });

            function done(err) {
                if (err) return callback(err);
                if (++readFiles == totalFiles) {
                    callback(null, dir);
                }
            }

        }
        register(null, {
            "metaburger.persister": persister
        });

    }
});