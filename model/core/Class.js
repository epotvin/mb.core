/* global _ */
define(function(require, exports, module) {
    "use strict";
    
    var RootElement = require('./RootElement');
    
    class Class extends RootElement {
        constructor(name, actualClass, attributes) {
            super(name);
            this.attributes = attributes || [];
        }
        
        getAllAttributes(clazz) {
            var attributes = [];
            if (clazz.extends) {
                _.each(clazz.extends, function(extended) {
                    attributes = attributes.concat(this.getAllAttributes(extended));
                });
            }
            attributes = attributes.concat(clazz.attributes);
            return attributes;
        }

        is(clazz) {
            if (this === clazz) {
                return true;
            }
            if (this.extends) {
                return _.filter(this.extends, function(extended) {
                    return extended.is(clazz);
                }).length > 0;
            }
            return false;
        };

    }
    
    module.exports = Class;
});