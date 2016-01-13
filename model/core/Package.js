define(function(require, exports, module) {
    "use strict";
    
    var RootElement = require('./RootElement');
    
    class Package extends RootElement {
        constructor(name, model) {
            super(name, model);
            this.elements = [];
        }
    }
    
    module.exports = Package;
});