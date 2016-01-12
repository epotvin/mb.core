define(function(require, exports, module) {
    "use strict";
    class Element {
        constructor(name) {
            this.name = name;
        }
        
        isInstanceOf(clazz) {
            return this.instanceOf.is(clazz);
        }
    }
    module.exports = Element;
});