/* global _*/
define(function(require, exports, module) {
    main.consumes = ["Plugin", "fs", "core"];
    main.provides = ["filePersister"];
    return main;

    function main(options, imports, register) {
        var Plugin = imports.Plugin;
        var fs = imports.fs;
        var core = imports.core;

        var filePersister = new Plugin('epotvin', main.consumes);

        filePersister.loadFolder = function(model, folderName) {
            
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
                            var subPkg = new core.Package(file.name);
                            subPkg.instanceOf = 'core.Package';
                            subPkg.elements = [];
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
                        callback();
                    }
                }

            });
        }
        
        function mapElement(location, element) {
            var fullName = (location ? location + '.' : '') + element.name;
            element.fullName = fullName;
//            model.elements[fullName] = element;
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
        
        register(null, {
            "filePersister": filePersister
        });

    }
});