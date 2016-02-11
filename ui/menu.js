/* global _ */
define(function(require, exports, module) {
    main.consumes = ["Plugin", "Menu", "MenuItem", "metaburger"];
    main.provides = ["metaburger.menu"];
    return main;

    function main(options, imports, register) {
        var Plugin = imports.Plugin;
        var Menu = imports.Menu;
        var MenuItem = imports.MenuItem;
        var metaburger = imports.metaburger;

        var plugin = new Plugin('epotvin', main.consumes);

        plugin.on('load', function() {

        });

        plugin.getMenu = function(element) {
            var menu = new Menu({
                items: [
                    new MenuItem({
                        caption: "Add...",
                        submenu: addMenu(element)
                    })
                ]
            }, plugin);

            return menu;
        };

        function addMenu(element) {
            var menu = Menu({}, plugin);
            _.each(element.instanceOf.getAllAttributes(), function(attribute) {
                if (attribute.multiple && attribute.composition) {
                    menu.append(new MenuItem({
                        caption: attribute.type.name
                    }));
                }
            });
            return menu;
        }

        plugin.on('unload', function() {});

        register(null, {
            "metaburger.menu": plugin
        });
    }
});