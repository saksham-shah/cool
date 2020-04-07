const Class = require('../../ast/class');
const Func = require('../../ast/func');
const NativeExpression = require('../../ast/nativeexpression');

const Obj = require('../object');
const Types = require('../../types/types');

module.exports = class extends Class {
    constructor() {
        super();

        this.name = Types.Function;

        this.superClass = Types.Object;

        this.functions.push(new Func('toString', [], new NativeExpression(context => {
            let str = Obj.create(context, Types.String);
            str.setProperty('.value', '<function>' + context.self.getProperty('.name'));
            return str;
        })));
    }
}