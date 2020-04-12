const fs = require('fs');
const Lexer = require('./lexer/lexer');
const Parser = require('./parser/parser');
const Evaluator = require('./interpreter/evaluator');

const Context = require('./interpreter/context');

const ObjectClass = require('./interpreter/std/obj');
const BooleanClass = require('./interpreter/std/boolean');
const ClassClass = require('./interpreter/std/class');
const FunctionClass = require('./interpreter/std/func');
const NumberClass = require('./interpreter/std/number');
const StringClass = require('./interpreter/std/string');
const UndefinedClass = require('./interpreter/std/undefined');
const ConsoleClass = require('./interpreter/std/console');

let codeText;

// const filename = 'code.cool';
const filename = 'examples/division.cool';

fs.readFile(`./${filename}`, 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }

    codeText = data;
    console.log(codeText);

    let parser = new Parser(codeText, filename);

    let program = parser.parseProgram();

    // console.log(program.expressions[2].args[0]);

    let context = new Context();

    context.defaultSelf();

    context.environment.enterScope();

    addClass(context, new ObjectClass());
    addClass(context, new BooleanClass());
    addClass(context, new ClassClass());
    addClass(context, new UndefinedClass());
    addClass(context, new FunctionClass());
    addClass(context, new NumberClass());
    addClass(context, new StringClass());
    addClass(context, new ConsoleClass());

    let result = Evaluator.evaluate(context, program);

    context.environment.exitScope();
});

function addClass(context, klass) {
    let classObj = Evaluator.evaluateClass(context, klass);
    context.environment.setValue(klass.name, classObj);
}