const Class = require('../../ast/class');
const Func = require('../../ast/func');
const NativeExpression = require('../../ast/nativeexpression');

const Obj = require('../object');
const Types = require('../../types/types');

module.exports = class extends Class {
    constructor() {
        super();

        this.name = Types.Int;

        this.superClass = Types.Object;

        this.functions.push(new Func('+', ['right'], new NativeExpression(context => {
            let right = context.environment.getValue('right');
            let left = context.self;
            let result;

            switch (right.type) {
                case Types.Int:
                    result = Obj.create(context, Types.Int);
                    result.setProperty('value', left.getProperty('value') + right.getProperty('value'));
                    break;
                case Types.Undefined:
                    result = Obj.create(context, Types.Int);
                    result.setProperty('value', left.getProperty('value'));
                    break;
            }

            return result;
        })));
    }
}