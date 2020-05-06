const Parser = require('./parser/parser');

const Evaluator = require('./interpreter/evaluator');
const Context = require('./interpreter/context');

const ObjectClass = require('./interpreter/std/obj');
const ClassClass = require('./interpreter/std/class');
const FunctionClass = require('./interpreter/std/func');
const ArrayClass = require('./interpreter/std/array');
const BooleanClass = require('./interpreter/std/boolean');
const NumberClass = require('./interpreter/std/number');
const StringClass = require('./interpreter/std/string');
const UndefinedClass = require('./interpreter/std/undefined');
const ConsoleClass = require('./interpreter/std/console');

module.exports = class {
    constructor(code, filePath, store) {
        // let path = p.join('./cool/code', filePath);

        // if (!fs.existsSync(path)) {
        //     Report.error(`No such file ${filePath}`)
        // }

        // if (!fs.lstatSync(path).isDirectory()) {
        //     Report.error(`${filePath} is a directory`)
        // }

        // this.code = fs.readFileSync(path, 'utf8');

        this.filePath = filePath;
        this.code = code;

        this.context = new Context(store);
    }

    run() {
        let parser = new Parser(this.code, this.filePath);

        let program = parser.parseProgram();

        this.context.defaultSelf();

        this.loadClasses();

        return Evaluator.evaluate(this.context, program);
    }

    loadClasses() {
        let classes = [];

        classes.push(new ObjectClass());
        classes.push(new ClassClass());
        classes.push(new FunctionClass());
        classes.push(new ArrayClass());
        classes.push(new BooleanClass());
        classes.push(new NumberClass());
        classes.push(new StringClass());
        classes.push(new UndefinedClass());
        classes.push(new ConsoleClass());

        for (let klass of classes) {
            Evaluator.evaluateClass(this.context, klass);
        }
    }
}