const Class = require('../../ast/class');
const Func = require('../../ast/func');
const FunctionCall = require('../../ast/functioncall');
const NativeExpression = require('../../ast/nativeexpression');
const Reference = require('../../ast/reference');
const This = require('../../ast/this');

const Evaluator = require('../../interpreter/evaluator');

const Obj = require('../object');
const Types = require('../../types/types');

const TokenType = require('../../lexer/tokenType');

// Number Class
module.exports = class extends Class {
    constructor() {
        super();

        this.name = Types.Number;

        this.superClass = new Reference(Types.Object);

        // Arithmetic operators
        this.functions.set('+', new Func('+', ['right'], new NativeExpression((context, err) => {
            let right = context.getValue(context.environment.get('right'));
            let left = context.self;
            let result;

            // Different uses of '+' based on data type
            switch (right.type) {
                case Types.Number:
                    result = Evaluator.create(context, Types.Number);
                    result.set('value', left.get('value') + right.get('value'));
                    break;
                case Types.String:
                    result = Evaluator.create(context, Types.String);
                    result.set('value', left.get('value') + right.get('value'));
                    break;
                case Types.Undefined:
                    result = Evaluator.create(context, Types.Number);
                    result.set('value', left.get('value'));
                    break;
                default:
                    err(`Invalid use of operator '+'`);
                    break;
            }

            return result;
        })));

        this.functions.set('-', new Func('-', ['right'], new NativeExpression((context, err) => {
            let right = context.getValue(context.environment.get('right'));
            let left = context.self;
            let result;

            // Different uses of '-' based on data type
            switch (right.type) {
                case Types.Number:
                    result = Evaluator.create(context, Types.Number);
                    result.set('value', left.get('value') - right.get('value'));
                    break;
                case Types.Undefined:
                    result = Evaluator.create(context, Types.Number);
                    result.set('value', left.get('value'));
                    break;
                default:
                    err(`Invalid use of operator '-'`);
                    break;
            }

            return result;
        })));

        this.functions.set('*', new Func('*', ['right'], new NativeExpression((context, err) => {
            let right = context.getValue(context.environment.get('right'));
            let left = context.self;
            let result;

            // Different uses of '*' based on data type
            switch (right.type) {
                case Types.Number:
                    result = Evaluator.create(context, Types.Number);
                    result.set('value', left.get('value') * right.get('value'));
                    break;
                case Types.String:
                    result = Evaluator.create(context, Types.String);
                    let str = '';
                    for (let i = 0; i < left.get('value'); i++) {
                        str += right.get('value');
                    }
                    result.set('value', str);
                    break;
                case Types.Undefined:
                    result = Evaluator.create(context, Types.Number);
                    result.set('value', left.get('value'));
                    break;
                default:
                    err(`Invalid use of operator '*'`);
                    break;
            }

            return result;
        })));

        this.functions.set('/', new Func('/', ['right'], new NativeExpression((context, err) => {
            let right = context.getValue(context.environment.get('right'));
            let left = context.self;
            let result;

            // Different uses of '/' based on data type
            switch (right.type) {
                case Types.Number:
                    result = Evaluator.create(context, Types.Number);
                    result.set('value', Math.floor(left.get('value') / right.get('value')));
                    break;
                default:
                    err(`Invalid use of operator '/'`);
                    break;
            }

            return result;
        })));

        this.functions.set('%', new Func('%', ['right'], new NativeExpression((context, err) => {
            let right = context.getValue(context.environment.get('right'));
            let left = context.self;
            let result;

            // Different uses of '%' based on data type
            switch (right.type) {
                case Types.Number:
                    result = Evaluator.create(context, Types.Number);
                    result.set('value', left.get('value') % right.get('value'));
                    break;
                default:
                    err(`Invalid use of operator '%'`);
                    break;
            }

            return result;
        })));

        this.functions.set('toString', new Func('toString', [], new NativeExpression(context => {
            let str = Evaluator.create(context, Types.String);
            str.set('value', context.self.get('value').toString());
            return str;
        })));

    }
}