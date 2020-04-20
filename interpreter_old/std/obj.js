const Class = require('../../ast/class');
const Func = require('../../ast/func');
const NativeExpression = require('../../ast/nativeexpression');

const Obj = require('../object');
const Types = require('../../types/types');

const TokenType = require('../../lexer/tokenType');

// The base Object Class
module.exports = class extends Class {
    constructor() {
        super();

        this.name = Types.Object;

        // Boolean operators
        this.functions.set(TokenType.And, new Func(TokenType.And, ['right'], new NativeExpression(context => {
            let call = new FunctionCall(new Reference('toBoolean', new Reference('right')), 'toBoolean');
            return Evaluator.evaluate(context, call);
        })));

        this.functions.set(TokenType.Or, new Func(TokenType.Or, ['right'], new NativeExpression(context => {
            let bool = Obj.create(context, Types.Boolean);
            bool.setProperty('.value', true);
            return bool;
        })));

        // Comparison operators
        this.functions.set('==', new Func('==', ['right'], new NativeExpression(context => {
            let right = context.environment.getValue('right');
            let bool = Obj.create(context, Types.Boolean);
            if (right.type == Types.Boolean && right.getProperty('.value')) {
                bool.setProperty('.value', true);
            } else {
                bool.setProperty('.value', false);
            }
            return bool;
        })));

        this.functions.set('!=', new Func('!=', ['right'], new NativeExpression(context => {
            let right = context.environment.getValue('right');
            let bool = Obj.create(context, Types.Boolean);
            if (right.type == Types.Boolean && right.getProperty('.value')) {
                bool.setProperty('.value', false);
            } else {
                bool.setProperty('.value', true);
            }
            return bool;
        })));

        this.functions.set('toBoolean', new Func('toBoolean', [], new NativeExpression(context => {
            let bool = Obj.create(context, Types.Boolean);
            bool.setProperty('.value', true);
            return bool;
        })));

        this.functions.set('toString', new Func('toString', [], new NativeExpression(context => {
            let str = Obj.create(context, Types.String);
            str.setProperty('.value', '<Object>Object')
            return str;
        })));

        // Could have methods like instanceof
    }
}