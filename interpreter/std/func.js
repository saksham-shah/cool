const Class = require('../../ast/class');
const NativeExpression = require('../../ast/nativeexpression');
const Reference = require('../../ast/reference');

const Types = require('../../types/types');

const err = require('../../utils/report').error;

// Function Class
module.exports = class extends Class {
    constructor() {
        super();

        this.name = Types.Function;

        this.superClass = new Reference(Types.Object);
        
        this.init = new NativeExpression(context => {
            err(`Illegal constructor call (use arrow operator or function keyword instead)`);
        })
    }
}