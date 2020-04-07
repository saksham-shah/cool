const Class = require('../../ast/class');
const Func = require('../../ast/func');
const NativeExpression = require('../../ast/nativeexpression');

const Obj = require('../object');
const Types = require('../../types/types');

module.exports = class extends Class {
    constructor() {
        super();

        this.name = Types.Undefined;

        this.superClass = Types.Object;

        this.functions.push(new Func('+', ['right'], new NativeExpression(context => {
            let right = context.environment.getValue('right');
            let result;

            switch (right.type) {
                case Types.Int:
                    result = Obj.create(context, Types.Int);
                    result.setProperty('.value', right.getProperty('.value'));
                    break;
                case Types.Undefined:
                    result = Obj.create(context, Types.Undefined);
                    break;
            }

            return result;
        })));

        this.functions.push(new Func('-', ['right'], new NativeExpression(context => {
            let right = context.environment.getValue('right');
            let result;

            switch (right.type) {
                case Types.Int:
                    result = Obj.create(context, Types.Int);
                    result.setProperty('.value', -right.getProperty('.value'));
                    break;
                case Types.Undefined:
                    result = Obj.create(context, Types.Undefined);
                    break;
            }

            return result;
        })));

        this.functions.push(new Func('*', ['right'], new NativeExpression(context => {
            let right = context.environment.getValue('right');
            let result;

            switch (right.type) {
                case Types.Int:
                    result = Obj.create(context, Types.Int);
                    result.setProperty('.value', right.getProperty('.value'));
                    break;
                case Types.Undefined:
                    result = Obj.create(context, Types.Undefined);
                    break;
            }

            return result;
        })));

        this.functions.push(new Func('unary_+', [], new NativeExpression(context => {
            return context.self;
        })));

        this.functions.push(new Func('unary_-', [], new NativeExpression(context => {
            return context.self;
        })));

        this.functions.push(new Func('toString', [], new NativeExpression(context => {
            let str = Obj.create(context, Types.String);
            str.setProperty('.value', 'Undefined');
            return str;
        })))
    }
}