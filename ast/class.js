const Expression = require('./expression');
// const Obj = require('../interpreter/object');

module.exports = class extends Expression {
    constructor(name, superClass, properties = [], functions = new Map(), statics = new Map()) {
        super();
        this.name = name;
        this.superClass = superClass;
        this.properties = properties;
        this.functions = functions;
        this.statics = statics;
    }

    isClass() {
        return true;
    }

    getMethod(context, functionName) {
        // for (let func of this.functions) {
        //     if (func.name == functionName) {
        //         return func;
        //     }
        // }

        for (let [name, func] of this.functions) {
            if (name == functionName) return func;
        }

        if (this.superClass == undefined) {
            return undefined;
        }

        let superClass = context.environment.getValue(this.superClass);

        let klass = superClass.getProperty('.class');

        return klass.getMethod(context, functionName);       
    }
}