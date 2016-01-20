define(function(require, exports, module) {
    "use strict";
    
    var Element = require('./Element');
    
    class Attribute extends Element {

        get instanceOf() {
            return this.model.elements['core.Attribute'];
        }

        set mandatory(mandatory) {
            this.setValue(this.model.elements['core.Attribute.mandatory'], mandatory);
        }
        
        get mandatory() {
            return this.getValue(this.model.elements['core.Attribute.mandatory']);
        }

        set composition(composition) {
            this.setValue(this.model.elements['core.Attribute.composition'], composition);
        }
        
        get composition() {
            return this.getValue(this.model.elements['core.Attribute.composition']);
        }

        set multiple(multiple) {
            this.setValue(this.model.elements['core.Attribute.multiple'], multiple);
        }
        
        get multiple() {
            return this.getValue(this.model.elements['core.Attribute.multiple']);
        }
        
        set referencedBy(referencedBy) {
            this.setValue(this.model.elements['core.Attribute.referencedBy'], referencedBy);
        }
        
        get referencedBy() {
            return this.getValue(this.model.elements['core.Attribute.referencedBy']);
        }
        
        set type(type) {
            this.setValue(this.model.elements['core.Attribute.type'], type);
        }
        
        get type() {
            return this.getValue(this.model.elements['core.Attribute.type']);
        }

        set owner(owner) {
            this.setValue(this.model.elements['core.Attribute.owner'], owner);
        }
        
        get owner() {
            return this.getValue(this.model.elements['core.Attribute.owner']);
        }
        
    }
    
    module.exports = Attribute;
});