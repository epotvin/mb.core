/* global _ */
define(function(require, exports, module) {
    "use strict";
    class Element {
        constructor(name, model, values) {
            this.model = model;
            this.values = values || [];
            this.listeners = {};
            this.refs = [];
            this.values.name = name;
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
            attribute.addRef(this, attribute);

            if (attribute.type) {
                if (attribute.type.is(this.model.elements['core.type.Number'])) {
                    newValue = Number(newValue);
                }
                if (attribute.type.is(this.model.elements['core.type.Boolean'])) {
                    newValue = newValue === 'true' || newValue === true;
                }

            }

            var value = _.findWhere(this.values, {attribute: attribute});
            if (value) {
                value.value = newValue;
            }
            else this.values.push({
                attribute: attribute,
                value: newValue
            });
            
            this.emit('changed');
        }

        getValue(attribute) {
            var value = _.findWhere(this.values, {attribute : attribute});
            return value ? value.value : undefined;
        }

        set name(name) {
            if (this.model) delete this.model.elements[this.fullname];
            this.values.name = name;
            if (this.model) this.model.elements[this.fullname] = this;
            this.emit("changed");
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
                element.on('changed', function(e) {
                    if (this.dirty) this.emit('changed');
                }, this);
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

        on(eventName, callback, context) {
            this.getListeners(eventName).push({
                callback: callback,
                context: context
            });
        }

        emit(eventName, event) {
            _.each(this.getListeners(eventName), function(listener) {
                if (listener.context) {
                    listener.callback.call(listener.context, event);
                }
                else {
                    listener.callback(event);
                }
            });
        }
    }
    module.exports = Element;
});