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
                        });
                    }
                });

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
                            var values = [];
                            element.set(attribute, values);
                            _.each(src[attribute.name], function(value) {
                                if (attribute.composition) {
                                    mapElement(value, element, function(subElement) {
                                        values.push(subElement);
                                    });
                                }
                                else {
                                    tryMap(function() {
                                        var subElement = model.element(value);
                                        if (subElement) {
                                            values.push(subElement);
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

                container.elements = [];

                _.each(dir.folders, function(folder, name) {
                    folder.name = name;
                    mapContainer(folder, container, function(element) {
                        container.elements.push(element);
                    });
                });

                _.each(dir.files, function(file, name) {
                    if (name === 'container.json') return;
                    if (name.endsWith('.json')) {
                        file.name = name.slice(0, -5);
                        mapElement(file, container, function(element) {
                            container.elements.push(element);
                        });
                    }
                });
                callback(container);
            }

            function updateFile(element) {
                if (loading) return;
                var json = toJson(element);
                if (element.isInstanceOf('core.RootElement')) delete json.name;
                var content = format.formatString('json', JSON.stringify(json));
                fs.writeFile(folder.path + element.filePath, content, null, function(err) {
                    if (err) return console.log(err);
                });
                if (element.original.name !== element.name) {
                    fs.rmfile(folder.path + element.folder + '/' + element.original.name + '.json', function(err) {
                        if (err) return console.log(err);
                    });
                }
            }

            function updateFolder(element) {
                if (loading) return;
                element.original = toJson(element);
            }

            function toJson(element) {
                var json = {};
                _.each(element.instanceOf.getAllAttributes(), function(attribute) {
                    if (element[attribute.name] && attribute != model.elements['core.Class.icon']) {
                        if (attribute.multiple) {
                            if (element[attribute.name][0]) {
                                json[attribute.name] = _.map(element[attribute.name], function(attr) {
                                    return jsonValue(attribute, attr);
                                });
                            }
                        }
                        else {
                            if (!(attribute.referencedBy && attribute.referencedBy.composition)) {
                                json[attribute.name] = jsonValue(attribute, element[attribute.name]);
                            }
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

                    if (file.name.substring(0, 1) === '.') return done();

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
                                if (err) return callback(err);
                                dir.files[file.name] = JSON.parse(data);
                                done();
                            });
                            break;
                        default:
                            dir.files[file.name] = path + '/' + file.name;
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