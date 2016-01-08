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

        model.select = function(element) {
            model.selected = element;
            emit('select', {
                element: element
            });
        };
        
        function loadPkg(path, pkg, callback) {
            fs.readdir(path, function(err, files) {
                if (err) return callback(err);

                _.each(files, function(file) {
                    if (file.name.substring(0, 1) === '.') {
                        return;
                    }

                    switch (file.mime) {
                        case 'inode/directory':
                            var spkg = {
                                name: file.name,
                                instanceOf: 'core.Package',
                                elements: []
                            };
                            pkg.elements.push(spkg);
                            loadPkg(path + '/' + file.name, spkg, done);
                            break;
                        case 'application/json':
                            fs.readFile(path + '/' + file.name, function(err, data) {
                                if (err) return callback(err);
                                pkg.elements.push(JSON.parse(data));
                                done();
                            });
                            break;
                        default:
                            done();
                    }

                    function done(err) {
                        if (err) return callback(err);
                        if (files[files.length - 1] === file) {
                            callback();
                        }
                    }
                });
            });
        }

        loadPkg('', model.root, function(err) {
            if (err) return console.log(err);
            emit('loaded');
        });

        register(null, {
            "model": model
        });

    }
});