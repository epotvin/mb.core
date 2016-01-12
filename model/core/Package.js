define(function(require, exports, module) {
    "use strict";
    
    var RootElement = require('./RootElement');
    
    class Package extends RootElement {
        constructor(name) {
            super(name);
            this.elements = [];
        }
    }
    
    module.exports = Package;
});