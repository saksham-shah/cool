const Class = require('../../ast/class');
const Func = require('../../ast/func');
const FunctionCall = require('../../ast/functioncall');
const NativeExpression = require('../../ast/nativeexpression');
const Reference = require('../../ast/reference');
const This = require('../../ast/this');

const Evaluator = require('../../interpreter/evaluator');

const Types = require('../../types/types');

const TokenType = require('../../lexer/tokenType');

// Boolean Class
module.exports = class extends Class {
    constructor() {
        super();

        this.name = Types.Boolean;

        this.superClass = new Reference(Types.Object);

        this.params = ['value'];

        this.init = new NativeExpression(context => {
            let boolAddress = context.self.getProperty('value');
            let bool = context.getValue(boolAddress);

            // Convert the property to a Boolean if it isn't one already
            if (bool.type != Types.Boolean) {
                let call = new FunctionCall(new Reference('toBoolean', new Reference('value', new This())));
                bool = Evaluator.evaluateFunctionCall(context, call);
            }

            bool = bool.get('value');

            // Set the internal value property
            context.self.set('value', bool);

            // Delete the user-defined property
            context.store.free(boolAddress);
            context.self.deleteProperty('value');
        });

        // Comparison operator
        this.functions.set(TokenType.DoubleEquals, new Func(TokenType.DoubleEquals, ['right'], new NativeExpression(context => {
            // Check what boolean the other object evaluates to
            let call = new FunctionCall(new Reference('toBoolean', new Reference('right')));
            let bool = Evaluator.evaluateFunctionCall(call);

            // If this boolean is false, flip the result
            if (!context.self.get('value')) {
                bool.set('value', !bool.get('value'));
            }

            return bool;
        })));

        // to_ functions
        this.functions.set('toBoolean', new Func('toBoolean', [], new NativeExpression(context => {
            let bool = Evaluator.create(context, Types.Boolean);
            bool.set('value', context.self.get('value'));
            return bool;
        })));

        this.functions.set('toString', new Func('toString', [], new NativeExpression(context => {
            let str = Evaluator.create(context, Types.String);
            str.set('value', context.self.get('value') ? TokenType.True : TokenType.False);
            return str;
        })));
    }
}