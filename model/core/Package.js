define(function(require, exports, module) {
    "use strict";
    
    var RootElement = require('./RootElement');
    
    class Package extends RootElement {

        get instanceOf() {
            return this.model.elements['core.Package'];
        }
        
        set elements(elements) {
            this.setValue(this.model.elements['core.Package.elements'], elements);
        }
        
        get elements() {
            return this.getValue(this.model.elements['core.Package.elements']);
        }
        
    }
    
    module.exports = Package;
});