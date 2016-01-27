/* global _ */
define(function(require, exports, module) {
    "use strict";
    
    var Element = require('./Element');
    
    class Model extends Element {
        
        element(fullName) {
            var names = fullName.split('.');
            var element = _.reduce(names, function(parent, name) {
                if (!parent) return null;
                var child = null;
                _.each(parent.instanceOf.getAllAttributes(), function(attribute) {
                    if (attribute.multiple) {
                        _.each(parent.get(attribute), function(value) {
                            if (value.name === name) {
                                child = value;
                            }
                        });
                    }
                });
                return child;
            }, this);
            
            var i = 0;
            while (! element && i < this.dependencies.length) {
                element = this.dependencies[i++].element(fullName);
            }
            return element;
        }
    }
    
    module.exports = Model;
});