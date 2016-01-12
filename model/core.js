/* global _ */
define(function(require, exports, module) {
    main.consumes = ["Plugin"];
    main.provides = ["core"];
    return main;

    function main(options, imports, register) {
        'use strict';
        var Plugin = imports.Plugin;

        var core = new Plugin("Ajax.org", main.consumes);
        core.Class = require('./core/Class');
        core.Element = require('./core/Element');
        core.Package = require('./core/Package');
        core.RootElement = require('./core/RootElement');
        core.Attribute = require('./core/Attribute');


        core.addToModel = function(model) {
            var elements = {
                'core': new core.Package('core'),
                'core.Element': new core.Class('Element'),
                'core.Element.name': new core.Attribute('name'),
                'core.Element.instanceOf': new core.Attribute('instanceOf'),
                'core.RootElement': new core.Class('RootElement'),
                'core.RootElement.package': new core.Attribute('package'),
                'core.Class': new core.Class('Class'),
                'core.Class.abstract': new core.Attribute('abstract'),
                'core.Class.extends': new core.Attribute('extends'),
                'core.Class.attributes': new core.Attribute('attributes'),
                'core.Attribute': new core.Class('Attribute'),
                'core.Attribute.mandatory': new core.Attribute('mandatory'),
                'core.Attribute.composition': new core.Attribute('composition'),
                'core.Attribute.multiple': new core.Attribute('multiple'),
                'core.Attribute.referencedBy': new core.Attribute('referencedBy'),
                'core.Attribute.owner': new core.Attribute('owner'),
                'core.Package': new core.Class('Package'),
                'core.Package.elements': new core.Attribute('elements'),
                'core.type': new core.Package('type'),
                'core.type.Type': new core.Class('Type'),
                'core.type.String': new core.Class('String'),
                'core.type.Number': new core.Class('Number'),
                'core.type.Boolean': new core.Class('Boolean')
            };

            _.extend(elements['core'], {
                instanceOf: elements['core.Package'],
                elements: [
                    elements['core.Element'],
                    elements['core.RootElement'],
                    elements['core.Class'],
                    elements['core.Attribute'],
                    elements['core.Package'],
                    elements['core.type']
                ]
            });

            _.extend(elements['core.Element'], {
                instanceOf: elements['core.Class'],
                'package': elements['core'],
                attributes: [
                    elements['core.Element.name'],
                    elements['core.Element.instanceOf']
                ]
            });

            _.extend(elements['core.Element.name'], {
                instanceOf: elements['core.Attribute'],
                type: elements['core.type.String'],
                mandatory: true,
                composition: true,
                owner: elements['core.Element']
            });

            _.extend(elements['core.Element.instanceOf'], {
                instanceOf: elements['core.Attribute'],
                type: elements['core.Class'],
                mandatory: true,
                owner: elements['core.Element']
            });

            _.extend(elements['core.RootElement'], {
                instanceOf: elements['core.Class'],
                'package': elements['core'],
                'extends': [elements['core.Element']],
                attributes: [
                    elements['core.RootElement.package']
                ]
            });

            _.extend(elements['core.RootElement.package'], {
                instanceOf: elements['core.Attribute'],
                type: elements['core.Package'],
                mandatory: true,
                referencedBy: elements['core.Package.elements'],
                owner: elements['core.RootElement']
            });

            _.extend(elements['core.Class'], {
                instanceOf: elements['core.Class'],
                'package': elements['core'],
                'extends': [elements['core.RootElement']],
                attributes: [
                    elements['core.Class.abstract'],
                    elements['core.Class.extends'],
                    elements['core.Class.attributes']
                ]
            });

            _.extend(elements['core.Class.abstract'], {
                instanceOf: elements['core.Attribute'],
                type: elements['core.type.Boolean'],
                composition: true,
                owner: elements['core.Class']
            });

            _.extend(elements['core.Class.extends'], {
                instanceOf: elements['core.Attribute'],
                type: elements['core.Class'],
                multiple: true,
                owner: elements['core.Class']
            });

            _.extend(elements['core.Class.attributes'], {
                instanceOf: elements['core.Attribute'],
                type: elements['core.Attribute'],
                composition: true,
                multiple: true,
                referencedBy: elements['core.Attribute.owner'],
                owner: elements['core.Class']
            });

            _.extend(elements['core.Attribute'], {
                instanceOf: elements['core.Class'],
                'package': elements['core'],
                'extends': [elements['core.Element']],
                attributes: [
                    elements['core.Attribute.mandatory'],
                    elements['core.Attribute.composition'],
                    elements['core.Attribute.multiple'],
                    elements['core.Attribute.referencedBy'],
                    elements['core.Attribute.owner']
                ]
            });

            _.extend(elements['core.Attribute.mandatory'], {
                instanceOf: elements['core.Attribute'],
                type: elements['core.type.Boolean'],
                composition: true,
                owner: elements['core.Attribute']
            });

            _.extend(elements['core.Attribute.composition'], {
                instanceOf: elements['core.Attribute'],
                type: elements['core.type.Boolean'],
                composition: true,
                owner: elements['core.Attribute']
            });

            _.extend(elements['core.Attribute.multiple'], {
                instanceOf: elements['core.Attribute'],
                type: elements['core.type.Boolean'],
                composition: true,
                owner: elements['core.Attribute']
            });

            _.extend(elements['core.Attribute.referencedBy'], {
                instanceOf: elements['core.Attribute'],
                type: elements['core.Attribute'],
                owner: elements['core.Attribute']
            });

            _.extend(elements['core.Attribute.owner'], {
                instanceOf: elements['core.Class'],
                mandatory: true,
                referencedBy: elements['core.Class.attributes'],
                owner: elements['core.Attribute']
            });

            _.extend(elements['core.Package'], {
                instanceOf: elements['core.Class'],
                'package': elements['core'],
                'extends': [elements['core.Rootelement']],
                attributes: [
                    elements['core.Package.elements']
                ]
            });

            _.extend(elements['core.Package.elements'], {
                instanceOf: elements['core.Attribute'],
                type: elements['core.RootElement'],
                composition: true,
                multiple: true,
                referencedBy: elements['core.RootElement.package'],
                owner: elements['core.Package']
            });

            _.extend(elements['core.type'], {
                instanceOf: elements['core.Package'],
                'package': elements['core'],
                elements: [
                    elements['core.type.Type'],
                    elements['core.type.String'],
                    elements['core.type.Number'],
                    elements['core.type.Boolean']
                ]
            });

            _.extend(elements['core.type.Type'], {
                instanceOf: elements['core.Class'],
                'abstract': true,
                'package': elements['core.type'],
                'extends': [elements['core.Class']]
            });

            _.extend(elements['core.type.String'], {
                instanceOf: elements['core.type.Type'],
                'package': elements['core.type']
            });

            _.extend(elements['core.type.Number'], {
                instanceOf: elements['core.type.Type'],
                'package': elements['core.type']
            });

            _.extend(elements['core.type.Boolean'], {
                instanceOf: elements['core.type.Type'],
                'package': elements['core.type']
            });

            model.root.elements.push(elements['core']);
            _.extend(model.elements, elements);

        };

        register(null, {
            "core": core
        });
    }
});