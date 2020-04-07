const Class = require('../../ast/class');

const Types = require('../../types/types');

const Evaluator = require('../../interpreter/evaluator');

const Func = require('../../ast/func');
const FunctionCall = require('../../ast/functioncall');
const NativeExpression = require('../../ast/nativeexpression');
const Reference = require('../../ast/reference');

module.exports = class extends Class {
    constructor() {
        super();

        this.name = Types.Console;

        this.superClass = Types.Object;

        this.statics.push(new Func('print', ['obj'], new NativeExpression(context => {
            let call = new FunctionCall(new Reference('obj'), 'toString');
    
            let str = Evaluator.evaluate(context, call);
    
            console.log(str.getProperty('value'));
    
            return context.environment.getValue('obj');
        })));
    }
}