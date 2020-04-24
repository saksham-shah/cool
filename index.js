const fs = require('fs');
const Lexer = require('./lexer/lexer');
const Parser = require('./parser/parser');
/*
const Evaluator = require('./interpreter/evaluator');

const Context = require('./interpreter/context');

const ObjectClass = require('./interpreter/std/obj');
const ArrayClass = require('./interpreter/std/array');
const BooleanClass = require('./interpreter/std/boolean');
const ClassClass = require('./interpreter/std/class');
const FunctionClass = require('./interpreter/std/func');
const NumberClass = require('./interpreter/std/number');
const StringClass = require('./interpreter/std/string');
const UndefinedClass = require('./interpreter/std/undefined');
const ConsoleClass = require('./interpreter/std/console');
*/

const Evaluator = require('./interpreter/evaluator');
const Context = require('./interpreter/context');

const ObjectClass = require('./interpreter/std/obj');
const ClassClass = require('./interpreter/std/class');
const FunctionClass = require('./interpreter/std/func');
const ArrayClass = require('./interpreter/std/array');
const NumberClass = require('./interpreter/std/number');
const StringClass = require('./interpreter/std/string');
const UndefinedClass = require('./interpreter/std/undefined');
const ConsoleClass = require('./interpreter/std/console');

const Reference = require('./ast/reference');

let codeText;

let classes = [];

const filename = 'code.cool';
// const filename = 'examples/car.cool';
// const filename = 'examples/chess/chess.cool';

fs.readFile(`./${filename}`, 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }

    codeText = data;
    console.log(codeText);

    let parser = new Parser(codeText, filename);

    let program = parser.parseProgram();

    console.log(program.expressions);

    let context = new Context();

    context.defaultSelf();

    classes.push(new ObjectClass());
    classes.push(new ClassClass());
    classes.push(new FunctionClass());
    classes.push(new ArrayClass());
    classes.push(new NumberClass());
    classes.push(new StringClass());
    classes.push(new UndefinedClass());
    classes.push(new ConsoleClass());

    addClasses(context, classes);

    // addClass(context, new ObjectClass());
    // addClass(context, new ClassClass());
    // addClass(context, new NumberClass());
    // addClass(context, new UndefinedClass());

    // console.log(context.store)

    // for (let i = 0; i < context.store.locations.length; i++) {
    //     console.log(context.store.locations[i]);
    // }

    let result = Evaluator.evaluate(context, program);

    // result = Evaluator.evaluate(context, new Reference('+', ))

    // console.log(context.store.locations)

    console.log(result);

    console.log(context.store.freeAddresses);

    console.log(`Memory used: ${context.store.locations.length - context.store.freeAddresses.length}/${context.store.locations.length}`)


/*
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
    addClass(context, new ArrayClass());
    addClass(context, new ConsoleClass());

    let result = Evaluator.evaluate(context, program);

    context.environment.exitScope();
    */
});

// Adds standard classes to the context
function addClasses(context, classes) {
    for (let klass of classes) {
        Evaluator.evaluateClass(context, klass);
    }
}

function addClass(context, klass) {
    let classObj = Evaluator.evaluateClass(context, klass);

    let address = context.store.alloc(classObj);
    classObj.address = address;

    context.setClass(klass.name, address);

    context.environment.set(klass.name, address);
}


/*
function addClass(context, klass) {
    let classObj = Evaluator.evaluateClass(context, klass);
    context.environment.setValue(klass.name, classObj);
}*/