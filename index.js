const fs = require('fs');
const Lexer = require('./lexer/lexer');
const Parser = require('./parser/parser');
const Evaluator = require('./interpreter/evaluator');

const Context = require('./interpreter/context');

const ObjectClass = require('./interpreter/std/obj');
const IntClass = require('./interpreter/std/int');
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

    let context = new Context();
    context.addClass(new ObjectClass());
    context.addClass(new IntClass());
    context.addClass(new UndefinedClass());

    context.defaultSelf();

    let result = Evaluator.evaluate(context, program);

    console.log(context);

    // console.log(program.expressions[1]);

    console.log(result);

    // let parser = new Parser(codeText, filename);

    // let test = parser.test();

    // console.log(test);

    // let lexer = new Lexer(codeText, filename);

    // let test = lexer.allTokens();
    // console.log(test);
});

