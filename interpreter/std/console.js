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
            // Create a string of the space (" ") character
            let space = Evaluator.create(context, Types.String);
            space.set('value', ' ');

            // Call the join method of arguments with the space character
            // arguments.join(" ")
            let call = new FunctionCall(new Reference('join', new Reference('arguments')), [space])
            let output = Evaluator.evaluateFunctionCall(context, call);

            // Print to the console
            console.log(`OUTPUT: ${output.get('value')}`);
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