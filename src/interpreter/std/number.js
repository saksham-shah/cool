const Class = require('../../ast/class');
const Func = require('../../ast/func');
const NativeExpression = require('../../ast/nativeexpression');
const Reference = require('../../ast/reference');

const Evaluator = require('../../interpreter/evaluator');

const Types = require('../../types/types');

const TokenType = require('../../lexer/tokenType');

const err = require('../../utils/report').error;

// Number Class
module.exports = class extends Class {
    constructor() {
        super();

        this.name = Types.Number;

        this.superClass = new Reference(Types.Object);

        this.params = ['value'];

        this.init = new NativeExpression(context => {
            let numAddress = context.self.getProperty('value');
            let num = context.getValue(numAddress);
            if (num.type != Types.Number) {
                err(`Number must be Number`);
            }

            num = num.get('value');

            // Set the internal value property
            context.self.set('value', num);

            // Delete the user-defined property
            context.store.free(numAddress);
            context.self.deleteProperty('value');
        });

        // Comparison operators
        this.functions.set(TokenType.DoubleEquals, new Func(TokenType.DoubleEquals, ['right'], new NativeExpression(context => {
            let right = context.getValue(context.environment.get('right'));
            let left = context.self;
            let bool = Evaluator.create(context, Types.Boolean);

            // Different ways of comparing depending on data type
            switch (right.type) {
                case Types.Array:
                    bool.set('value', left.get('value') == right.get('value').length);
                    break;
                case Types.Boolean:
                    bool.set('value', left.get('value') > 0);
                    break;
                case Types.Number:
                    bool.set('value', left.get('value') == right.get('value'));
                    break;
                case Types.String:
                    bool.set('value', left.get('value') == right.get('value').length);
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
                    bool.set('value', left.get('value') > right.get('value').length);
                    break;
                case Types.Number:
                    bool.set('value', left.get('value') > right.get('value'));
                    break;
                case Types.String:
                    bool.set('value', left.get('value') > right.get('value').length);
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
                    bool.set('value', left.get('value') >= right.get('value').length);
                    break;
                case Types.Number:
                    bool.set('value', left.get('value') >= right.get('value'));
                    break;
                case Types.String:
                    bool.set('value', left.get('value') >= right.get('value').length);
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
                    bool.set('value', left.get('value') < right.get('value').length);
                    break;
                case Types.Number:
                    bool.set('value', left.get('value') < right.get('value'));
                    break;
                case Types.String:
                    bool.set('value', left.get('value') < right.get('value').length);
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
                    bool.set('value', left.get('value') <= right.get('value').length);
                    break;
                case Types.Number:
                    bool.set('value', left.get('value') <= right.get('value'));
                    break;
                case Types.String:
                    bool.set('value', left.get('value') <= right.get('value').length);
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

        // Arithmetic operators
        this.functions.set(TokenType.Plus, new Func(TokenType.Plus, ['right'], new NativeExpression(context => {
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
                    err(`Invalid use of operator '${TokenType.Plus}'`);
                    break;
            }

            return result;
        })));

        this.functions.set(TokenType.Minus, new Func(TokenType.Minus, ['right'], new NativeExpression(context => {
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
                    err(`Invalid use of operator '${TokenType.Minus}'`);
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
                    err(`Invalid use of operator '${TokenType.Times}'`);
                    break;
            }

            return result;
        })));

        this.functions.set(TokenType.Divide, new Func(TokenType.Divide, ['right'], new NativeExpression(context => {
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
                    err(`Invalid use of operator '${TokenType.Divide}'`);
                    break;
            }

            return result;
        })));

        this.functions.set(TokenType.Mod, new Func(TokenType.Mod, ['right'], new NativeExpression(context => {
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
                    err(`Invalid use of operator '${TokenType.Mod}'`);
                    break;
            }

            return result;
        })));

        // Unary operators, like '-6'
        this.functions.set('unary_' + TokenType.Plus, new Func('unary_' + TokenType.Plus, [], new NativeExpression(context => {
            let result = Evaluator.create(context, Types.Number);
            result.set('value', context.self.get('value'));
            return result;
        })));

        this.functions.set('unary_' + TokenType.Minus, new Func('unary_' + TokenType.Minus, [], new NativeExpression(context => {
            let result = Evaluator.create(context, Types.Number);
            result.set('value', -context.self.get('value'));
            return result;
        })));

        // to_ functions
        this.functions.set('toBoolean', new Func('toBoolean', [], new NativeExpression(context => {
            let bool = Evaluator.create(context, Types.Boolean);
            bool.set('value', context.self.get('value') > 0);
            return bool;
        })));

        this.functions.set('toString', new Func('toString', [], new NativeExpression(context => {
            let str = Evaluator.create(context, Types.String);
            str.set('value', context.self.get('value').toString());
            return str;
        })));

    }
}