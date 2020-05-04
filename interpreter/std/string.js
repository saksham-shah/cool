const ArrayLiteral = require('../../ast/array');
const Class = require('../../ast/class');
const Func = require('../../ast/func');
const FunctionCall = require('../../ast/functioncall');
const NativeExpression = require('../../ast/nativeexpression');
const Reference = require('../../ast/reference');

const Evaluator = require('../../interpreter/evaluator');

const Types = require('../../types/types');

const TokenType = require('../../lexer/tokenType');

const err = require('../../utils/report').error;

module.exports = class extends Class {
    constructor() {
        super();

        this.name = Types.String;

        this.superClass = new Reference(Types.Object);

        // Comparison operators
        this.functions.set(TokenType.DoubleEquals, new Func(TokenType.DoubleEquals, ['right'], new NativeExpression(context => {
            let right = context.getValue(context.environment.get('right'));
            let left = context.self;
            let bool = Evaluator.create(context, Types.Boolean);

            // Different ways of comparing depending on data type
            switch (right.type) {
                case Types.Boolean:
                    bool.set('value', left.get('value').length > 0);
                    break;
                case Types.Number:
                    bool.set('value', left.get('value').length == right.get('value'));
                    break;
                case Types.String:
                    bool.set('value', left.get('value') == right.get('value'));
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

        // Functions for each operator, similar to the Number class
        this.functions.set(TokenType.Plus, new Func(TokenType.Plus, ['right'], new NativeExpression(context => {
            let right = context.getValue(context.environment.get('right'));
            let left = context.self;
            let result = Evaluator.create(context, Types.String);;

            // Different uses of '+' based on data type
            switch (right.type) {
                // case Types.Number:
                //     result = Evaluator.create(context, Types.String);
                //     result.set('value', left.get('value') + right.get('value'));
                //     break;
                case Types.String:
                    // result = Evaluator.create(context, Types.String);
                    result.set('value', left.get('value') + right.get('value'));
                    break;
                case Types.Undefined:
                    // result = Evaluator.create(context, Types.String);
                    result.set('value', left.get('value'));
                    break;
                default:
                    let toStringCall = new FunctionCall(new Reference('toString', new Reference('right')));
                    let strRight = Evaluator.evaluateFunctionCall(context, toStringCall);
                    result.set('value', left.get('value') + strRight.get('value'));
                    // err(`Invalid use of operator '${TokenType.Plus}'`);
                    break;
            }

            return result;
        })));

        this.functions.set(TokenType.Times, new Func(TokenType.Times, ['right'], new NativeExpression(context => {
            let right = context.getValue(context.environment.get('right'));
            let left = context.self;
            let result;

            // Different uses of '*' based on data type
            switch (right.type) {
                case Types.Number:
                    result = Evaluator.create(context, Types.String);
                    let str = '';
                    for (let i = 0; i < right.get('value'); i++) {
                        str += left.get('value');
                    }
                    result.set('value', str);
                    break;
                case Types.Undefined:
                    result = Evaluator.create(context, Types.String);
                    result.set('value', left.get('value'));
                    break;
                default:
                    err(`Invalid use of operator '${TokenType.Times}'`);
                    break;
            }

            return result;
        })));

        // Standard functions

        // Gets the character at a specified index of the string
        this.functions.set('charAt', new Func('charAt', ['index'], new NativeExpression(context => {
            let index = context.getValue(context.environment.get('index'));

            // Index must be a number
            if (index.type != Types.Number) {
                err(`String.charAt must take a Number`);
            }

            index = index.get('value');
            let str = context.self.get('value');

            // Allow negative indexing
            if (index < 0) index += str.length;
            // String index must be in range
            if (index < 0 || index >= str.length) {
                err(`String index [${index}] out of range`);
            }

            // Get the character at the index and return it as a String
            let result = Evaluator.create(context, Types.String);
            result.set('value', str[index]);
            return result;
        })));

        // The length of the string
        this.functions.set('length', new Func('length', [], new NativeExpression(context => {
            let result = Evaluator.create(context, Types.Number);
            result.set('value', context.self.get('value').length);
            return result;
        })));

        // Splits a string into an array of strings
        this.functions.set('split', new Func('split', ['char'], new NativeExpression(context => {
            let char = context.getValue(context.environment.get('char'));
            // Get the character from the 'char' object
            if (char.type == Types.Undefined) {
                // Empty string by default
                char = '';

            } else {
                // If char isn't already a string, turn it into one using toString
                if (char.type != Types.String) {
                    let call = new FunctionCall(new Reference('toString', new Reference('char')));
                    char = Evaluator.evaluateFunctionCall(context, call);
                }

                char = char.get('value');
            }

            // Split the string into an array using the given character
            let strArray = context.self.get('value').split(char);

            // Create an array of String objects
            let array = [];
            for (let str of strArray) {
                let obj = Evaluator.create(context, Types.String);
                obj.set('value', str);
                array.push(obj);
            }

            // Create and return the Array object
            array = new ArrayLiteral(array);
            return Evaluator.evaluateArrayLiteral(context, array);
        })));

        // to_ functions
        this.functions.set('toBoolean', new Func('toBoolean', [], new NativeExpression(context => {
            let bool = Evaluator.create(context, Types.Boolean);
            bool.set('value', context.self.get('value').length > 0);
            return bool;
        })));

        this.functions.set('toString', new Func('toString', [], new NativeExpression(context => {
            let str = Evaluator.create(context, Types.String);
            str.set('value', context.self.get('value'));
            return str;
        })));
    }
}