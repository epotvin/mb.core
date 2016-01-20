define(function(require, exports, module) {
    "use strict";
    
    var Element = require('./Element');
    
    class RootElement extends Element {
        
        get instanceOf() {
            return this.model.elements['core.RootElement'];
        }

        set package(pkg) {
            this.setValue(this.model.elements['core.RootElement.package'], pkg);
        }
        
        get package() {
            return this.getValue(this.model.elements['core.RootElement.package']);
        }

        get filePath() {
            var path = '/' + this.fullName.replace(/\./g, '/');
            if (! this.isInstanceOf('core.Package')) {
                path += '.json';
            }
            return path;
        }
    }
    
    module.exports = RootElement;
});