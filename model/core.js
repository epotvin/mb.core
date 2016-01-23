/* global _ */
define(function(require, exports, module) {
    main.consumes = ["Plugin"];
    main.provides = ["metaburger.core"];
    return main;

    function main(options, imports, register) {
        'use strict';
        var Plugin = imports.Plugin;

        var plugin = new Plugin("epotvin", main.consumes);

        plugin.Class = require('./core/Class');
        plugin.Element = require('./core/Element');
        plugin.Model = require('./core/Model');
        plugin.Package = require('./core/Package');
        plugin.RootElement = require('./core/RootElement');
        plugin.Attribute = require('./core/Attribute');
        plugin.type = {
            Type: require('./core/type/Type')
        };

        plugin.on('load', function() {});
        plugin.on('unload', function() {});

        plugin.loadModel = function() {

            var model = new plugin.Model();
            model.model = model;
            var core = new plugin.Package(model);
            var core_Model = new plugin.Class(model);
            var core_Container = new plugin.Class(model);
            var core_Container_elements = new plugin.Attribute(model);
            var core_Element = new plugin.Class(model);
            var core_Element_name = new plugin.Attribute(model);
            var core_Element_instanceOf = new plugin.Attribute(model);
            var core_Element_model = new plugin.Attribute(model);
            var core_RootElement = new plugin.Class(model);
            var core_RootElement_container = new plugin.Attribute(model);
            var core_Class = new plugin.Class(model);
            var core_Class_abstract = new plugin.Attribute(model);
            var core_Class_extends = new plugin.Attribute(model);
            var core_Class_attributes = new plugin.Attribute(model);
            var core_Class_icon = new plugin.Attribute(model);
            var core_Attribute = new plugin.Class(model);
            var core_Attribute_type = new plugin.Attribute(model);
            var core_Attribute_mandatory = new plugin.Attribute(model);
            var core_Attribute_composition = new plugin.Attribute(model);
            var core_Attribute_multiple = new plugin.Attribute(model);
            var core_Attribute_readOnly = new plugin.Attribute(model);
            var core_Attribute_referencedBy = new plugin.Attribute(model);
            var core_Attribute_owner = new plugin.Attribute(model);
            var core_Package = new plugin.Class(model);
            var core_type = new plugin.Package(model);
            var core_type_Type = new plugin.Class(model);
            var core_type_String = new plugin.type.Type(model);
            var core_type_Number = new plugin.type.Type(model);
            var core_type_Boolean = new plugin.type.Type(model);

            model.values = [{
                attribute: core_Element_name,
                value: 'Core'
            }, {
                attribute: core_Element_instanceOf,
                value: core_Model
            }, {
                attribute: core_Element_model,
                value: model
            }, {
                attribute: core_Container_elements,
                value: [
                    core
                ]
            }];

            core.values = [{
                attribute: core_Element_name,
                value: 'core'
            }, {
                attribute: core_Element_instanceOf,
                value: core_Package
            }, {
                attribute: core_Element_model,
                value: model
            }, {
                attribute: core_RootElement_container,
                value: model
            }, {
                attribute: core_Container_elements,
                value: [
                    core_Model,
                    core_Element,
                    core_Attribute,
                    core_Class,
                    core_RootElement,
                    core_Package,
                    core_Container,
                    core_type
                ]
            }];

            core_Model.values = [{
                attribute: core_Element_name,
                value: 'Model'
            }, {
                attribute: core_Element_instanceOf,
                value: core_Class
            }, {
                attribute: core_Element_model,
                value: model
            }, {
                attribute: core_Class_abstract,
                value: false
            }, {
                attribute: core_Class_extends,
                value: [
                    core_Container,
                    core_Element
                ]
            }, {
                attribute: core_RootElement_container,
                value: core
            }];

            core_Container.values = [{
                attribute: core_Element_name,
                value: 'Container'
            }, {
                attribute: core_Element_instanceOf,
                value: core_Class
            }, {
                attribute: core_Element_model,
                value: model
            }, {
                attribute: core_Class_abstract,
                value: true
            }, {
                attribute: core_Class_attributes,
                value: [
                    core_Container_elements
                ]
            }, {
                attribute: core_RootElement_container,
                value: core
            }];

            core_Container_elements.values = [{
                attribute: core_Element_name,
                value: 'elements'
            }, {
                attribute: core_Element_instanceOf,
                value: core_Attribute
            }, {
                attribute: core_Element_model,
                value: model
            }, {
                attribute: core_Attribute_type,
                value: core_Element
            }, {
                attribute: core_Attribute_mandatory,
                value: false
            }, {
                attribute: core_Attribute_composition,
                value: true
            }, {
                attribute: core_Attribute_multiple,
                value: true
            }, {
                attribute: core_Attribute_readOnly,
                value: false
            }, {
                attribute: core_Attribute_owner,
                value: core_Container
            }, {
                attribute: core_Attribute_referencedBy,
                value: core_RootElement_container
            }];

            core_Element.values = [{
                attribute: core_Element_name,
                value: 'Element'
            }, {
                attribute: core_Element_instanceOf,
                value: core_Class
            }, {
                attribute: core_Element_model,
                value: model
            }, {
                attribute: core_Class_abstract,
                value: true
            }, {
                attribute: core_Class_attributes,
                value: [
                    core_Element_name,
                    core_Element_instanceOf,
                    core_Element_model
                ]
            }, {
                attribute: core_RootElement_container,
                value: core
            }, {
                attribute: core_Class_icon,
                value: '/coremodels/core/Element-icon.png'
            }];

            core_Element_name.values = [{
                attribute: core_Element_name,
                value: 'name'
            }, {
                attribute: core_Element_instanceOf,
                value: core_Attribute
            }, {
                attribute: core_Element_model,
                value: model
            }, {
                attribute: core_Attribute_type,
                value: core_type_String
            }, {
                attribute: core_Attribute_mandatory,
                value: true
            }, {
                attribute: core_Attribute_composition,
                value: true
            }, {
                attribute: core_Attribute_multiple,
                value: false
            }, {
                attribute: core_Attribute_readOnly,
                value: false
            }, {
                attribute: core_Attribute_owner,
                value: core_Element
            }];

            core_Element_instanceOf.values = [{
                attribute: core_Element_name,
                value: 'instanceOf'
            }, {
                attribute: core_Element_instanceOf,
                value: core_Attribute
            }, {
                attribute: core_Element_model,
                value: model
            }, {
                attribute: core_Attribute_type,
                value: core_Class
            }, {
                attribute: core_Attribute_mandatory,
                value: true
            }, {
                attribute: core_Attribute_composition,
                value: false
            }, {
                attribute: core_Attribute_multiple,
                value: false
            }, {
                attribute: core_Attribute_readOnly,
                value: true
            }, {
                attribute: core_Attribute_owner,
                value: core_Element
            }];

            core_Element_model.values = [{
                attribute: core_Element_name,
                value: 'model'
            }, {
                attribute: core_Element_instanceOf,
                value: core_Attribute
            }, {
                attribute: core_Element_model,
                value: model
            }, {
                attribute: core_Attribute_type,
                value: core_Model
            }, {
                attribute: core_Attribute_mandatory,
                value: true
            }, {
                attribute: core_Attribute_composition,
                value: false
            }, {
                attribute: core_Attribute_multiple,
                value: false
            }, {
                attribute: core_Attribute_readOnly,
                value: true
            }, {
                attribute: core_Attribute_owner,
                value: core_Element
            }];

            core_RootElement.values = [{
                attribute: core_Element_name,
                value: 'RootElement'
            }, {
                attribute: core_Element_instanceOf,
                value: core_Class
            }, {
                attribute: core_Element_model,
                value: model
            }, {
                attribute: core_Class_abstract,
                value: true
            }, {
                attribute: core_Class_attributes,
                value: [
                    core_RootElement_container
                ]
            }, {
                attribute: core_RootElement_container,
                value: core
            }, {
                attribute: core_Class_extends,
                value: [
                    core_Element
                ]
            }];

            core_RootElement_container.values = [{
                attribute: core_Element_name,
                value: 'container'
            }, {
                attribute: core_Element_instanceOf,
                value: core_Attribute
            }, {
                attribute: core_Element_model,
                value: model
            }, {
                attribute: core_Attribute_type,
                value: core_Class
            }, {
                attribute: core_Attribute_mandatory,
                value: true
            }, {
                attribute: core_Attribute_composition,
                value: false
            }, {
                attribute: core_Attribute_multiple,
                value: false
            }, {
                attribute: core_Attribute_readOnly,
                value: false
            }, {
                attribute: core_Attribute_owner,
                value: core_RootElement
            }, {
                attribute: core_Attribute_referencedBy,
                value: core_Container_elements
            }];

            core_Class.values = [{
                attribute: core_Element_name,
                value: 'Class'
            }, {
                attribute: core_Element_instanceOf,
                value: core_Class
            }, {
                attribute: core_Element_model,
                value: model
            }, {
                attribute: core_Class_abstract,
                value: true
            }, {
                attribute: core_Class_attributes,
                value: [
                    core_Class_abstract,
                    core_Class_attributes,
                    core_Class_extends,
                    core_Class_icon
                ]
            }, {
                attribute: core_RootElement_container,
                value: core
            }, {
                attribute: core_Class_extends,
                value: [
                    core_RootElement
                ]
            }, {
                attribute: core_Class_icon,
                value: '/coremodels/core/Class-icon.png'
            }];

            core_Class_abstract.values = [{
                attribute: core_Element_name,
                value: 'abstract'
            }, {
                attribute: core_Element_instanceOf,
                value: core_Attribute
            }, {
                attribute: core_Element_model,
                value: model
            }, {
                attribute: core_Attribute_type,
                value: core_type_Boolean
            }, {
                attribute: core_Attribute_mandatory,
                value: true
            }, {
                attribute: core_Attribute_composition,
                value: false
            }, {
                attribute: core_Attribute_multiple,
                value: false
            }, {
                attribute: core_Attribute_readOnly,
                value: false
            }, {
                attribute: core_Attribute_owner,
                value: core_Class
            }];

            core_Class_extends.values = [{
                attribute: core_Element_name,
                value: 'extends'
            }, {
                attribute: core_Element_instanceOf,
                value: core_Attribute
            }, {
                attribute: core_Element_model,
                value: model
            }, {
                attribute: core_Attribute_type,
                value: core_type_Boolean
            }, {
                attribute: core_Attribute_mandatory,
                value: true
            }, {
                attribute: core_Attribute_composition,
                value: false
            }, {
                attribute: core_Attribute_multiple,
                value: false
            }, {
                attribute: core_Attribute_readOnly,
                value: false
            }, {
                attribute: core_Attribute_owner,
                value: core_Class
            }];

            core_Class_attributes.values = [{
                attribute: core_Element_name,
                value: 'attributes'
            }, {
                attribute: core_Element_instanceOf,
                value: core_Attribute
            }, {
                attribute: core_Element_model,
                value: model
            }, {
                attribute: core_Attribute_type,
                value: core_Attribute
            }, {
                attribute: core_Attribute_mandatory,
                value: false
            }, {
                attribute: core_Attribute_composition,
                value: true
            }, {
                attribute: core_Attribute_multiple,
                value: true
            }, {
                attribute: core_Attribute_readOnly,
                value: false
            }, {
                attribute: core_Attribute_owner,
                value: core_Class
            }];

            core_Class_icon.values = [{
                attribute: core_Element_name,
                value: 'icon'
            }, {
                attribute: core_Element_instanceOf,
                value: core_Attribute
            }, {
                attribute: core_Element_model,
                value: model
            }, {
                attribute: core_Attribute_type,
                value: core_type_String
            }, {
                attribute: core_Attribute_mandatory,
                value: false
            }, {
                attribute: core_Attribute_composition,
                value: true
            }, {
                attribute: core_Attribute_multiple,
                value: false
            }, {
                attribute: core_Attribute_readOnly,
                value: false
            }, {
                attribute: core_Attribute_owner,
                value: core_Class
            }];

            core_Attribute.values = [{
                attribute: core_Element_name,
                value: 'Attribute'
            }, {
                attribute: core_Element_instanceOf,
                value: core_Class
            }, {
                attribute: core_Element_model,
                value: model
            }, {
                attribute: core_Class_abstract,
                value: false
            }, {
                attribute: core_Class_attributes,
                value: [
                    core_Attribute_composition,
                    core_Attribute_mandatory,
                    core_Attribute_multiple,
                    core_Attribute_owner,
                    core_Attribute_readOnly,
                    core_Attribute_referencedBy,
                    core_Attribute_type
                ]
            }, {
                attribute: core_RootElement_container,
                value: core
            }, {
                attribute: core_Class_extends,
                value: [
                    core_Element
                ]
            }, {
                attribute: core_Class_icon,
                value: '/coremodels/core/Attribute-icon.png'
            }];

            core_Attribute_type.values = [{
                attribute: core_Element_name,
                value: 'type'
            }, {
                attribute: core_Element_instanceOf,
                value: core_Attribute
            }, {
                attribute: core_Element_model,
                value: model
            }, {
                attribute: core_Attribute_type,
                value: core_Class
            }, {
                attribute: core_Attribute_mandatory,
                value: true
            }, {
                attribute: core_Attribute_composition,
                value: false
            }, {
                attribute: core_Attribute_multiple,
                value: false
            }, {
                attribute: core_Attribute_readOnly,
                value: false
            }, {
                attribute: core_Attribute_owner,
                value: core_Attribute
            }];

            core_Attribute_mandatory.values = [{
                attribute: core_Element_name,
                value: 'mandatory'
            }, {
                attribute: core_Element_instanceOf,
                value: core_Attribute
            }, {
                attribute: core_Element_model,
                value: model
            }, {
                attribute: core_Attribute_type,
                value: core_type_Boolean
            }, {
                attribute: core_Attribute_mandatory,
                value: true
            }, {
                attribute: core_Attribute_composition,
                value: false
            }, {
                attribute: core_Attribute_multiple,
                value: false
            }, {
                attribute: core_Attribute_readOnly,
                value: false
            }, {
                attribute: core_Attribute_owner,
                value: core_Attribute
            }];

            core_Attribute_composition.values = [{
                attribute: core_Element_name,
                value: 'composition'
            }, {
                attribute: core_Element_instanceOf,
                value: core_Attribute
            }, {
                attribute: core_Element_model,
                value: model
            }, {
                attribute: core_Attribute_type,
                value: core_type_Boolean
            }, {
                attribute: core_Attribute_mandatory,
                value: true
            }, {
                attribute: core_Attribute_composition,
                value: false
            }, {
                attribute: core_Attribute_multiple,
                value: false
            }, {
                attribute: core_Attribute_readOnly,
                value: false
            }, {
                attribute: core_Attribute_owner,
                value: core_Attribute
            }];

            core_Attribute_multiple.values = [{
                attribute: core_Element_name,
                value: 'multiple'
            }, {
                attribute: core_Element_instanceOf,
                value: core_Attribute
            }, {
                attribute: core_Element_model,
                value: model
            }, {
                attribute: core_Attribute_type,
                value: core_type_Boolean
            }, {
                attribute: core_Attribute_mandatory,
                value: true
            }, {
                attribute: core_Attribute_composition,
                value: false
            }, {
                attribute: core_Attribute_multiple,
                value: false
            }, {
                attribute: core_Attribute_readOnly,
                value: false
            }, {
                attribute: core_Attribute_owner,
                value: core_Attribute
            }];

            core_Attribute_readOnly.values = [{
                attribute: core_Element_name,
                value: 'readOnly'
            }, {
                attribute: core_Element_instanceOf,
                value: core_Attribute
            }, {
                attribute: core_Element_model,
                value: model
            }, {
                attribute: core_Attribute_type,
                value: core_type_Boolean
            }, {
                attribute: core_Attribute_mandatory,
                value: true
            }, {
                attribute: core_Attribute_composition,
                value: false
            }, {
                attribute: core_Attribute_multiple,
                value: false
            }, {
                attribute: core_Attribute_readOnly,
                value: false
            }, {
                attribute: core_Attribute_owner,
                value: core_Attribute
            }];

            core_Attribute_referencedBy.values = [{
                attribute: core_Element_name,
                value: 'referencedBy'
            }, {
                attribute: core_Element_instanceOf,
                value: core_Attribute
            }, {
                attribute: core_Element_model,
                value: model
            }, {
                attribute: core_Attribute_type,
                value: core_Attribute
            }, {
                attribute: core_Attribute_mandatory,
                value: false
            }, {
                attribute: core_Attribute_composition,
                value: false
            }, {
                attribute: core_Attribute_multiple,
                value: false
            }, {
                attribute: core_Attribute_readOnly,
                value: false
            }, {
                attribute: core_Attribute_owner,
                value: core_Attribute
            }];

            core_Attribute_owner.values = [{
                attribute: core_Element_name,
                value: 'owner'
            }, {
                attribute: core_Element_instanceOf,
                value: core_Attribute
            }, {
                attribute: core_Element_model,
                value: model
            }, {
                attribute: core_Attribute_type,
                value: core_Class
            }, {
                attribute: core_Attribute_mandatory,
                value: true
            }, {
                attribute: core_Attribute_composition,
                value: false
            }, {
                attribute: core_Attribute_multiple,
                value: false
            }, {
                attribute: core_Attribute_readOnly,
                value: false
            }, {
                attribute: core_Attribute_owner,
                value: core_Attribute
            }, {
                attribute: core_Attribute_referencedBy,
                value: core_Class_attributes
            }];

            core_Package.values = [{
                attribute: core_Element_name,
                value: 'Package'
            }, {
                attribute: core_Element_instanceOf,
                value: core_Class
            }, {
                attribute: core_Element_model,
                value: model
            }, {
                attribute: core_Class_abstract,
                value: false
            }, {
                attribute: core_RootElement_container,
                value: core
            }, {
                attribute: core_Class_extends,
                value: [
                    core_RootElement,
                    core_Container
                ]
            }, {
                attribute: core_Class_icon,
                value: '/coremodels/core/Package-icon.png'
            }];

            core_type.values = [{
                attribute: core_Element_name,
                value: 'type'
            }, {
                attribute: core_Element_instanceOf,
                value: core_Package
            }, {
                attribute: core_Element_model,
                value: model
            }, {
                attribute: core_Container_elements,
                value: [
                    core_type_Type,
                    core_type_Boolean,
                    core_type_Number,
                    core_type_String
                ]
            }, {
                attribute: core_RootElement_container,
                value: core
            }];

            core_type_Type.values = [{
                attribute: core_Element_name,
                value: 'Type'
            }, {
                attribute: core_Element_instanceOf,
                value: core_Class
            }, {
                attribute: core_Element_model,
                value: model
            }, {
                attribute: core_Class_abstract,
                value: false
            }, {
                attribute: core_RootElement_container,
                value: core_type
            }, {
                attribute: core_Class_extends,
                value: [
                    core_Class
                ]
            }];

            core_type_String.values = [{
                attribute: core_Element_name,
                value: 'String'
            }, {
                attribute: core_Element_instanceOf,
                value: core_type_Type
            }, {
                attribute: core_Element_model,
                value: model
            }, {
                attribute: core_Class_abstract,
                value: false
            }, {
                attribute: core_RootElement_container,
                value: core_type
            }];

            core_type_Boolean.values = [{
                attribute: core_Element_name,
                value: 'Boolean'
            }, {
                attribute: core_Element_instanceOf,
                value: core_type_Type
            }, {
                attribute: core_Element_model,
                value: model
            }, {
                attribute: core_Class_abstract,
                value: false
            }, {
                attribute: core_RootElement_container,
                value: core_type
            }];

            core_type_Number.values = [{
                attribute: core_Element_name,
                value: 'Number'
            }, {
                attribute: core_Element_instanceOf,
                value: core_type_Type
            }, {
                attribute: core_Element_model,
                value: model
            }, {
                attribute: core_Class_abstract,
                value: false
            }, {
                attribute: core_RootElement_container,
                value: core_type
            }];

            Object.defineProperties(plugin.Model.prototype, {
                elements: {
                    get: function() {
                        return this.get(core_Container_elements);
                    },
                    set: function(elements) {
                        this.set(core_Container_elements, elements);
                    }
                }
            });

            Object.defineProperties(plugin.Package.prototype, {
                elements: {
                    get: function() {
                        return this.get(core_Container_elements);
                    },
                    set: function(elements) {
                        this.set(core_Container_elements, elements);
                    }
                }
            });

            Object.defineProperties(plugin.Element.prototype, {
                name: {
                    get: function() {
                        return this.get(core_Element_name);
                    },
                    set: function(name) {
                        this.set(core_Element_name, name);
                    }
                },
                instanceOf: {
                    get: function() {
                        return this.get(core_Element_instanceOf);
                    },
                    set: function(instanceOf) {
                        this.set(core_Element_instanceOf, instanceOf);
                    }
                },
                model: {
                    get: function() {
                        return this.get(core_Element_model);
                    },
                    set: function(model) {
                        this.set(core_Element_model, model);
                    }
                }
            });

            Object.defineProperties(plugin.RootElement.prototype, {
                container: {
                    get: function() {
                        return this.get(core_RootElement_container);
                    },
                    set: function(container) {
                        this.set(core_RootElement_container, container);
                    }
                }
            });

            Object.defineProperties(plugin.Class.prototype, {
                abstract: {
                    get: function() {
                        return this.get(core_Class_abstract);
                    },
                    set: function(abstract) {
                        this.set(core_Class_abstract, abstract);
                    }
                },
                attributes: {
                    get: function() {
                        return this.get(core_Class_attributes);
                    },
                    set: function(attributes) {
                        this.set(core_Class_attributes, attributes);
                    }
                },
                extends: {
                    get: function() {
                        return this.get(core_Class_extends);
                    },
                    set: function(extendz) {
                        this.set(core_Class_extends, extendz);
                    }
                },
                icon: {
                    get: function() {
                        return this.get(core_Class_icon);
                    },
                    set: function(icon) {
                        this.set(core_Class_icon, icon);
                    }
                }
            });

            Object.defineProperties(plugin.Attribute.prototype, {
                composition: {
                    get: function() {
                        return this.get(core_Attribute_composition);
                    },
                    set: function(composition) {
                        this.set(core_Attribute_composition, composition);
                    }
                },
                mandatory: {
                    get: function() {
                        return this.get(core_Attribute_mandatory);
                    },
                    set: function(mandatory) {
                        this.set(core_Attribute_mandatory, mandatory);
                    }
                },
                multiple: {
                    get: function() {
                        return this.get(core_Attribute_multiple);
                    },
                    set: function(multiple) {
                        this.set(core_Attribute_multiple, multiple);
                    }
                },
                owner: {
                    get: function() {
                        return this.get(core_Attribute_owner);
                    },
                    set: function(owner) {
                        this.set(core_Attribute_owner, owner);
                    }
                },
                readOnly: {
                    get: function() {
                        return this.get(core_Attribute_readOnly);
                    },
                    set: function(readOnly) {
                        this.set(core_Attribute_readOnly, readOnly);
                    }
                },
                referencedBy: {
                    get: function() {
                        return this.get(core_Attribute_referencedBy);
                    },
                    set: function(referencedBy) {
                        this.set(core_Attribute_referencedBy, referencedBy);
                    }
                },
                type: {
                    get: function() {
                        return this.get(core_Attribute_type);
                    },
                    set: function(type) {
                        this.set(core_Attribute_type, type);
                    }
                },
            });

            return model;
        };

        register(null, {
            "metaburger.core": plugin
        });
    }
});