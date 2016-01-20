define(function(require, exports, module) {
    "use strict";
    
    var Class = require('../Class');
    
    class Type extends Class {
        
        get instanceOf() {
            return this.model.elements['core.type.Type'];
        }
        
    }
    
    module.exports = Type;
});