const Class = require('../../ast/class');
const Func = require('../../ast/func');
const NativeExpression = require('../../ast/nativeexpression');

const Obj = require('../object');
const Types = require('../../types/types');

module.exports = class extends Class {
    constructor() {
        super();

        this.name = Types.String;

        this.superClass = Types.Object;

        this.functions.push(new Func('toString', [], new NativeExpression(context => {
            return context.self;
        })))
    }
}