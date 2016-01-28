/* global _ */
define(function(require, exports, module) {
    "use strict";
    class Element {
        constructor(model) {
            this.listeners = [];
            this.values = [];
            this.refs = [];
            this.model = model;
        }

        get(attribute) {
            var self = this;
            if (typeof attribute === 'string') {
                attribute = _.findWhere(this.instanceOf.getAllAttributes(), {name: attribute});
            }
            var value = _.findWhere(this.values, {attribute : attribute});
            if (value) return value.value;
            if (attribute.multiple) {
                value = [];
                value.add = function(v) {
                    value.push(v);
                    if (! attribute.type.isInstanceOf('core.type.Type')) {
                        v.addRef(self, attribute);
                    }
                };
                this.set(attribute, value);
                return value;
            }
            if (attribute.type.is('core.Model')) return this.model;
        }
        
        set(attribute, newValue) {
            if (typeof attribute === 'string') {
                attribute = _.findWhere(this.instanceOf.getAllAttributes(), {name: attribute});
            }
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

        get fullName() {
            var parentAttribute = _.find(this.instanceOf.getAllAttributes(), function(attribute) {
                return attribute.referencedBy && attribute.referencedBy.composition;
            }, this);
            return parentAttribute && this.get(parentAttribute) && ! this.get(parentAttribute).isInstanceOf(this.model.element('core.Model')) ? this.get(parentAttribute).fullName + '.' + this.name : this.name;
        }

        isInstanceOf(clazz) {
            if (typeof clazz === 'string') {
                clazz = this.model.element(clazz);
            }
            return this.instanceOf.is(clazz);
        }

        getLabel(attribute) {
            if (!attribute) return this.name;
            if (attribute.type.is(this.model.element('core.type.Boolean'))) {
                return this.get(attribute) != undefined ? this.get(attribute).toString() : 'false';
            }
            if (attribute.type.isInstanceOf(this.model.element('core.type.Type'))) {
                return this.get(attribute) != undefined ? this.get(attribute).toString() : '';
            }
            if (attribute.multiple) {
                return '[' + _.reduce(this.get(attribute), function(memo, attribute) {
                    if (memo.length > 0) {
                        memo += ', ';
                    }
                    return memo += attribute.name;
                }, '') + ']';
            }
            else {
                return this.get(attribute) ? this.get(attribute).fullName : '';
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

        getAllRefs(yet) {
            yet = yet || [this];
            var refs = _.reject(this.refs, function(ref) {return _.contains(yet, ref.element)});
            yet = yet.concat(_.map(refs, function(ref) { return ref.element}));
            _.each(refs, function(ref) {
                refs = _.union(refs, ref.element.getAllRefs(yet));
            });
            return refs;
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