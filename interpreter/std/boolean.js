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

// Boolean Class
module.exports = class extends Class {
    constructor() {
        super();

        this.name = Types.Boolean;

        this.superClass = Types.Object;

        // Boolean operators
        this.functions.set(TokenType.And, new Func(TokenType.And, ['right'], new NativeExpression(context => {
            if (context.self.getProperty('.value')) {
                let call = new FunctionCall(new Reference('toBoolean', new Reference('right')), 'toBoolean');
                return Evaluator.evaluate(context, call);
            } else {
                let bool = Obj.create(context, Types.Boolean);
                bool.setProperty('.value', false);
                return bool;
            }
        })));

        this.functions.set(TokenType.Or, new Func(TokenType.Or, ['right'], new NativeExpression(context => {
            if (context.self.getProperty('.value')) {
                let bool = Obj.create(context, Types.Boolean);
                bool.setProperty('.value', true);
                return bool;
            } else {
                let call = new FunctionCall(new Reference('toBoolean', new Reference('right')), 'toBoolean');
                return Evaluator.evaluate(context, call);
            }
        })));

        // Comparison operators
        this.functions.set('==', new Func('==', ['obj'], new NativeExpression(context => {
            // let checkFunctionCall = new Reference('toBoolean', new Reference('obj'));
            // let boolFunc = Evaluator.evaluate(context, checkFunctionCall);
            // let bool;

            // if (boolFunc.type == Types.Function) {
            //     let call = new FunctionCall(new Reference('obj'), 'toBoolean');
            //     bool = Evaluator.evaluate(context, call);
                
            //     let result = context.self.getProperty('.value') == bool.getProperty('.value');
            //     bool.setProperty('.value', result);

            // } else {
            //     bool = Obj.create(context, Types.Boolean);
            //     bool.setProperty('.value', context.self.getProperty('.value'));
            // }

            let call = new FunctionCall(new Reference('toBoolean', new Reference('obj')), 'toBoolean');
            let bool = Evaluator.evaluate(context, call);
            
            let result = context.self.getProperty('.value') == bool.getProperty('.value');
            bool.setProperty('.value', result);
            
            return bool;
        })));

        // Opposite of the '==' function
        this.functions.set('!=', new Func('!=', ['right'], new NativeExpression(context => {
            let call = new FunctionCall(new Reference('==', new This()), '==', [new Reference('right')]);
            let bool = Evaluator.evaluateFunctionCall(context, call);
            bool.setProperty('.value', !bool.getProperty('.value'));
            return bool;
        })));

        // this.functions.set('!=', new Func('!=', ['obj'], new NativeExpression(context => {
        //     let checkFunctionCall = new Reference('toBoolean', new Reference('obj'));
        //     let boolFunc = Evaluator.evaluate(context, checkFunctionCall);

        //     if (boolFunc.type != Types.Function) {
        //         err(`No function 'toBoolean' for this object`)
        //     }

        //     let call = new FunctionCall(new Reference('obj'), 'toBoolean');
        //     let bool = Evaluator.evaluate(context, call);
            
        //     let result = context.self.getProperty('.value') != bool.getProperty('.value');
        //     bool.setProperty('.value', result);

        //     return bool;
        // })));

        this.functions.set('unary_!', new Func('unary_!', [], new NativeExpression(context => {
            // context.self.setProperty('.value', !context.self.getProperty('.value'));
            // return context.self;
            let result = Obj.create(context, Types.Boolean);
            result.setProperty('.value', !context.self.getProperty('.value'));
            return result;
        })));

        this.functions.set('toBoolean', new Func('toBoolean', [], new NativeExpression(context => {
            let bool = Obj.create(context, Types.Boolean);
            bool.setProperty('.value', context.self.getProperty('.value'));
            return bool;
        })));

        this.functions.set('toString', new Func('toString', [], new NativeExpression(context => {
            let str = Obj.create(context, Types.String);
            str.setProperty('.value', context.self.getProperty('.value') ? 'yes' : 'no');
            return str;
        })));
    }
}