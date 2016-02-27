/* global _ */
define(function(require, exports, module) {
    main.consumes = ["Plugin", "metaburger", "Wizard", "WizardPage", "Form"];
    main.provides = ["metaburger.addwizard"];
    return main;

    function main(options, imports, register) {
        var Plugin = imports.Plugin;
        var Wizard = imports.Wizard;
        var WizardPage = imports.WizardPage;
        var Form = imports.Form;

        var plugin = new Plugin('epotvin', main.consumes);

        plugin.add = function(element, attribute) {
            var wizard = new Wizard("epotvin", main.consumes, {
                title: "New " + attribute.type.name,
                allowClose: true,
                height: 200
            });

            wizard.on("draw", function(e) {
                var firstPage = new WizardPage({
                    name: "first",
                class: "panel-bar"
                }, wizard);

                firstPage.on("draw", function(e) {
                    var form = new Form({
                        html: e.html,
                        edge: "10 10 10 10"
                    });
                    form.add([{
                        title: "What is your favorite color?",
                        type: "dropdown",
                        items: [{
                            caption: "Red",
                            value: "red"
                        }, {
                            caption: "Green",
                            value: "green"
                        }, {
                            caption: "Blue",
                            value: "blue"
                        }, {
                            caption: "Orange",
                            value: "orange"
                        }]
                    }]);
                });

                wizard.startPage = firstPage;
            });

            wizard.show();
        };

        plugin.on('load', function() {});
        plugin.on('unload', function() {});
        register(null, {
            "metaburger.addwizard": plugin
        });
    }
});