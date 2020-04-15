const Class = require('../../ast/class');

const Types = require('../../types/types');

const Evaluator = require('../../interpreter/evaluator');

const Func = require('../../ast/func');
const FunctionCall = require('../../ast/functioncall');
const NativeExpression = require('../../ast/nativeexpression');
const NumberLiteral = require('../../ast/number');
const Reference = require('../../ast/reference');

// Has static functions relating to console input and output
module.exports = class extends Class {
    constructor() {
        super();

        this.name = Types.Console;

        this.superClass = Types.Object;

        // Outputs to the console
        this.statics.set('print', new Func('print', [], new NativeExpression(context => {
            // let call = new FunctionCall(new Reference('obj'), 'toString');
            // let str = Evaluator.evaluate(context, call);
    
            // console.log('OUTPUT: ' + str.getProperty('.value'));
    
            // return context.environment.getValue('obj');
            
            let output = '';
            let args = context.environment.getValue('arguments').getProperty('.value');

            // Convert each item to a string and join it with spaces
            for (let i = 0; i < args.length; i++) {
                if (i > 0) {
                    output += ' '
                }

                // Calling 'toString' on each item of the arguments array
                let call = new FunctionCall(new Reference(new NumberLiteral(i), new Reference('arguments')), 'toString');
                
                let str = Evaluator.evaluate(context, call);

                output += str.getProperty('.value');
            }

            console.log(`OUTPUT: ${output}`);
        })));

        // Just a test - the Math class will have this
        this.statics.set('PI', new NumberLiteral(3));
    }
}