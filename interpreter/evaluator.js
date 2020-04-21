const Expression = require('../ast/expression');
const Assignment = require('../ast/assignment');
const FunctionCall = require('../ast/functioncall');
const Reference = require('../ast/reference');

const Obj = require('./object');
const Types = require('../types/types');

const Report = require('../utils/report');

// Evaluator methods take Expressions or Definitions and execute them
// All evaluating methods return an Obj (an Object in Cool)
// Defining methods do not return anything
module.exports = class {
    constructor() {

    }

    // Takes a reference and finds the address it refers to
    // RETURNS: The address of that reference, or undefined if it hasn't yet been stored
    static getAddress(context, reference) {
        let address;

        if (reference.object != undefined) {
            let obj = this.evaluate(context, reference.object);

            // STUFF - ["this stuff"]
            let propName = reference.identifier;
            if (propName instanceof Expression) {
                // convert it to string/number

                // TODO: deal with array indexing
            }

            // Look for the property on the object
            address = obj.getProperty(propName);
            if (address != undefined) return address;

            // Go through the object class and look for a function with that name
            if (address != undefined) return address;

            // Create a new property of the object
            address = context.store.alloc();
            obj.setProperty(propName, address);
            return address;

        } else {
            // Look for the identifier in the current scope
            address = context.environment.get(reference.identifier);
            if (address != undefined) return address;

            // Look for the property in the current 'this' object
            if (context.self != null) {
                address = context.self.getProperty(reference.identifier);
                if (address != undefined) return address;
            }

            // Create a new variable in the current scope
            address = context.store.alloc();
            context.environment.set(reference.identifier, address);
            return address;
        }
    }

    static create(context, type) {
        let address = this.getAddress(context, new Reference(type));

        let obj = new Obj(address);

        obj.type = type;

        return obj;
    }

    // RETURNS: Obj
    static evaluate(context, expression) {

        if (expression instanceof Obj) {
            return expression;
        }

        if (!(expression instanceof Expression)) {
            return expression;
        }

        if (expression.isArrayLiteral()) {
            return this.evaluateArrayLiteral(context, expression);
        }

        if (expression.isAssignment()) {
            return this.evaluateAssignment(context, expression);
        }

        if (expression.isBinaryExpression()) {
            return this.evaluateBinaryExpression(context, expression);
        }

        if (expression.isBlock()) {
            return this.evaluateBlock(context, expression);
        }

        if (expression.isBooleanLiteral()) {
            return this.evaluateBooleanLiteral(context, expression);
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

        if (expression.isIfElse()) {
            return this.evaluateIfElse(context, expression);
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

        if (expression.isThis()) {
            return this.evaluateThis(context, expression);
        }

        if (expression.isUnaryExpression()) {
            return this.evaluateUnaryExpression(context, expression);
        }

        if (expression.isUndefinedLiteral()) {
            return this.evaluateUndefinedLiteral(context, expression);
        }

        if (expression.isWhile()) {
            return this.evaluateWhile(context, expression);
        }
    }

    // All 'evaluate' methods return an Obj

    // RETURNS: Array Obj
    static evaluateArrayLiteral(context, array) {
        // STUFF
    }

    // RETURNS: Obj set in the assignment
    static evaluateAssignment(context, assignment) {
        // Calculate the value - TODO: other operators
        let value = this.evaluate(context, assignment.value);

        // Store the value
        let address = this.getAddress(context, assignment.reference);

        // if (address == undefined) {
        //     address = context.store.alloc(value);
        // } else {
        //     context.store.write(address, value);
        // }

        context.store.write(address, value);

        // If the value object has no address, store its address
        if (value.address == undefined) {
            value.address = address;
        }

        return value;
    }

    // RETURNS: Result of the binary expression
    static evaluateBinaryExpression(context, expression) {
        // STUFF
    }

    // RETURNS: Evaluation of the last expression in the block
    static evaluateBlock(context, block) {
        let latest = this.create(context, Types.Undefined);

        context.environment.enterScope();

        // Returns the result of the last expression
        for (let expression of block.expressions) {
            latest = this.evaluate(context, expression);
        }

        context.environment.exitScope();

        return latest;
    }

    // RETURNS: Boolean Obj
    static evaluateBooleanLiteral(context, boolean) {
        // STUFF
    }

    // RETURNS: Class Obj
    static evaluateClass(context, klass) {
        // Create the class object
        let classObj = this.create(context, Types.Class);

        classObj.set('class', klass);
        
        // Set its super class if it has one
        if (klass.superClass != undefined) {
            let superObj = this.evaluate(context, klass.superClass);
            if (superObj.address == undefined) {
                console.log(`Super class has no address - evaluator.js`)
            }
            classObj.set('super', superObj.address);
        }

        let statics = klass.setStatics(context, classObj);
        for (let [name, expression] of statics) {
            let assign = new Assignment(new Reference(name, classObj), '=', expression);
            this.evaluateAssignment(context, assign);
        }

        if (klass.name != undefined) {
            let assign = new Assignment(new Reference(klass.name), '=', classObj);
            this.evaluate(context, assign);
        }

        return classObj;
    }

    // Creates objects when the 'new' keyword is used
    // RETURNS: Obj
    static evaluateClassCall(context, call) {
        // STUFF
    }

    // RETURNS: Function Obj
    static evaluateFunction(context, func) {
        // STUFF
    }

    // Searches for the appropriate function to call
    // RETURNS: Result of the function call
    static evaluateFunctionCall(context, call) {
        if (call.constructor) {
            return this.evaluateClassCall(context, call);
        }

        // STUFF
    }

    // The above function deals with choosing the correct function to use
    // This one actually calls the function and evaluates the arguments
    // RETURNS: Result of the function call
    static evaluateFunctionCallImpl(context, object, func, call) {
        // STUFF
    }

    // RETURNS: Obj
    static evaluateIfElse(context, ifElse) {
        // STUFF
    }

    // RETURNS: Number Obj
    static evaluateNumberLiteral(context, number) {
        let obj = this.create(context, Types.Number);
        obj.set('value', number.value);
        return obj;
    }

    // A native expression is an expression written in JavaScript rather than Cool
    // Used for built-in data types and functions
    // RETURNS: Result of the native expression
    static evaluateNativeExpression(context, expression) {
        // STUFF
        return expression.func(context, Report.throwError);
    }

    // RETURNS: Obj that the reference points to
    static evaluateReference(context, reference) {
        let address = this.getAddress(context, reference);

        return context.getValue(address);
    }

    // RETURNS: String Obj
    static evaluateStringLiteral(context, string) {
        // STUFF
    }

    // RETURNS: Obj
    static evaluateThis(context, thisExp) {
        return context.self;
    }

    // RETURNS: Result of the unary expression
    static evaluateUnaryExpression(context, expression) {
        // STUFF
    }

    // RETURNS: Undefined Obj
    static evaluateUndefinedLiteral(context, undef) {
        // STUFF
    }

    // RETURNS: Array Obj
    static evaluateWhile(context, whileExpr) {
        // STUFF
    }
}