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

        this.functions.set('+', new Func('+', ['right'], new NativeExpression((context, err) => {
            let right = context.environment.getValue('right');
            let left = context.self;
            let result;

            switch (right.type) {
                case Types.Int:
                    result = Obj.create(context, Types.String);
                    result.setProperty('.value', left.getProperty('.value') + right.getProperty('.value'));
                    break;
                case Types.String:
                    result = Obj.create(context, Types.String);
                    result.setProperty('.value', left.getProperty('.value') + right.getProperty('.value'));
                    break;
                case Types.Undefined:
                    result = Obj.create(context, Types.String);
                    result.setProperty('.value', left.getProperty('.value'));
                    break;
                default:
                    err(`Invalid use of operator '+`);
                    break;
            }

            return result;
        })));

        this.functions.set('*', new Func('*', ['right'], new NativeExpression((context, err) => {
            let right = context.environment.getValue('right');
            let left = context.self;
            let result;

            switch (right.type) {
                case Types.Int:
                    result = Obj.create(context, Types.String);
                    let str = '';
                    let substr = left.getProperty('.value');
                    for (var i = 0; i < right.getProperty('.value'); i++) {
                        str += substr;
                    }
                    result.setProperty('.value', str);
                    break;
                case Types.Undefined:
                    result = Obj.create(context, Types.String);
                    result.setProperty('.value', left.getProperty('.value'));
                    break;
                default:
                    err(`Invalid use of operator '*'`);
                    break;
            }

            return result;
        })));

        this.functions.set('length', new Func('length', [], new NativeExpression(context => {
            let result = Obj.create(context, Types.Int);
            result.setProperty('.value', context.self.getProperty('.value').length);
            return result;
        })));

        this.functions.set('toString', new Func('toString', [], new NativeExpression(context => {
            return context.self;
        })));
    }
}