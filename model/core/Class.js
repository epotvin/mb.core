/* global _ */
define(function(require, exports, module) {
    "use strict";

    var RootElement = require('./RootElement');

    class Class extends RootElement {

        constructor(name, model, values) {
            super(name, model, values);
        }

        getAllAttributes() {
            var attributes = [];
            _.each(this.extends, function(extended) {
                attributes = attributes.concat(extended.getAllAttributes());
            });
            attributes = attributes.concat(this.attributes);
            return attributes;
        }

        is(clazz) {
            if (typeof clazz === 'string') {
                clazz = this.model.element(clazz);
            }
            if (this === clazz) {
                return true;
            }
            if (this.extends) {
                return _.filter(this.extends, function(extended) {
                    return extended.is(clazz);
                }).length > 0;
            }
            return false;
        }

        getAllClasses() {
            var classes = [];
            if (this.extends) {
                _.each(this.extends, function(extended) {
                    classes = classes.concat(extended.getAllClasses());
                });
            }
            classes.push(this);
            return classes;
        }

        getIcon() {
            var icon = this.icon;
            if (!icon && this.extends) {
                _.each(this.extends, function(extent) {
                    icon = extent.getIcon();
                });
            }
            return icon;
        }

        initProto() {
            var self = this;
            var extended = this.extends[0];
            if (extended) {
                this.proto = class extends extended.proto {
                    constructor(name, model, values) {
                        super(name, model, values);
                        
                        _.each(self.attributes, function(attribute) {
                            Object.defineProperty(this, attribute.name, {
                                set: function(value) {
                                    this.setValue(attribute, value);
                                },
                                get: function() {
                                    return this.getValue(attribute);
                                }
                            });
                        }, this);
                        
                        self.addRef(this, model.elements['core.Element.instanceOf']);
                    }
                    get instanceOf() {
                        return self;
                    }
                };
            }
            else {
                this.proto = class {};
            }
        }
    }

    module.exports = Class;
});