const Class = require('../../ast/class');
const NativeExpression = require('../../ast/nativeexpression');
const Reference = require('../../ast/reference');

const Types = require('../../types/types');

const err = require('../../utils/report').error;

// Very meta - the Class Class extending from Class
module.exports = class extends Class {
    constructor() {
        super();

        this.name = Types.Class;

        this.superClass = new Reference(Types.Object);

        this.init = new NativeExpression(context => {
            err(`Illegal constructor call (use class keyword instead)`);
        });
    }
}