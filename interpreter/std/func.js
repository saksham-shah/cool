const Class = require('../../ast/class');
const Func = require('../../ast/func');
const NativeExpression = require('../../ast/nativeexpression');
const Reference = require('../../ast/reference');

const Obj = require('../object');
const Types = require('../../types/types');

// Function Class
module.exports = class extends Class {
    constructor() {
        super();

        this.name = Types.Function;

        this.superClass = new Reference(Types.Object);
    }
}