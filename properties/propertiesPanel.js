/* global _ */
define(function(require, exports, module) {
    main.consumes = ["Panel", "Datagrid", "vfs", "metaburger.model"];
    main.provides = ["metaburger.propertiesPanel"];
    return main;

    function main(options, imports, register) {
        var Panel = imports.Panel;
        var Datagrid = imports.Datagrid;
        var vfs = imports.vfs;
        var model = imports['metaburger.model'];

        var plugin = new Panel("epotvin", main.consumes, {
            index: options.index || 100,
            caption: "Properties",
            minWidth: 130,
            where: options.where || "right"
        });

        var grid;

        plugin.on('load', function() {});

        plugin.on('draw', function(e) {
            grid = new Datagrid({
                container: e.html,
                columns: [{
                    value: 'label',
                    caption: "Property",
                    width: "50%",
                    type: 'tree'
                }, {
                    caption: "Value",
                    getText: function(node) {
                        if (node.getValue) {
                            return node.getValue();
                        }
                        return node.value || '';
                    },
                    width: "50%",
                    editor: "textbox"
                }],
                enableRename: true,
                getIconHTML: function(node) {
                    if (node.clazz) {
                        var iconPath = node.clazz.getIcon() || node.clazz.instanceOf.getIcon();
                        var url = vfs.url(iconPath);
                        return '<span class="dbgVarIcon" style="background-image: url(' + url + ')"></span>';
                    }
                    return '';
                },
                getCaptionHTML: function(node) {
                    if (node.getLabel) return node.getLabel();
                    return node.label;
                }
            }, plugin);

            grid.on('afterRename', function(e) {
                e.node.element[e.node.attribute.name] = e.value;
                grid.refresh(true);
            });

            model.on('select', function(e) {
                loadElement(e.element);
            });

        });

        plugin.on("unload", function() {
            grid.unload();
        });

        function loadElement(element) {
            var items = _.map(element.instanceOf.getAllClasses(), function(clazz) {
                return {
                    label: clazz.fullName,
                    clazz: clazz,
                    isOpen: true,
                    items: _.map(clazz.attributes, function(attribute) {
                        return {
                            element: element,
                            attribute: attribute,
                            getLabel: function() {
                                return attribute.name;
                            },
                            getValue: function() {
                                return element.getLabel(attribute);
                            },
                            clazz: attribute.type,
                            items: attribute.multiple ? _.map(element[attribute.name], function(value) {
                                return {
                                    label: '',
                                    element: value,
                                    getValue: function() {
                                        return value.fullName;
                                    },
                                    attribute: model.elements['core.Element.fullName']
                                };
                            }) : null
                        };
                    })
                };
            });

            items.push({
                label: 'References',
                isOpen: true,
                items: _.map(element.refs, function(ref) {
                    return {
                        getLabel: function() {
                            return ref.element.fullName;
                        },
                        getValue: function() {
                            return ref.attribute.fullName;
                        }
                    };
                })
            });

            grid.setRoot({
                label: "root",
                items: items
            });
        }

        register(null, {
            "metaburger.propertiesPanel": plugin
        });
    }
});