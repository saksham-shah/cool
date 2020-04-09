const Expression = require('../ast/expression');
const FunctionCall = require('../ast/functioncall');

const Obj = require('./object');
const Types = require('../types/types');

const Report = require('../utils/report');

// Evaluator methods take Expressions or Definitions and execute them
// All evaluating methods return an Obj (an Object in Cool)
// Defining methods do not return anything
module.exports = class {
    constructor() {

    }

    // RETURNS: Obj
    static evaluate(context, expression) {
        if (expression.isAssignment()) {
            return this.evaluateAssignment(context, expression);
        }

        if (expression.isBinaryExpression()) {
            return this.evaluateBinaryExpression(context, expression);
        }

        if (expression.isBlock()) {
            return this.evaluateBlock(context, expression);
        }

        if (expression.isClass()) {
            return this.evaluateClass(context, expression);
        }

        if (expression.isFunction()) {
            return this.evaluateFunction(context, expression);
        }

        if (expression.isFunctionCall()) {
            return this.evaluateFunctionCall(context, expression);
        }

        if (expression.isNumberLiteral()) {
            return this.evaluateNumberLiteral(context, expression);
        }

        if (expression.isNativeExpression()) {
            return this.evaluateNativeExpression(context, expression);
        }

        if (expression.isReference()) {
            return this.evaluateReference(context, expression);
        }

        if (expression.isStringLiteral()) {
            return this.evaluateStringLiteral(context, expression);
        }

        if (expression.isUnaryExpression()) {
            return this.evaluateUnaryExpression(context, expression);
        }
    }

    // All 'evaluate' methods return an Obj

    // RETURNS: Obj set in the assignment
    static evaluateAssignment(context, assignment) {
        let value = this.evaluate(context, assignment.value);

        if (assignment.object == undefined) {
            context.environment.setValue(assignment.identifier, value);
        } else {
            // If the assignment has an object, it is referring to a property of an object
            let obj = this.evaluate(context, assignment.object);

            if (obj.type == Types.Undefined) {
                throw new Error(Report.error(`Cannot set property of undefined object`, assignment.line, assignment.column, assignment.file));
            }

            // Assign the value to the property
            obj.setProperty(assignment.identifier, value);
        }

        return value;
    }

    // RETURNS: Result of the binary expression
    static evaluateBinaryExpression(context, expression) {
        // The built-in data types have functions for each of the main operators (e.g. +, -, *)
        let call = new FunctionCall(expression.left, expression.operator, [expression.right]);
        call.copyLocation(expression);
        return this.evaluateFunctionCall(context, call);
    }

    // RETURNS: Evaluation of the last expression in the block
    static evaluateBlock(context, block) {
        let latest = Obj.create(context, Types.Undefined);

        // May not be required - UNSURE
        context.environment.enterScope();

        // Does all of the definitions first
        // UNSURE - may need to be changed to mix the two types
        for (let definition of block.definitions) {
            this.define(context, definition);
        }

        for (let expression of block.expressions) {
            latest = this.evaluate(context, expression);
        }

        context.environment.exitScope();

        return latest;
    }

    // RETURNS: Class Obj
    static evaluateClass(context, klass) {
        let classObj = Obj.create(context, Types.Class);
        // Some classes will be anonymous
        classObj.setProperty('.name', klass.name != undefined ? klass.name : '[Anonymous]');
        classObj.setProperty('.class', klass);
        for (let [name, expression] of klass.statics) {
            // let funcObj = this.evaluateFunction(context, func);
            // classObj.setProperty(func.name, funcObj);

            let obj = this.evaluate(context, expression);
            classObj.setProperty(name, obj);
        }
        
        return classObj;
    }

    // RETURNS: Function Obj
    static evaluateFunction(context, func) {
        let funcObj = Obj.create(context, Types.Function);
        // Some functions will be anonymous
        funcObj.setProperty('.name', func.name != undefined ? func.name : '[Anonymous]');
        funcObj.setProperty('.function', func);
        return funcObj;
    }

    // Searches for the appropriate function to call
    // RETURNS: Result of the function call
    static evaluateFunctionCall(context, call) {
        let object, func;

        if (call.object != undefined) {
            // Looks for the function in the object
            object = this.evaluate(context, call.object);
            func = object.getProperty(call.name);

            if (func.type != Types.Function) {
                throw new Error(Report.error(`${call.name} is not a method of the ${object.type} class`, call.line, call.column, call.file));
            }
        } else {
            // If there is no calling object, looks for the function in the current scope
            object = context.self;
            func = context.environment.getValue(call.name);

            if (func.type != Types.Function) {
                throw new Error(Report.error(`${call.name} is not a function in the current scope`, call.line, call.column, call.file));
            }
        }

        if (func instanceof Obj) {
            func = func.getProperty('.function');
        } else {
            console.log('something is very wrong line 162 evaluator.js')
        }

        return this.evaluateFunctionCallImpl(context, object, func, call);
    }

    // The above function deals with choosing the correct function to use
    // This one actually calls the function and evaluates the arguments
    // FUTURE: will also create the arguments array once that is implemented
    static evaluateFunctionCallImpl(context, object, func, call) {
        let argObjects = [];
        
        // Evaluates all of the arguments passed into the function
        for (let i = 0; i < call.args.length; i++) {
            // let thisArgument;
            // if (i >= call.args.length) {
            //     thisArgument = Obj.create(context, Types.Undefined);
            // } else {
            //     thisArgument = this.evaluate(context, call.args[i]);
            // }
            argObjects.push(this.evaluate(context, call.args[i]));
        }

        context.environment.enterScope();

        // Add each argument to the scope by setting it to the name of the corresponding parameter
        for (let i = 0; i < func.params.length; i++) {
            let thisArgument;
            if (i >= argObjects.length) {
                // If a parameter hasn't been passed into a function, it is set as Undefined
                thisArgument = Obj.create(context, Types.Undefined);
            } else {
                thisArgument = argObjects[i];
            }
            context.environment.setValue(func.params[i], thisArgument);
        }

        // Set the 'self' of the context to the object that called the function
        let self = context.self;
        context.self = object;

        let value = this.evaluate(context, func.body);

        context.environment.exitScope();

        context.self = self;

        return value;
    }

    // RETURNS: Number Obj
    static evaluateNumberLiteral(context, number) {
        let obj = Obj.create(context, Types.Number);
        obj.setProperty('.value', number.value);
        return obj;
    }

    // A native expression is an expression written in JavaScript rather than Cool
    // Used for built-in data types and functions
    // RETURNS: Result of the native expression
    static evaluateNativeExpression(context, expression) {
        return expression.func(context, Report.throwError);
    }

    // RETURNS: Obj that the reference points to
    static evaluateReference(context, reference) {
        let value;
        if (reference.object == undefined) {
            value = context.environment.getValue(reference.identifier);
        } else {
            // Like assignments, this refers to a property of an object
            let obj = this.evaluate(context, reference.object);

            if (obj.type == Types.Undefined) {
                throw new Error(Report.error(`Cannot get property of undefined object`, reference.line, reference.column, reference.file));
            }

            value = obj.getProperty(reference.identifier);
        }

        // UNSURE if this is needed at all
        if (value instanceof Expression) {
            value = this.evaluate(context, value);
            console.log('error error !!!!')
        }

        return value;
    }

    // RETURNS: String Obj
    static evaluateStringLiteral(context, string) {
        let obj = Obj.create(context, Types.String);
        obj.setProperty('.value', string.value);
        return obj;
    }

    // RETURNS: Result of the unary expression
    static evaluateUnaryExpression(context, expression) {
        // The built-in data types also have functions for unary operators (e.g. unary_+, unary_-)
        let call = new FunctionCall(expression.expression, 'unary_' + expression.operator);
        call.copyLocation(expression);
        return this.evaluateFunctionCall(context, call);
    }

    // Definitions simply set values in the context and don't return anything
    // RETURNS: Nothing
    static define(context, definition) {
        if (definition.isExtract()) {
            this.defineExtract(context, definition);
        }
    }

    static defineExtract(context, extract) {
        let klass = this.evaluate(context, extract.klass);

        if (klass.type != Types.Class) {
            throw new Error(Report.error(`Extract must refer to a class in the current context`, extract.line, extract.column, extract.file));
        }

        // klass = klass.getProperty('.class');

        // for (let func of klass.statics) {
        //     let funcObj = this.evaluateFunction(context, func);
        //     context.environment.setValue(func.name, funcObj);
        // }

        // Go through all properties of the class and add them to the current scope
        let keyValuePairs = klass.getKeysOrValues();
        for (let pair of keyValuePairs) {
            context.environment.setValue(pair[0], pair[1]);
        }
    }
}