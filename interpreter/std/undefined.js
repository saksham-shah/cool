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

        // Comparison operators
        this.functions.set(TokenType.DoubleEquals, new Func(TokenType.DoubleEquals, ['right'], new NativeExpression(context => {
            let right = context.getValue(context.environment.get('right'));
            let bool = Evaluator.create(context, Types.Boolean);

            switch (right.type) {
                case Types.Boolean:
                    bool.set('value', !right.get('value'));
                    break;
                case Types.Undefined:
                    bool.set('value', true);
                    break;
                default:
                    bool.set('value', false);
                    break;
            }

            return bool;
        })));

        this.functions.set(TokenType.GreaterThan, new Func(TokenType.GreaterThan, ['right'], new NativeExpression(context => {
            let right = context.getValue(context.environment.get('right'));
            let left = context.self;
            let bool = Evaluator.create(context, Types.Boolean);

            // Different ways of comparing depending on data type
            switch (right.type) {
                case Types.Array:
                    bool.set('value', true);
                    break;
                case Types.Number:
                    bool.set('value', true);
                    break;
                case Types.String:
                    bool.set('value', true);
                    break;
                case Types.Undefined:
                    bool.set('value', false);
                    break;
                default:
                    err(`Invalid use of operator '${TokenType.GreaterThan}'`);
                    break;
            }

            return bool;
        })));

        this.functions.set(TokenType.GreaterThanOrEqual, new Func(TokenType.GreaterThanOrEqual, ['right'], new NativeExpression(context => {
            let right = context.getValue(context.environment.get('right'));
            let left = context.self;
            let bool = Evaluator.create(context, Types.Boolean);

            // Different ways of comparing depending on data type
            switch (right.type) {
                case Types.Array:
                    bool.set('value', true);
                    break;
                case Types.Number:
                    bool.set('value', true);
                    break;
                case Types.String:
                    bool.set('value', true);
                    break;
                case Types.Undefined:
                    bool.set('value', true);
                    break;
                default:
                    err(`Invalid use of operator '${TokenType.GreaterThan}'`);
                    break;
            }

            return bool;
        })));

        this.functions.set(TokenType.LessThan, new Func(TokenType.LessThan, ['right'], new NativeExpression(context => {
            let right = context.getValue(context.environment.get('right'));
            let left = context.self;
            let bool = Evaluator.create(context, Types.Boolean);

            // Different ways of comparing depending on data type
            switch (right.type) {
                case Types.Array:
                    bool.set('value', true);
                    break;
                case Types.Number:
                    bool.set('value', true);
                    break;
                case Types.String:
                    bool.set('value', true);
                    break;
                case Types.Undefined:
                    bool.set('value', false);
                    break;
                default:
                    err(`Invalid use of operator '${TokenType.GreaterThan}'`);
                    break;
            }

            return bool;
        })));

        this.functions.set(TokenType.LessThanOrEqual, new Func(TokenType.LessThanOrEqual, ['right'], new NativeExpression(context => {
            let right = context.getValue(context.environment.get('right'));
            let left = context.self;
            let bool = Evaluator.create(context, Types.Boolean);

            // Different ways of comparing depending on data type
            switch (right.type) {
                case Types.Array:
                    bool.set('value', true);
                    break;
                case Types.Number:
                    bool.set('value', true);
                    break;
                case Types.String:
                    bool.set('value', true);
                    break;
                case Types.Undefined:
                    bool.set('value', true);
                    break;
                default:
                    err(`Invalid use of operator '${TokenType.GreaterThan}'`);
                    break;
            }

            return bool;
        })));

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

        // Unary operators
        this.functions.set('unary_' + TokenType.Plus, new Func('unary_' + TokenType.Plus, [], new NativeExpression(context => {
            let result = Evaluator.create(context, Types.Undefined);
            return result;
        })));

        this.functions.set('unary_' + TokenType.Minus, new Func('unary_' + TokenType.Minus, [], new NativeExpression(context => {
            let result = Evaluator.create(context, Types.Undefined);
            return result;
        })));

        // to_ functions
        this.functions.set('toBoolean', new Func('toBoolean', [], new NativeExpression(context => {
            let bool = Evaluator.create(context, Types.Boolean);
            bool.set('value', false);
            return bool;
        })));

        this.functions.set('toString', new Func('toString', [], new NativeExpression(context => {
            let str = Evaluator.create(context, Types.String);
            str.set('value', `<undefined>`);
            return str;
        })));
    }
}