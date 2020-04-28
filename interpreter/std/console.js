const Class = require('../../ast/class');

const Obj = require('../object');
const Types = require('../../types/types');

const Evaluator = require('../../interpreter/evaluator');

const Func = require('../../ast/func');
const FunctionCall = require('../../ast/functioncall');
const NativeExpression = require('../../ast/nativeexpression');
const NumberLiteral = require('../../ast/number');
const Reference = require('../../ast/reference');

const readline = require('readline-sync');

// Has static functions relating to console input and output
module.exports = class extends Class {
    constructor() {
        super();

        this.name = Types.Console;

        this.superClass = new Reference(Types.Object);

        // Outputs to the console
        this.statics.set('print', new Func('print', [], new NativeExpression(context => {
            let output = '';
            let addresses = context.getValue(context.environment.get('arguments')).get('value');

            // Convert each item to a string and join it with spaces
            for (let i = 0; i < addresses.length; i++) {
                if (i > 0) {
                    output += ' '
                }

                // Calling 'toString' on each item of the arguments array
                let call = new FunctionCall(new Reference('toString', new Reference(new NumberLiteral(i), new Reference('arguments'))));
                
                let str = Evaluator.evaluate(context, call);

                output += str.get('value');

                // Debugging
                //call = new Reference(new NumberLiteral(i), new Reference('arguments'));
                //let obj = Evaluator.evaluate(context, call);
                //console.log(obj);

            }

            console.log(`OUTPUT: ${output}`);
        })));

        // Input from the console
        this.statics.set('input', new Func('input', [], new NativeExpression(context => {            
            let input = readline.question(' INPUT: ');

            let strObj = Evaluator.create(context, Types.String);
            strObj.set('value', input);
            return strObj;
        })));

        // Just a test - the Math class will have this
        this.statics.set('PI', new NumberLiteral(3));
    }
}