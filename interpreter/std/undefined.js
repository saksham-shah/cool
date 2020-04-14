const Class = require('../../ast/class');
const Func = require('../../ast/func');
const FunctionCall = require('../../ast/functioncall');
const NativeExpression = require('../../ast/nativeexpression');
const Reference = require('../../ast/reference');
const This = require('../../ast/this');

const Obj = require('../object');
const Types = require('../../types/types');

const TokenType = require('../../lexer/tokenType');

// Undefined Class - used for all errors and is the most unique thing about Cool
module.exports = class extends Class {
    constructor() {
        super();

        this.name = Types.Undefined;

        this.superClass = Types.Object;

        // Simply returns the other object - does not change the object at all
        // Same for the other operators
        this.functions.set('+', new Func('+', ['right'], new NativeExpression((context, err) => {
            let right = context.environment.getValue('right');
            let result;

            switch (right.type) {
                case Types.Number:
                    result = Obj.create(context, Types.Number);
                    result.setProperty('.value', right.getProperty('.value'));
                    break;
                case Types.Undefined:
                    result = Obj.create(context, Types.Undefined);
                    break;
                case Types.String:
                    result = Obj.create(context, Types.String);
                    result.setProperty('.value', right.getProperty('.value'));
                    break;
                default:
                    err(`Invalid use of operator '+'`);
                    break;
            }

            return result;
        })));

        this.functions.set('-', new Func('-', ['right'], new NativeExpression((context, err) => {
            let right = context.environment.getValue('right');
            let result;

            switch (right.type) {
                case Types.Number:
                    result = Obj.create(context, Types.Number);
                    result.setProperty('.value', -right.getProperty('.value'));
                    break;
                case Types.Undefined:
                    result = Obj.create(context, Types.Undefined);
                    break;
                default:
                    err(`Invalid use of operator '-'`);
                    break;
            }

            return result;
        })));

        this.functions.set('*', new Func('*', ['right'], new NativeExpression((context, err) => {
            let right = context.environment.getValue('right');
            let result;

            // if (right.type == Types.Number || right.type == Types.String || right.type == Types.Undefined) {
            //     return right;
            // }
            // err(`Invalid use of operator '*'`);

            switch (right.type) {
                case Types.Number:
                    result = Obj.create(context, Types.Number);
                    result.setProperty('.value', right.getProperty('.value'));
                    break;
                case Types.String:
                    result = Obj.create(context, Types.String);
                    result.setProperty('.value', right.getProperty('.value'));
                    break;
                case Types.Undefined:
                    result = Obj.create(context, Types.Undefined);
                    break;
                default:
                    err(`Invalid use of operator '*'`);
                    break;
            }

            return result;
        })));

        // Simply returns itself
        this.functions.set('unary_+', new Func('unary_+', [], new NativeExpression(context => {
            return context.self;
        })));

        this.functions.set('unary_-', new Func('unary_-', [], new NativeExpression(context => {
            return context.self;
        })));

        // Boolean operators
        this.functions.set(TokenType.And, new Func(TokenType.And, ['right'], new NativeExpression(context => {
            let bool = Obj.create(context, Types.Boolean);
            bool.setProperty('.value', false);
            return bool;
        })));

        this.functions.set(TokenType.Or, new Func(TokenType.Or, ['right'], new NativeExpression(context => {
            let call = new FunctionCall(new Reference('right'), 'toBoolean');
            return Evaluator.evaluate(context, call);
        })));

        // Comparison operators
        this.functions.set('==', new Func('==', ['right'], new NativeExpression(context => {
            let right = context.environment.getValue('right');
            let result = Obj.create(context, Types.Boolean);

            switch (right.type) {
                case Types.Boolean:
                    result.setProperty('.value', !right.getProperty('.value'));
                    break;
                case Types.Undefined:
                    result.setProperty('.value', true);
                    break;
                default:
                    result.setProperty('.value', false);
                    break;
            }

            return result;
        })));

        // Opposite of the '==' function
        this.functions.set('!=', new Func('!=', ['right'], new NativeExpression(context => {
            let call = new FunctionCall(new This(), '==', [new Reference('right')]);
            let bool = Evaluator.evaluateFunctionCall(context, call);
            bool.setProperty('.value', !bool.getProperty('.value'));
            return bool;
        })));

        this.functions.set('>', new Func('>', ['right'], new NativeExpression((context, err) => {
            let right = context.environment.getValue('right');
            let result = Obj.create(context, Types.Boolean);

            switch (right.type) {
                case Types.Array:
                    result.setProperty('.value', true);
                    break;
                case Types.Number:
                    result.setProperty('.value', true);
                    break;
                case Types.String:
                    result.setProperty('.value', true);
                    break;
                case Types.Undefined:
                    result.setProperty('.value', false);
                    break;
                default:
                    err(`Invalid use of operator '>'`);
                    break;
            }

            return result;
        })));

        this.functions.set('>=', new Func('>=', ['right'], new NativeExpression((context, err) => {
            let right = context.environment.getValue('right');
            let result = Obj.create(context, Types.Boolean);

            switch (right.type) {
                case Types.Array:
                    result.setProperty('.value', true);
                    break;
                case Types.Number:
                    result.setProperty('.value', true);
                    break;
                case Types.String:
                    result.setProperty('.value', true);
                    break;
                case Types.Undefined:
                    result.setProperty('.value', true);
                    break;
                default:
                    err(`Invalid use of operator '>='`);
                    break;
            }

            return result;
        })));

        this.functions.set('<', new Func('<', ['right'], new NativeExpression((context, err) => {
            let right = context.environment.getValue('right');
            let result = Obj.create(context, Types.Boolean);

            switch (right.type) {
                case Types.Array:
                    result.setProperty('.value', true);
                    break;
                case Types.Number:
                    result.setProperty('.value', true);
                    break;
                case Types.String:
                    result.setProperty('.value', true);
                    break;
                case Types.Undefined:
                    result.setProperty('.value', false);
                    break;
                default:
                    err(`Invalid use of operator '<'`);
                    break;
            }

            return result;
        })));

        this.functions.set('<=', new Func('<=', ['right'], new NativeExpression((context, err) => {
            let right = context.environment.getValue('right');
            let result = Obj.create(context, Types.Boolean);

            switch (right.type) {
                case Types.Array:
                    result.setProperty('.value', true);
                    break;
                case Types.Number:
                    result.setProperty('.value', true);
                    break;
                case Types.String:
                    result.setProperty('.value', true);
                    break;
                case Types.Undefined:
                    result.setProperty('.value', true);
                    break;
                default:
                    err(`Invalid use of operator '<='`);
                    break;
            }

            return result;
        })));

        this.functions.set('toBoolean', new Func('toBoolean', [], new NativeExpression(context => {
            let bool = Obj.create(context, Types.Boolean);
            bool.setProperty('.value', false);
            return bool;
        })));

        this.functions.set('toString', new Func('toString', [], new NativeExpression(context => {
            let str = Obj.create(context, Types.String);
            str.setProperty('.value', '<undefined>');
            return str;
        })));
    }
}