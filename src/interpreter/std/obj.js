const Class = require('../../ast/class');
const Func = require('../../ast/func');
const FunctionCall = require('../../ast/functioncall');
const NativeExpression = require('../../ast/nativeexpression');
const Reference = require('../../ast/reference');
const This = require('../../ast/this');

const Evaluator = require('../../interpreter/evaluator');

const Types = require('../../types/types');

const TokenType = require('../../lexer/tokenType');

// The base Object Class
module.exports = class extends Class {
    constructor() {
        super();

        this.name = Types.Object;

        // Boolean operators
        this.functions.set(TokenType.Or, new Func(TokenType.Or, ['right'], new NativeExpression(context => {
            let call = new FunctionCall(new Reference('toBoolean', new This()));
            let bool = Evaluator.evaluateFunctionCall(context, call);
            if (bool.get('value')) return bool;

            call = new FunctionCall(new Reference('toBoolean', new Reference('right')));
            bool = Evaluator.evaluateFunctionCall(context, call);
            return bool;
        })));

        this.functions.set(TokenType.And, new Func(TokenType.And, ['right'], new NativeExpression(context => {
            let call = new FunctionCall(new Reference('toBoolean', new This()));
            let bool = Evaluator.evaluateFunctionCall(context, call);
            if (!bool.get('value')) return bool;

            call = new FunctionCall(new Reference('toBoolean', new Reference('right')));
            bool = Evaluator.evaluateFunctionCall(context, call);
            return bool;
        })));

        // Comparison operators
        this.functions.set(TokenType.DoubleEquals, new Func(TokenType.DoubleEquals, ['right'], new NativeExpression(context => {
            let right = context.getValue(context.environment.get('right'));
            let bool = Evaluator.create(context, Types.Boolean);

            bool.set('value', context.self.address == right.address);

            return bool;
        })));

        this.functions.set(TokenType.NotEqual, new Func(TokenType.NotEqual, ['right'], new NativeExpression(context => {
            // Get the result of ==
            let call = new FunctionCall(new Reference(TokenType.DoubleEquals, new This()), [new Reference('right')]);
            let bool = Evaluator.evaluateFunctionCall(context, call);
            
            // Flip the boolean
            bool.set('value', !bool.get('value'));

            return bool;
        })));

        // Unary operators
        this.functions.set('unary_' + TokenType.Not, new Func('unary_' + TokenType.Not, [], new NativeExpression(context => {
            // Evaluate the object to a boolean
            let call = new FunctionCall(new Reference('toBoolean', new This()));
            let bool = Evaluator.evaluateFunctionCall(context, call);
            
            // Flip the boolean
            bool.set('value', !bool.get('value'));

            return bool;
        })));

        // to_ functions
        this.functions.set('toBoolean', new Func('toBoolean', [], new NativeExpression(context => {
            // Check how many properties the object has
            // let references = context.self.getReferences().length;
            
            let bool = Evaluator.create(context, Types.Boolean);
            // If the object has no references (i.e. it's an empty object), it is false
            // Otherwise it is true
            // bool.set('value', references > 0);

            // All objects are true
            // In the future, empty objects should be false
            bool.set('value', true);

            return bool;
        })));

        this.functions.set('toString', new Func('toString', [], new NativeExpression(context => {
            let type = context.self.type == undefined ? 'Object' : context.self.type;

            let str = Evaluator.create(context, Types.String);

            if (context.self.address != undefined) {
                str.set('value', `<${type}@${context.self.address}>`);
            } else {
                str.set('value', `<unstored ${type}>`);
            }

            return str;
        })));
    }
}