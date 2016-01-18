/* global _ */
define(function(require, exports, module) {
    "use strict";
    class Element {
        constructor(name, model) {
            this.model = model;
            this.values = {};
            this.listeners = {};
            this.refs = [];
            this.name = name;
        }

        isInstanceOf(clazz) {
            return this.instanceOf.is(clazz);
        }

        getLabel(attribute) {
            if (!attribute) return this.name;
            if (attribute.type.is(this.model.elements['core.type.Boolean'])) {
                return this[attribute.name] != undefined ? this[attribute.name].toString() : 'false';
            }
            if (attribute.type.isInstanceOf(this.model.elements['core.type.Type'])) {
                return this[attribute.name] != undefined ? this[attribute.name].toString() : '';
            }
            if (attribute.multiple) {
                return '[' + _.reduce(this[attribute.name], function(memo, attribute) {
                    if (memo.length > 0) {
                        memo += ', ';
                    }
                    return memo += attribute.name;
                }, '') + ']';
            }
            else {
                return this[attribute.name] ? this[attribute.name].fullName : null;
            }
        }

        set name(name) {
            var from = this.name;
            if (this.model) delete this.model.elements[this.fullname];
            this.values.name = name;
            if (this.model) this.model.elements[this.fullname] = this;
            this.emit("changed", {
                attribute: this.model.elements['core.Element.name'],
                from: from,
                to : this.name
            });
        }

        get name() {
            return this.values.name;
        }

        get fullName() {
            var parentAttribute = _.find(this.instanceOf.getAllAttributes(), function(attribute) {
                return attribute.referencedBy && attribute.referencedBy.composition;
            }, this);
            return this[parentAttribute.name] ? this[parentAttribute.name].fullName + '.' + this.name : this.name;
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

        update(attribute, value, callback) {
            if (attribute.type.isInstanceOf(this.model.elements['core.type.Type'])) {
                this[attribute.name] = value;
                callback();
            }
        }

        getListeners(eventName) {
            if (! this.listeners[eventName]) {
                this.listeners[eventName] = [];
            }
            return this.listeners[eventName];
        }

        on(eventName, callback) {
            this.getListeners(eventName).push(callback);
        }

        emit(eventName, event) {
            _.each(this.getListeners(eventName), function(listener) {
                listener(event);
            });
        }
    }
    module.exports = Element;
});