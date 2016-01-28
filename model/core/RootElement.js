define(function(require, exports, module) {
    "use strict";
    
    var Element = require('./Element');
    
    class RootElement extends Element {
        
        get filePath() {
            var path = '/' + this.fullName.replace(/\./g, '/');
            if (! this.isInstanceOf('core.Package')) {
                path += '.json';
            }
            return path;
        }
        
        get folder() {
            return '/' + this.container.fullName.replace(/\./g, '/');
        }
    }
    
    module.exports = RootElement;
});