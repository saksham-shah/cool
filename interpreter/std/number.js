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

// Number Class - name might change to Num or Number as I don't want a seperate Double class
module.exports = class extends Class {
    constructor() {
        super();

        this.name = Types.Number;

        this.superClass = Types.Object;

        // The '+' operator
        this.functions.set('+', new Func('+', ['right'], new NativeExpression((context, err) => {
            let right = context.environment.getValue('right');
            let left = context.self;
            let result;

            // Different uses of '+' based on data type
            switch (right.type) {
                case Types.Number:
                    result = Obj.create(context, Types.Number);
                    result.setProperty('.value', left.getProperty('.value') + right.getProperty('.value'));
                    break;
                case Types.String:
                    result = Obj.create(context, Types.String);
                    result.setProperty('.value', left.getProperty('.value') + right.getProperty('.value'));
                    break;
                case Types.Undefined:
                    result = Obj.create(context, Types.Number);
                    result.setProperty('.value', left.getProperty('.value'));
                    // result = left;
                    break;
                default:
                    err(`Invalid use of operator '+'`);
                    break;
            }

            return result;
        })));

        // Similar functions for other operators

        this.functions.set('-', new Func('-', ['right'], new NativeExpression((context, err) => {
            let right = context.environment.getValue('right');
            let left = context.self;
            let result;

            switch (right.type) {
                case Types.Number:
                    result = Obj.create(context, Types.Number);
                    result.setProperty('.value', left.getProperty('.value') - right.getProperty('.value'));
                    break;
                case Types.Undefined:
                    result = Obj.create(context, Types.Number);
                    result.setProperty('.value', left.getProperty('.value'));
                    break;
                default:
                    err(`Invalid use of operator '-'`);
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
                    result = Obj.create(context, Types.Number);
                    result.setProperty('.value', left.getProperty('.value') * right.getProperty('.value'));
                    break;
                case Types.String:
                    result = Obj.create(context, Types.String);
                    let str = '';
                    let substr = right.getProperty('.value');
                    for (var i = 0; i < left.getProperty('.value'); i++) {
                        str += substr;
                    }
                    result.setProperty('.value', str);
                    break;
                case Types.Undefined:
                    result = Obj.create(context, Types.Number);
                    result.setProperty('.value', left.getProperty('.value'));
                    break;
                default:
                    err(`Invalid use of operator '*'`);
                    break;
            }

            return result;
        })));

        // Integer division
        this.functions.set('/', new Func('/', ['right'], new NativeExpression((context, err) => {
            let right = context.environment.getValue('right');
            let left = context.self;
            let result;

            switch (right.type) {
                case Types.Number:
                    result = Obj.create(context, Types.Number);
                    result.setProperty('.value', Math.floor(left.getProperty('.value') / right.getProperty('.value')));
                    break;
                default:
                    err(`Invalid use of operator '/'`);
                    break;
            }

            return result;
        })));

        this.functions.set('%', new Func('%', ['right'], new NativeExpression((context, err) => {
            let right = context.environment.getValue('right');
            let left = context.self;
            let result;

            switch (right.type) {
                case Types.Number:
                    result = Obj.create(context, Types.Number);
                    result.setProperty('.value', left.getProperty('.value') % right.getProperty('.value'));
                    break;
                default:
                    err(`Invalid use of operator '%'`);
                    break;
            }

            return result;
        })));

        // Boolean operators
        this.functions.set(TokenType.And, new Func(TokenType.And, ['right'], new NativeExpression(context => {
            if (context.self.getProperty('.value') > 0) {
                let call = new FunctionCall(new Reference('right'), 'toBoolean');
                return Evaluator.evaluate(context, call);
            } else {
                let bool = Obj.create(context, Types.Boolean);
                bool.setProperty('.value', false);
                return bool;
            }
        })));

        this.functions.set(TokenType.Or, new Func(TokenType.Or, ['right'], new NativeExpression(context => {
            if (context.self.getProperty('.value') > 0) {
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
                    result.setProperty('.value', left.getProperty('.value') > 0);
                    break;
                case Types.Number:
                    result.setProperty('.value', left.getProperty('.value') == right.getProperty('.value'));
                    break;
                case Types.String:
                    result.setProperty('.value', left.getProperty('.value') == right.getProperty('.value').length);
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
                    result.setProperty('.value', left.getProperty('.value') > right.getProperty('.value'));
                    break;
                case Types.String:
                    result.setProperty('.value', left.getProperty('.value') > right.getProperty('.value').length);
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

        this.functions.set('>=', new Func('>=', ['right'], new NativeExpression((context, err) => {
            let right = context.environment.getValue('right');
            let left = context.self;
            let result = Obj.create(context, Types.Boolean);

            switch (right.type) {
                case Types.Number:
                    result.setProperty('.value', left.getProperty('.value') >= right.getProperty('.value'));
                    break;
                case Types.String:
                    result.setProperty('.value', left.getProperty('.value') >= right.getProperty('.value').length);
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
            let left = context.self;
            let result = Obj.create(context, Types.Boolean);

            switch (right.type) {
                case Types.Number:
                    result.setProperty('.value', left.getProperty('.value') < right.getProperty('.value'));
                    break;
                case Types.String:
                    result.setProperty('.value', left.getProperty('.value') < right.getProperty('.value').length);
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

        this.functions.set('<=', new Func('<=', ['right'], new NativeExpression((context, err) => {
            let right = context.environment.getValue('right');
            let left = context.self;
            let result = Obj.create(context, Types.Boolean);

            switch (right.type) {
                case Types.Number:
                    result.setProperty('.value', left.getProperty('.value') <= right.getProperty('.value'));
                    break;
                case Types.String:
                    result.setProperty('.value', left.getProperty('.value') <= right.getProperty('.value').length);
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

        // Unary operators, like '-6'
        this.functions.set('unary_+', new Func('unary_+', [], new NativeExpression(context => {
            let result = Obj.create(context, Types.Number);
            result.setProperty('.value', context.self.getProperty('.value'));
            return result;
        })));

        this.functions.set('unary_-', new Func('unary_-', [], new NativeExpression(context => {
            let result = Obj.create(context, Types.Number);
            result.setProperty('.value', -context.self.getProperty('.value'));
            return result;
        })));

        this.functions.set('toBoolean', new Func('toBoolean', [], new NativeExpression(context => {
            let bool = Obj.create(context, Types.Boolean);
            bool.setProperty('.value', context.self.getProperty('.value') > 0);
            return bool;
        })));

        this.functions.set('toString', new Func('toString', [], new NativeExpression(context => {
            let str = Obj.create(context, Types.String);
            str.setProperty('.value', context.self.getProperty('.value'));
            return str;
        })));
    }
}