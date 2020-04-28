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

        this.superClass = new Reference(Types.Object);

        // Comparison operators
        this.functions.set(TokenType.DoubleEquals, new Func(TokenType.DoubleEquals, ['right'], new NativeExpression(context => {
            let right = context.getValue(context.environment.get('right'));
            let left = context.self;
            let bool = Evaluator.create(context, Types.Boolean);

            // Different ways of comparing depending on data type
            switch (right.type) {
                case Types.Array:
                    // Maybe it should check each item and see if they are equal?
                    if (left.get('value').length == 0) {
                        bool.set('value', right.get('value') == 0);
                    } else {
                        bool.set('value', left.address == right.address);
                    }
                    break;
                case Types.Boolean:
                    bool.set('value', left.get('value').length > 0);
                    break;
                case Types.Number:
                    bool.set('value', left.get('value').length == right.get('value'));
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
                    bool.set('value', left.get('value').length > right.get('value').length);
                    break;
                case Types.Number:
                    bool.set('value', left.get('value').length > right.get('value'));
                    break;
                case Types.String:
                    bool.set('value', left.get('value').length > right.get('value').length);
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

        this.functions.set(TokenType.GreaterThanOrEqual, new Func(TokenType.GreaterThanOrEqual, ['right'], new NativeExpression(context => {
            let right = context.getValue(context.environment.get('right'));
            let left = context.self;
            let bool = Evaluator.create(context, Types.Boolean);

            // Different ways of comparing depending on data type
            switch (right.type) {
                case Types.Array:
                    bool.set('value', left.get('value').length >= right.get('value').length);
                    break;
                case Types.Number:
                    bool.set('value', left.get('value').length >= right.get('value'));
                    break;
                case Types.String:
                    bool.set('value', left.get('value').length >= right.get('value').length);
                    break;
                case Types.Undefined:
                    bool.set('value', true);
                    break;
                default:
                    err(`Invalid use of operator '${TokenType.GreaterThanOrEqual}'`);
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
                    bool.set('value', left.get('value').length < right.get('value').length);
                    break;
                case Types.Number:
                    bool.set('value', left.get('value').length < right.get('value'));
                    break;
                case Types.String:
                    bool.set('value', left.get('value').length < right.get('value').length);
                    break;
                case Types.Undefined:
                    bool.set('value', true);
                    break;
                default:
                    err(`Invalid use of operator '${TokenType.LessThan}'`);
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
                    bool.set('value', left.get('value').length <= right.get('value').length);
                    break;
                case Types.Number:
                    bool.set('value', left.get('value').length <= right.get('value'));
                    break;
                case Types.String:
                    bool.set('value', left.get('value').length <= right.get('value').length);
                    break;
                case Types.Undefined:
                    bool.set('value', true);
                    break;
                default:
                    err(`Invalid use of operator '${TokenType.LessThanOrEqual}'`);
                    break;
            }

            return bool;
        })));

        // Add an item at the end of the array
        this.functions.set(TokenType.Plus, new Func(TokenType.Plus, ['item'], new NativeExpression(context => {
            let item = context.getValue(context.environment.get('item'));
            // Store the new item in memory and store its address
            let address = context.store.alloc(item);
            let arr = context.self.get('value');
            arr.push(address);

            return context.self;
        })));

        // Remove at item at a specified index (returns the removed item)
        this.functions.set(TokenType.Minus, new Func(TokenType.Minus, ['index'], new NativeExpression((context, err) => {
            let indexObj = context.getValue(context.environment.get('index'));

            // Array index must be a number
            if (indexObj.type != Types.Number) {
                err(`Invalid use of operator '${TokenType.Minus}' (Array index to remove must be Number)`);
            }

            let arr = context.self.get('value');
            let index = indexObj.get('value');

            // Allow negative indexing
            if (index < 0) index += arr.length;
            // Array index must be in range
            if (index < 0 || index >= arr.length) {
                err(`Invalid use of operator '${TokenType.Minus}' (Array index [${index}] out of range)`);
            }

            // Get the removed item
            let address = arr.splice(index, 1)[0];
            let removedItem = context.getValue(address);

            // Stop the value from being deleted when its address is freed
            context.store.addPlaceholder(removedItem);
            // Free the address as it is no longer being used
            context.store.free(address);

            return removedItem;
        })));

        // Standard functions

        // Goes through each item and calls a function on it
        this.functions.set('forEach', new Func('forEach', ['func'], new NativeExpression((context, err) => {
            let func = context.getValue(context.environment.get('func'));
            if (func.type != Types.Function) {
                err(`forEach must take a function`);
            }

            let array = context.self.get('value');

            // Calls the function on each item of the array
            for (let i = 0; i < array.length; i++) {
                let call = new FunctionCall(new Reference('func'), [new Reference(new NumberLiteral(i), new This()), new NumberLiteral(i), new This()]);
                Evaluator.evaluate(context, call);
            }

            return Evaluator.create(context, Types.Undefined);
        })));

        // The length of the array
        this.functions.set('length', new Func('length', [], new NativeExpression(context => {
            let result = Evaluator.create(context, Types.Number);
            result.set('value', context.self.get('value').length);
            return result;
        })));

        // to_ functions
        this.functions.set('toBoolean', new Func('toBoolean', [], new NativeExpression(context => {
            let bool = Evaluator.create(context, Types.Boolean);
            bool.set('value', context.self.get('value').length > 0);
            return bool;
        })));

        this.functions.set('toString', new Func('toString', ['level'], new NativeExpression(context => {
            let output;
            let array = context.self.get('value');

            // The level is how deep in the object we are
            let level = context.getValue(context.environment.get('level'));
            if (level.type == Types.Number) {
                level = level.get('value');
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
                    let call = new FunctionCall(new Reference('toString', new Reference(new NumberLiteral(i), new This())), [new NumberLiteral(level + 1)]);
                    // let call = new FunctionCall(new Reference('toString', new Reference(new NumberLiteral(i), new This()), [new NumberLiteral(level + 1)]));
                    let str = Evaluator.evaluate(context, call);
                    if (context.getValue(array[i]).type == Types.String) {
                        output += '"' + str.get('value') + '"';
                    } else {
                        output += str.get('value');
                    }
                }

                output += ']';
                
            } else {
                // Prevents issues with recursive objects
                output = `Array<${array.length}>`
            }
            
            let str = Evaluator.create(context, Types.String);
            str.set('value', output);
            return str;
        })));
    }
}