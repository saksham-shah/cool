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

module.exports = class extends Class {
    constructor() {
        super();

        this.name = Types.String;

        this.superClass = Types.Object;

        // Functions for each operator, similar to the Number class
        this.functions.set('+', new Func('+', ['right'], new NativeExpression((context, err) => {
            let right = context.environment.getValue('right');
            let left = context.self;
            let result;

            switch (right.type) {
                case Types.Number:
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
                case Types.Number:
                    // Repeats the string a specified number of times
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

        // Boolean operators
        this.functions.set(TokenType.And, new Func(TokenType.And, ['right'], new NativeExpression(context => {
            if (context.self.getProperty('.value').length > 0) {
                let call = new FunctionCall(new Reference('right'), 'toBoolean');
                return Evaluator.evaluate(context, call);
            } else {
                let bool = Obj.create(context, Types.Boolean);
                bool.setProperty('.value', false);
                return bool;
            }
        })));

        this.functions.set(TokenType.Or, new Func(TokenType.Or, ['right'], new NativeExpression(context => {
            if (context.self.getProperty('.value').length > 0) {
                let bool = Obj.create(context, Types.Boolean);
                bool.setProperty('.value', true);
                return bool;
            } else {
                let call = new FunctionCall(new Reference('right'), 'toBoolean');
                return Evaluator.evaluate(context, call);
            }
        })));

        // Comparison operators
        this.functions.set('==', new Func('==', ['right'], new NativeExpression(context => {
            let right = context.environment.getValue('right');
            let left = context.self;
            let result = Obj.create(context, Types.Boolean);

            switch (right.type) {
                case Types.Boolean:
                    result.setProperty('.value', left.getProperty('.value').length > 0);
                    break;
                case Types.Number:
                    result.setProperty('.value', left.getProperty('.value').length == right.getProperty('.value'));
                    break;
                case Types.String:
                    result.setProperty('.value', left.getProperty('.value') == right.getProperty('.value'));
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
            let left = context.self;
            let result = Obj.create(context, Types.Boolean);

            switch (right.type) {
                case Types.Number:
                    result.setProperty('.value', left.getProperty('.value').length > right.getProperty('.value'));
                    break;
                case Types.String:
                    result.setProperty('.value', left.getProperty('.value').length > right.getProperty('.value').length);
                    break;
                case Types.Undefined:
                    result.setProperty('.value', true);
                    break;
                default:
                    err(`Invalid use of operator '>'`);
                    break;
            }

            return result;
        })));

        this.functions.set('<', new Func('<', ['right'], new NativeExpression((context, err) => {
            let right = context.environment.getValue('right');
            let left = context.self;
            let result = Obj.create(context, Types.Boolean);

            switch (right.type) {
                case Types.Number:
                    result.setProperty('.value', left.getProperty('.value').length < right.getProperty('.value'));
                    break;
                case Types.String:
                    result.setProperty('.value', left.getProperty('.value').length < right.getProperty('.value').length);
                    break;
                case Types.Undefined:
                    result.setProperty('.value', true);
                    break;
                default:
                    err(`Invalid use of operator '<'`);
                    break;
            }

            return result;
        })));

        this.functions.set('>=', new Func('>=', ['right'], new NativeExpression((context, err) => {
            let right = context.environment.getValue('right');
            let left = context.self;
            let result = Obj.create(context, Types.Boolean);

            switch (right.type) {
                case Types.Number:
                    result.setProperty('.value', left.getProperty('.value').length >= right.getProperty('.value'));
                    break;
                case Types.String:
                    result.setProperty('.value', left.getProperty('.value').length >= right.getProperty('.value').length);
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

        this.functions.set('<=', new Func('<=', ['right'], new NativeExpression((context, err) => {
            let right = context.environment.getValue('right');
            let left = context.self;
            let result = Obj.create(context, Types.Boolean);

            switch (right.type) {
                case Types.Number:
                    result.setProperty('.value', left.getProperty('.value').length <= right.getProperty('.value'));
                    break;
                case Types.String:
                    result.setProperty('.value', left.getProperty('.value').length <= right.getProperty('.value').length);
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

        // The length of the string
        this.functions.set('length', new Func('length', [], new NativeExpression(context => {
            let result = Obj.create(context, Types.Number);
            result.setProperty('.value', context.self.getProperty('.value').length);
            return result;
        })));

        this.functions.set('toBoolean', new Func('toBoolean', [], new NativeExpression(context => {
            let bool = Obj.create(context, Types.Boolean);
            bool.setProperty('.value', context.self.getProperty('.value').length > 0);
            return bool;
        })));

        // It's already a string
        this.functions.set('toString', new Func('toString', [], new NativeExpression(context => {
            return context.self;
        })));
    }
}