const Expression = require('./expression');
//const Evaluator = require('../interpreter/evaluator');
//const Types = require('../types/types');

module.exports = class extends Expression {
    constructor(name, params = [], functions = new Map(), statics = new Map(), superClass = undefined, superArgs = [], init = undefined) {
        super();
        this.name = name;
        this.params = params;
        this.functions = functions;
        this.statics = statics;
        this.superClass = superClass;
        this.superArgs = superArgs;
        this.init = init;
    }

    isClass() {
        return true;
    }

    // RETURNS: Map of all static properties of this class (and all super classes)
    getStatics(context, selfObj, statics = new Map()) {
        // Recursively add the static properties of all super classes
        if (this.superClass != undefined) {
            let superClassAddress = selfObj.get('super');

            let superClass = context.getValue(superClassAddress);

            let klass = superClass.get('class');

            klass.getStatics(context, superClass, statics);
        }

        // Add each static property of this class
        for (let [name, expression] of this.statics) {
            statics.set(name, expression);
        }
        
        return statics;
    }

    // RETURNS: Map of all functions of this class (and all super classes)
    getFunctions(context, selfObj, functions = new Map()) {
        // Recursively add the functions of all super classes
        if (this.superClass != undefined) {
            let superClassAddress = selfObj.get('super');

            let superClass = context.getValue(superClassAddress);

            let klass = superClass.get('class');

            klass.getFunctions(context, superClass, functions);
        }

        // Add each function of this class
        for (let [name, expression] of this.functions) {
            functions.set(name, expression);
        }
        
        return functions;
    }
/*
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

    // Takes a class object and adds static properties to it
    // RETURNS: Nothing
    setStatics(context, classObj) {
        // Recursively add the static properties of all super classes
        if (this.superClass != undefined) {
            let superClass = context.environment.getValue(this.superClass);

            let klass = superClass.getProperty('.class');

            klass.setStatics(context, classObj);
        }

        // Add each static property
        for (let [name, expression] of this.statics) {
            let obj = Evaluator.evaluate(context, expression);
            classObj.setProperty(name, obj);
        }
    }
    */
}