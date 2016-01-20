/* global _ */
define(function(require, exports, module) {
    "use strict";
    class Element {
        constructor(name, model, values) {
            this.model = model;
            this.values = values || {};
            this.listeners = {};
            this.refs = [];
            this.name = name;
        }

        setValue(attribute, newValue) {
            var oldValue = this.values[attribute.name];

            if (Array.isArray(oldValue)) {
                _.each(oldValue, function(other) {
                    other && other.removeRef && other.removeRef(this, attribute);
                }, this);
                _.each(newValue, function(other) {
                    other.addRef && other.addRef(this, attribute);
                }, this);
            }
            else {
                oldValue && oldValue.removeRef && oldValue.removeRef(this, attribute);
                newValue && newValue.addRef && newValue.addRef(this, attribute);
            }

            if (attribute.type) {
                if (attribute.type.is(this.model.elements['core.type.Number'])) {
                    newValue = Number(newValue);
                }
                if (attribute.type.is(this.model.elements['core.type.Boolean'])) {
                    newValue = newValue === 'true' || newValue === true;
                }

            }

            this.values[attribute.name] = newValue;

            this.emit('changed', {
                element: this,
                attribute: attribute,
                oldValue: oldValue,
                newValue: newValue
            });
            _.each(this.refs, function(ref) {
                ref.element.emit('changed', {
                    element: ref.element,
                    attribute: ref.attribute
                });
            });

        }

        getValue(attribute) {
            return this.values[attribute.name];
        }

        set name(name) {
            var from = this.name;
            if (this.model) delete this.model.elements[this.fullname];
            this.values.name = name;
            if (this.model) this.model.elements[this.fullname] = this;
            this.emit("changed", {
                attribute: this.model.elements['core.Element.name'],
                from: from,
                to: this.name
            });
        }

        get name() {
            return this.values.name;
        }

        get instanceOf() {
            return this.model.elements['core.Element'];
        }

        get fullName() {
            var parentAttribute = _.find(this.instanceOf.getAllAttributes(), function(attribute) {
                return attribute.referencedBy && attribute.referencedBy.composition;
            }, this);
            return this[parentAttribute.name] ? this[parentAttribute.name].fullName + '.' + this.name : this.name;
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
                return this[attribute.name] ? this[attribute.name].fullName : '';
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

        getListeners(eventName) {
            if (!this.listeners[eventName]) {
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