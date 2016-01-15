/* global _ */
define(function(require, exports, module) {
    "use strict";
    class Element {
        constructor(name, model) {
            this.name = name;
            this.model = model;
            this.values = {};
            this.refs = [];
        }

        isInstanceOf(clazz) {
            return this.instanceOf.is(clazz);
        }

        getLabel(attribute) {
            if (!attribute) return this.name;
            if (attribute.type.isInstanceOf(this.model.elements['core.type.Type'])) {
                return this[attribute.name] != undefined ? this[attribute.name].toString() : '';
            }
            if (attribute.multiple) {
                return '[' + _.reduce(this[attribute.name], function(memo, attribute) {
                    if (memo.length > 0) {
                        memo += ', ';
                    }
                    return memo += attribute.fullName;
                }, '') + ']';
            }
            else {
                return this[attribute.name] ? this[attribute.name].fullName : null;
            }
        }

        set instanceOf(clazz) {
            this.values.instanceOf = clazz;
            clazz.addRef(this, this.model.elements['core.Element.instanceOf']);
            _.each(clazz.getAllAttributes(), function(attribute) {
                if (attribute != this.model.elements['core.Element.name'] && attribute != this.model.elements['core.Element.instanceOf']) {
                    this.defineAttribute(attribute);
                }
            }, this);
        }

        get instanceOf() {
            return this.values.instanceOf;
        }

        defineAttribute(attribute) {
            if (!Object.getOwnPropertyDescriptor(Object.getPrototypeOf(this), attribute.name)) {
                Object.defineProperty(Object.getPrototypeOf(this), attribute.name, {
                    set: function(value) {
                        this.values[attribute.name] = value;
                        if (Array.isArray(value)) {
                            _.each(value, function(v) {
                                v && v.addRef && v.addRef(this, attribute);
                            }, this);
                        }
                        else {
                            value && value.addRef && value.addRef(this, attribute);
                        }
                    },
                    get: function() {
                        return this.values[attribute.name];
                    }
                });
            }
        }

        addRef(element, attribute) {
            var ref = {
                element: element,
                attribute: attribute
            };
            if (!_.where(this.refs, ref)[0]) {
                this.refs.push(ref);
            }
        }

        removeRef(element, attribute) {
            this.refs = _.reject(this.refs, function(ref) {
                return ref.element === element && ref.attribute === attribute;
            });
        }
    }
    module.exports = Element;
});