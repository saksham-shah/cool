const Expression = require('../ast/expression');
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
    // RETURNS: The address of that reference
    getAddress(context, reference) {

    }

    // RETURNS: Obj
    static evaluate(context, expression) {

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
        // STUFF
    }

    // RETURNS: Result of the binary expression
    static evaluateBinaryExpression(context, expression) {
        // STUFF
    }

    // RETURNS: Evaluation of the last expression in the block
    static evaluateBlock(context, block) {
        // STUFF
    }

    // RETURNS: Boolean Obj
    static evaluateBooleanLiteral(context, boolean) {
        // STUFF
    }

    // RETURNS: Class Obj
    static evaluateClass(context, klass) {
        // STUFF
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
        // STUFF
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
        // STUFF
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