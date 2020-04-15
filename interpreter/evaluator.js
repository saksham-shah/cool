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

    // Takes an expression and returns a string or number
    // Used for square bracket properties as only strings and numbers can be properties
    // RETURNS: String or Number Obj
    static getNameFromExpression(context, expr, object) {
        let nameObj = this.evaluate(context, expr);

        // No need to do this if it is already a string
        // Numbers are also excluded as they are used with Array-like objects
        if (nameObj.type != Types.String && nameObj.type != Types.Number) {
            let call = new FunctionCall(new Reference('toString', expr));
            nameObj = this.evaluateFunctionCall(context, call);
        }

        // If a Number is used, make sure the object is Array-like
        if (nameObj.type == Types.Number) {
            if (object.type != Types.String && object.type != Types.Array) {
                throw new Error(Report.error(`Properties of non-Array-like objects cannot be Numbers`, expr.line, expr.column, expr.file));
            }
        }

        return nameObj;
    }

    // All 'evaluate' methods return an Obj

    // RETURNS: Array Obj
    static evaluateArrayLiteral(context, array) {
        let obj = Obj.create(context, Types.Array);
        let arrayItems = [];

        // Evaluate each item and push it to the array
        for (let item of array.items) {
            arrayItems.push(this.evaluate(context, item));
        }

        obj.setProperty('.value', arrayItems);
        return obj;
    }

    // RETURNS: Obj set in the assignment
    static evaluateAssignment(context, assignment) {
        let value;
        if (assignment.operator == '=') {
            value = this.evaluate(context, assignment.value);
        } else {
            // Other operators like '+='
            // Checks the first character and calls the apprpriate function
            let call = new FunctionCall(new Reference(assignment.operator[0], new Reference(assignment.identifier, assignment.object)), assignment.operator[0], [assignment.value]);
            value = this.evaluateFunctionCall(context, call);
        }

        if (assignment.object == undefined) {
            context.environment.setValue(assignment.identifier, value);
        } else {
            // If the assignment has an object, it is referring to a property of an object
            let obj = this.evaluate(context, assignment.object);

            if (obj.type == Types.Undefined) {
                throw new Error(Report.error(`Cannot set property of undefined object`, assignment.line, assignment.column, assignment.file));
            }

            let identifier = assignment.identifier;
            let nameObj = undefined;

            // Square bracket properties - e.g. Console["print"]() is the same as Console.print()
            if (identifier instanceof Expression) {
                nameObj = this.getNameFromExpression(context, identifier, obj);
                identifier = nameObj.getProperty('.value');
            }

            if (nameObj == undefined || nameObj.type == Types.String) {
                // Assign the value to the property
                obj.setProperty(identifier, value);
            } else {
                // The identifier is a number
                obj.setArrayProperty(identifier, value, assignment.identifier);
            }
        }

        return value;
    }

    // RETURNS: Result of the binary expression
    static evaluateBinaryExpression(context, expression) {
        // The built-in data types have functions for each of the main operators (e.g. +, -, *)
        let call = new FunctionCall(new Reference(expression.operator, expression.left), expression.operator, [expression.right]);
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

    // RETURNS: Boolean Obj
    static evaluateBooleanLiteral(context, boolean) {
        let obj = Obj.create(context, Types.Boolean);
        obj.setProperty('.value', boolean.value);
        return obj;
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

    static evaluateFunctionCall(context, call) {
        if (!(call.reference.isReference() || call.reference.isAssignment() || call.reference.isFunctionCall())) {
            throw new Error(Report.error(`Invalid function call`, call.line, call.column, call.file));
        }

        let object;
        let func = this.evaluate(context, call.reference);
        let name = call.reference.identifier;
        
        if (call.reference.object != undefined) {
            object = this.evaluate(context, call.reference.object);

            let nameObj = undefined;
            if (name instanceof Expression) {
                nameObj = this.getNameFromExpression(context, name, object);
                name = nameObj.getProperty('.value');
            }

            if (func.type != Types.Function) {
                if (name == undefined) {
                    throw new Error(Report.error(`Invalid function call`, call.line, call.column, call.file));
                } else if (nameObj == undefined || nameObj.type == Types.String) {
                    throw new Error(Report.error(`${name} is not a method of the ${object.type} class`, call.line, call.column, call.file));
                } else {
                    throw new Error(Report.error(`Object at index [${name}] is not a function`, call.line, call.column, call.file));
                }
            }
        } else {
            object = context.self;

            if (func.type != Types.Function) {
                if (name == undefined) {
                    throw new Error(Report.error(`Invalid function call`, call.line, call.column, call.file));
                } else {
                    throw new Error(Report.error(`${name} is not a function in the current scope`, call.line, call.column, call.file));
                }
            }
        }

        // if (func.type != Types.Function) {
        //     console.log(call)
        //     throw new Error(Report.error(`This is not a function`, call.line, call.column, call.file));
        // }

        if (func instanceof Obj) {
            func = func.getProperty('.function');
        } else {
            console.log('something is very wrong line 258 evaluator.js')
        }

        return this.evaluateFunctionCallImpl(context, object, func, call);
    }

    // Searches for the appropriate function to call
    // RETURNS: Result of the function call
    static evaluateFunctionCallOld(context, call) {
        let object, func;

        if (call.object != undefined) {
            // Looks for the function in the object
            object = this.evaluate(context, call.object);

            let functionName = call.name;
            let nameObj = undefined;

            // Square bracket properties - e.g. Console["print"]() is the same as Console.print()
            if (functionName instanceof Expression) {
                nameObj = this.getNameFromExpression(context, functionName, object);
                functionName = nameObj.getProperty('.value');
            }

            if (nameObj == undefined || nameObj.type == Types.String) {
                func = object.getProperty(functionName);

                if (func.type != Types.Function) {
                    throw new Error(Report.error(`${functionName} is not a method of the ${object.type} class`, call.line, call.column, call.file));
                }
            } else {
                // Function name is a number, meaning it is an item of an array
                func = object.getArrayProperty(functionName, call.name);

                if (func.type != Types.Function) {
                    throw new Error(Report.error(`Object at index [${functionName}] is not a function`, call.line, call.column, call.file));
                }
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
            console.log('something is very wrong line 258 evaluator.js')
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

        // Create the arguments array
        let arrayObj = Obj.create(context, Types.Array);
        arrayObj.setProperty('.value', argObjects);
        context.environment.setValue('arguments', arrayObj, true);

        // Set the 'self' of the context to the object that called the function
        let self = context.self;
        context.self = object;

        let value = this.evaluate(context, func.body);
        if (value == undefined) value = Obj.create(context, Types.Undefined);

        context.environment.exitScope();

        context.self = self;

        return value;
    }

    // RETURNS: Obj
    static evaluateIfElse(context, ifElse) {
        // Determine whether the condition evaluates to true
        let call = new FunctionCall(new Reference('toBoolean', ifElse.condition), 'toBoolean');
        let bool = this.evaluate(context, call);
        // Return undefined by default (e.g. if there is no else block and the condition is false)
        let value = Obj.create(context, Types.Undefined)

        if (bool.getProperty('.value')) {
            // If the condition is true
            value = this.evaluate(context, ifElse.thenBlock);

        } else if (ifElse.elseBlock != undefined) {
            // Only evaluate the else block if there is one
            value = this.evaluate(context, ifElse.elseBlock);
        }

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

            let identifier = reference.identifier;
            let nameObj = undefined;

            // Square bracket properties - e.g. Console["print"]() is the same as Console.print()
            if (identifier instanceof Expression) {
                nameObj = this.getNameFromExpression(context, identifier, obj);
                identifier = nameObj.getProperty('.value');
            }

            if (nameObj == undefined || nameObj.type == Types.String) {
                // Get the property of the object
                value = obj.getProperty(identifier);
            } else {
                // Indentifier is a number
                value = obj.getArrayProperty(identifier, reference.identifier);
            }
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

    // RETURNS: Obj
    static evaluateThis(context, thisExp) {
        return context.self;
    }

    // RETURNS: Result of the unary expression
    static evaluateUnaryExpression(context, expression) {
        // The built-in data types also have functions for unary operators (e.g. unary_+, unary_-)
        let call = new FunctionCall(new Reference('unary_' + expression.operator, expression.expression));
        call.copyLocation(expression);
        return this.evaluateFunctionCall(context, call);
    }

    // RETURNS: Undefined Obj
    static evaluateUndefinedLiteral(context, undef) {
        return Obj.create(context, Types.Undefined);
    }

    // RETURNS: Array Obj
    static evaluateWhile(context, whileExpr) {
        // Initial condition evaluation
        let call = new FunctionCall(new Reference('toBoolean', whileExpr.condition));
        let bool = this.evaluate(context, call);

        // Returns an array of the evaluations of each loop
        let value = Obj.create(context, Types.Array);
        let array = [];

        while (bool.getProperty('.value')) {
            array.push(this.evaluate(context, whileExpr.body));

            // Redo the condition after every loop
            call = new FunctionCall(new Reference('toBoolean', whileExpr.condition));
            bool = this.evaluate(context, call);
        }

        value.setProperty('.value', array);
        return value;
    }

    // Definitions simply set values in the context and don't return anything
    // RETURNS: Nothing
    static define(context, definition) {
        if (definition.isExtract()) {
            this.defineExtract(context, definition);

        } else if (definition.isFunction()) {
            this.defineFunction(context, definition);
        }
    }

    static defineExtract(context, extract) {
        let klass = this.evaluate(context, extract.klass);

        if (klass.type != Types.Class) {
            throw new Error(Report.error(`Extract must refer to a class in the current context`, extract.line, extract.column, extract.file));
        }

        // Go through all properties of the class and add them to the current scope
        let keyValuePairs = klass.getKeysOrValues();
        for (let pair of keyValuePairs) {
            context.environment.setValue(pair[0], pair[1]);
        }
    }

    static defineFunction(context, func) {
        let funcObj = Obj.create(context, Types.Function);
        funcObj.setProperty('.name', func.name);
        funcObj.setProperty('.function', func);

        // Set the function
        context.environment.setValue(func.name, funcObj);
    }
}