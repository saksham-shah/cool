const fs = require('fs');
const Lexer = require('./lexer/lexer');
const Parser = require('./parser/parser');
const Evaluator = require('./interpreter/evaluator');

const Context = require('./interpreter/context');

const Func = require('./ast/func');
const FunctionCall = require('./ast/functioncall');
const NativeExpression = require('./ast/nativeexpression');
const Reference = require('./ast/reference');

const Obj = require('./interpreter/object');
const Types = require('./types/types');

const ObjectClass = require('./interpreter/std/obj');
const FunctionClass = require('./interpreter/std/func');
const IntClass = require('./interpreter/std/int');
const StringClass = require('./interpreter/std/string');
const UndefinedClass = require('./interpreter/std/undefined');

let codeText;

const filename = 'code.cool';

fs.readFile(`./${filename}`, 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }

    codeText = data;
    console.log(codeText);

    let parser = new Parser(codeText, filename);

    let program = parser.parseProgram();

    // console.log(program);

    let context = new Context();
    context.addClass(new ObjectClass());
    context.addClass(new FunctionClass());
    context.addClass(new IntClass());
    context.addClass(new StringClass());
    context.addClass(new UndefinedClass());

    context.defaultSelf();

    context.environment.enterScope();

    context.addFunction(new Func('print', ['obj'], new NativeExpression(context => {
        let call = new FunctionCall(new Reference('obj'), 'toString');

        let str = Evaluator.evaluate(context, call);

        console.log(str.getProperty('value'));

        return context.environment.getValue('obj');
    })))

    let result = Evaluator.evaluate(context, program);

    context.environment.exitScope();

    //console.log(context);


    //console.log(result);
});

