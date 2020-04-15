const Expression = require('./expression');
// const Obj = require('../interpreter/object');

module.exports = class extends Expression {
    constructor(name, superClass, params = [], functions = new Map(), statics = new Map()) {
        super();
        this.name = name;
        this.superClass = superClass;
        this.params = params;
        this.functions = functions;
        this.statics = statics;
    }

    isClass() {
        return true;
    }

    // Looks for a function in this class
    // If not found, recursively checks the super class
    // RETURNS: Function Expression (or undefined if the function isn't found)
    getMethod(context, functionName) {
        // If this class has the function, return it
        for (let [name, func] of this.functions) {
            if (name == functionName) return func;
        }

        // If a function hasn't been found and there is no super class
        // This means the function doesn't exist
        if (this.superClass == undefined) {
            return undefined;
        }

        // Recursion!
        let superClass = context.environment.getValue(this.superClass);

        let klass = superClass.getProperty('.class');

        return klass.getMethod(context, functionName);       
    }
}