/* global _ */
define(function(require, exports, module) {
    "use strict";
    
    var RootElement = require('./RootElement');
    
    class Class extends RootElement {

        constructor(name, model) {
            super(name, model);
            this.attributes = [];
        }
        
        getAllAttributes() {
            var attributes = [];
            if (this.extends) {
                _.each(this.extends, function(extended) {
                    attributes = attributes.concat(extended.getAllAttributes());
                });
            }
            attributes = attributes.concat(this.attributes);
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