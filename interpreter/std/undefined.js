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

// Undefined Class - used for all errors and is probably the most unique thing about Cool
module.exports = class extends Class {
    constructor() {
        super();

        this.name = Types.Undefined;

        this.superClass = new Reference(Types.Object);

        // Arithmetic operators

        // Simply returns the other object - does not change the object at all
        // Same for the other operators
        this.functions.set(TokenType.Plus, new Func(TokenType.Plus, ['right'], new NativeExpression((context, err) => {
            let right = context.getValue(context.environment.get('right'));
            let result;

            switch (right.type) {
                case Types.Number:
                    result = Evaluator.create(context, Types.Number);
                    result.set('value', right.get('value'));
                    break;
                case Types.String:
                    result = Evaluator.create(context, Types.String);
                    result.set('value', right.get('value'));
                    break;
                case Types.Undefined:
                    result = Evaluator.create(context, Types.Undefined);
                    break;
                default:
                    err(`Invalid use of operator '${TokenType.Plus}'`);
                    break;
            }

            return result;
        })));

        this.functions.set(TokenType.Minus, new Func(TokenType.Minus, ['right'], new NativeExpression((context, err) => {
            let right = context.getValue(context.environment.get('right'));
            let result;

            switch (right.type) {
                case Types.Number:
                    result = Evaluator.create(context, Types.Number);
                    result.set('value', -right.get('value'));
                    break;
                case Types.Undefined:
                    result = Evaluator.create(context, Types.Undefined);
                    break;
                default:
                    err(`Invalid use of operator '${TokenType.Minus}'`);
                    break;
            }

            return result;
        })));

        this.functions.set(TokenType.Times, new Func(TokenType.Times, ['right'], new NativeExpression((context, err) => {
            let right = context.getValue(context.environment.get('right'));
            let result;

            switch (right.type) {
                case Types.Number:
                    result = Evaluator.create(context, Types.Number);
                    result.set('value', right.get('value'));
                    break;
                case Types.String:
                    result = Evaluator.create(context, Types.String);
                    result.set('value', right.get('value'));
                    break;
                case Types.Undefined:
                    result = Evaluator.create(context, Types.Undefined);
                    break;
                default:
                    err(`Invalid use of operator '${TokenType.Times}'`);
                    break;
            }

            return result;
        })));

        this.functions.set('toString', new Func('toString', [], new NativeExpression(context => {
            let str = Evaluator.create(context, Types.String);
            str.set('value', `<undefined>`);

            return str;
        })));
    }
}