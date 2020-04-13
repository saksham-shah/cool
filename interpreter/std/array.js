const Class = require('../../ast/class');
const Func = require('../../ast/func');
const FunctionCall = require('../../ast/functioncall');
const NativeExpression = require('../../ast/nativeexpression');
const NumberLiteral = require('../../ast/number');
const Reference = require('../../ast/reference');
const This = require('../../ast/this');

const Evaluator = require('../../interpreter/evaluator');

const Obj = require('../object');
const Types = require('../../types/types');

const TokenType = require('../../lexer/tokenType');

module.exports = class extends Class {
    constructor() {
        super();

        this.name = Types.Array;

        this.superClass = Types.Object;

        // Add an item at the end of the array
        this.functions.set('+', new Func('+', ['right'], new NativeExpression(context => {
            let obj = context.environment.getValue('right');
            let arr = context.self.getProperty('.value');
            arr.push(obj);

            return context.self;
        })));

        // Remove an item at a particular index
        this.functions.set('-', new Func('-', ['right'], new NativeExpression((context, err) => {
            let obj = context.environment.getValue('right');
            if (obj.type != Types.Number) {
                err(`Invalid use of operator '-' (Array index to remove must be Number)`)
            }

            let arr = context.self.getProperty('.value');
            let index = obj.getProperty('.value');
            let removedItem = arr.splice(index, 1);

            return removedItem[0];
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
                case Types.Array:
                    result.setProperty('.value', left.getProperty('.value') == right.getProperty('.value'));
                    break;
                case Types.Boolean:
                    result.setProperty('.value', left.getProperty('.value').length > 0);
                    break;
                case Types.Number:
                    result.setProperty('.value', left.getProperty('.value').length == right.getProperty('.value'));
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
                case Types.Array:
                    result.setProperty('.value', left.getProperty('.value').length > right.getProperty('.value').length);
                    break;
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
                case Types.Array:
                    result.setProperty('.value', left.getProperty('.value').length < right.getProperty('.value').length);
                    break;
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
                case Types.Array:
                    result.setProperty('.value', left.getProperty('.value').length >= right.getProperty('.value').length);
                    break;
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
                case Types.Array:
                    result.setProperty('.value', left.getProperty('.value').length <= right.getProperty('.value').length);
                    break;
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

        this.functions.set('forEach', new Func('forEach', ['func'], new NativeExpression((context, err) => {
            let func = context.environment.getValue('func');
            if (func.type != Types.Function) {
                return Obj.create(Types.Undefined);
            }

            let array = context.self.getProperty('.value');

            for (let item of array) {
                let call = new FunctionCall(undefined, 'func', [item]);
                Evaluator.evaluate(context, call);
            }

            return Obj.create(Types.Undefined);
        })));

        // The length of the array
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

        this.functions.set('toString', new Func('toString', ['level'], new NativeExpression(context => {
            let output;
            let array = context.self.getProperty('.value');

            // The level is how deep in the object we are
            let level = context.environment.getValue('level');
            if (level.type == Types.Number) {
                level = level.getProperty('.value');
            } else {
                level = 0;
            }

            if (level < 3) {
                output = '[';
                // Convert each item to a string and join it with commas
                for (let i = 0; i < array.length; i++) {
                    if (i > 0) {
                        output += ', '
                    }

                    // Calling 'toString' on each item of the array
                    let call = new FunctionCall(new Reference(new NumberLiteral(i), new This()), 'toString', [new NumberLiteral(level + 1)]);
                    let str = Evaluator.evaluate(context, call);
                    output += str.getProperty('.value');
                }

                output += ']';

                // This code below does work, but it's too inefficient to be worth using

                // let str = Obj.create(context, Types.String);
                // str.setProperty('.value', '[');
                // context.environment.setValue('.output', str);

                // let call = new FunctionCall(new This(), 'forEach', [new Func(undefined, ['item'], new NativeExpression((context, err) => {
                //     let toStrCall = new FunctionCall(new Reference('item'), 'toString');
                //     // let itemStr = Evaluator.evaluate(context, toStrCall);

                //     let appendStrCall = new FunctionCall(new Reference('.output'), '+', [toStrCall]);

                //     let outputStr = Evaluator.evaluate(context, appendStrCall);
                //     context.environment.setValue('.output', outputStr);
                // }))]);

                // Evaluator.evaluate(context, call);

                // let outputObj = context.environment.getValue('.output');
                // output = outputObj.getProperty('.value') + ']';
                
            } else {
                // Prevents issues with recursive objects
                output = `Array<${array.length}>`
            }
            
            let str = Obj.create(context, Types.String);
            str.setProperty('.value', output);
            return str;
        })));
    }
}