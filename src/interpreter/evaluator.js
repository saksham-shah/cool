const Expression = require('../ast/expression');
const Assignment = require('../ast/assignment');
const FunctionCall = require('../ast/functioncall');
const Reference = require('../ast/reference');
const This = require('../ast/this');
const ArrayLiteral = require('../ast/array');

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
    static getAddress(context, reference, forceNewScope = false, forAssignment = false) {
        let address;

        // If the reference is already an object, just return the object's address
        if (reference instanceof Obj) {
            throw new Error();
            address = reference.address;
            if (address != undefined) return address;

            // Give the object an address if it doesn't have one
            address = context.store.alloc(reference);
            return address;
        }

        if (reference.object != undefined && !forceNewScope) {
            let obj = this.evaluate(context, reference.object);
            // Stores the object so it doesn't get evaluated twice (in setAddress)
            reference.object = obj;
            context.store.pushTemp(obj);

            // Square bracket properties - ["this stuff"]
            let propName = reference.identifier;
            if (propName instanceof Expression) {
                // Evaluate the expression in the square brackets
                let result = this.evaluate(context, reference.identifier);
                // Same as above
                reference.identifier = result;

                // If it isn't already a string or number, convert it to a string
                if (result.type != Types.String && result.type != Types.Number) {
                    let call = new FunctionCall(new Reference('toString', result));
                    result = this.evaluateFunctionCall(context, call);
                }

                // If it is a number
                // Check if it is an array and access the corresponding array index
                if (result.type == Types.Number) {
                    if (obj.type != Types.Array) {
                        Report.error(`Cannot access numeric property of non-Array object`, reference.identifier);
                    }
                    
                    // Array indexing
                    let index = result.get('value');
                    let arr = obj.get('value');
                    // Allows negative indexing
                    if (index < 0) index += arr.length;

                    if (index < 0 || index >= arr.length) {
                        Report.error(`Array index [${index}] out of range (Array length: ${arr.length})`, reference.identifier);
                    }

                    context.store.popTemp();
                    return arr[index];
                }

                // Otherwise it is a string and the property name can be retrieved easily
                propName = result.get('value');
            }

            // Look for the property on the object
            address = obj.getProperty(propName);
            if (address != undefined) {
                context.store.popTemp();
                return address;
            }

            if (!forAssignment) {
                // Go through the object class and look for a function with that name
                let classAddress = obj.typeAddress;
                do {
                    let classObj = context.getValue(classAddress);
                    
                    // Only check if it is a class
                    if (classObj.type == Types.Class) {
                        let classFuncs = classObj.get('functions');
                        address = classFuncs.get(propName);
        
                        // Recursively check super classes if the function isn't found
                        classAddress = classObj.get('super');
                    } else {
                        classAddress = undefined;
                    }

                } while (address == undefined && classAddress != undefined);
                if (address != undefined) {
                    context.store.popTemp();
                    return address;
                }
            }

            // Create a new property of the object
            address = context.store.alloc();
            obj.setProperty(propName, address);
            context.store.popTemp();
            return address;

        } else {
            // Look for the identifier in the current scope
            address = context.environment.get(reference.identifier, forceNewScope);
            if (address != undefined) return address;

            // Look for the property in the current 'this' object
            if (context.self != null && !forceNewScope) {
                address = context.self.getProperty(reference.identifier);
                if (address != undefined) return address;
            }

            // Create a new variable in the current scope
            address = context.store.alloc();
            context.environment.set(reference.identifier, address, forceNewScope);
            return address;
        }
    }

    // Similar to getAddress (definitely room for improvement, lots of duplicate code)
    // Finds a reference and changes the address it points to
    // RETURNS: Nothing
    static setAddress(context, reference, address, forceNewScope = false) {
        let temp;

        if (reference.object != undefined && !forceNewScope) {
            let obj = reference.object;
            context.store.pushTemp(obj);

            // Square bracket properties - ["this stuff"]
            let propName = reference.identifier;
            if (propName instanceof Obj) {
                // Evaluate the expression in the square brackets
                let result = propName;

                // If it isn't already a string or number, convert it to a string
                if (result.type != Types.String && result.type != Types.Number) {
                    let call = new FunctionCall(new Reference('toString', result));
                    result = this.evaluateFunctionCall(context, call);
                }

                // If it is a number
                // Check if it is an array and access the corresponding array index
                if (result.type == Types.Number) {
                    if (obj.type != Types.Array) {
                        Report.error(`Cannot set numeric property of non-Array object`, reference.identifier);
                    }
                    
                    // Array indexing
                    let index = result.get('value');
                    let arr = obj.get('value');
                    // Allows negative indexing
                    if (index < 0) index += arr.length;

                    if (index < 0 || index >= arr.length) {
                        Report.error(`Array index [${index}] out of range (Array length: ${arr.length})`, reference.identifier);
                    }

                    context.store.popTemp();
                    arr[index] = address;
                    return;
                }

                // Otherwise it is a string and the property name can be retrieved easily
                propName = result.get('value');
            }

            // Look for the property on the object
            temp = obj.getProperty(propName);
            if (temp != undefined) {
                obj.setProperty(propName, address);
                context.store.popTemp();
                return;
            }

            // Create a new property of the object
            obj.setProperty(propName, address);
            context.store.popTemp();
            return;

        } else {
            // Look for the identifier in the current scope
            temp = context.environment.get(reference.identifier, forceNewScope);
            if (temp != undefined) {
                context.environment.set(reference.identifier, address, forceNewScope);
                return;
            }

            // Look for the property in the current 'this' object
            if (context.self != null && !forceNewScope) {
                temp = context.self.getProperty(reference.identifier);
                if (temp != undefined) {
                    context.self.setProperty(reference.identifier, address)
                    return;
                }
            }

            // Create a new variable in the current scope
            context.environment.set(reference.identifier, address, forceNewScope);
            return address;
        }
    }

    // Creates an object of a specified type
    // Only used to create standard objects like Numbers and Strings
    // To create user-defined objects, evaluateClassCall is used
    // RETURNS: Obj
    static create(context, type) {
        let address = this.getAddress(context, new Reference(type));

        if (context.store.read(address) == undefined) {
            context.classes.set(type, address);
        }

        let obj = new Obj(address);

        context.store.references[address]++;

        obj.type = type;
        obj.internal = true;

        return obj;
    }

    // RETURNS: Obj
    static evaluate(context, expression) {
        // If the 'expression' is already an object, just return it
        if (expression instanceof Obj) {
            return expression;
        }

        // I always forget the context parameter of this function
        if (!(expression instanceof Expression)) {
            console.log(expression);
            throw new Error("You've probably forgotten a context somewhere.");
        }

        // Used to figure out where an error has occured
        // Keeps track of how far in the program it has already gotten
        if (expression.line != -1 && expression.column != -1) {
            Report.latestObj = expression;
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

        if (expression.isNativeExpression()) {
            return this.evaluateNativeExpression(context, expression);
        }

        if (expression.isNumberLiteral()) {
            return this.evaluateNumberLiteral(context, expression);
        }

        if (expression.isObjectLiteral()) {
            return this.evaluateObjectLiteral(context, expression);
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
        let obj = this.create(context, Types.Array);
        let arrayItems = [];

        // Store each item of the array and store the addresses in the array object
        for (let item of array.items) {
            let itemObj = this.evaluate(context, item);
            let address = context.store.alloc(itemObj);
            context.store.pushTemp();

            arrayItems.push(address);
        }

        obj.set('value', arrayItems);
        context.store.addPlaceholder(obj);

        for (let address of arrayItems) {
            context.store.popTemp();
        }

        return obj;
    }

    // RETURNS: Obj set in the assignment
    static evaluateAssignment(context, assignment) {
        // Calculate the value
        let value;
        if (assignment.operator == '=') {
            value = this.evaluate(context, assignment.value);
        } else {
            // Other operators like '+='
            // Checks the first character and calls the apprpriate function
            let call = new FunctionCall(new Reference(assignment.operator[0], assignment.reference), [assignment.value]);
            value = this.evaluateFunctionCall(context, call);
        }

        context.store.pushTemp(value);

        // Store the value
        let refObject = assignment.reference.object;
        let refIdentifier = assignment.reference.identifier;
        
        // Get the current address of the reference and store the object there
        let address = this.getAddress(context, assignment.reference, assignment.forceNewScope, true);
        let newAddress = context.store.write(address, value);

        // If the address has changed, store the new address
        if (address != newAddress) {
            this.setAddress(context, assignment.reference, newAddress, assignment.forceNewScope);
        }

        assignment.reference.object = refObject;
        assignment.reference.identifier = refIdentifier;

        context.store.popTemp();

        return value;
    }

    // RETURNS: Result of the binary expression
    static evaluateBinaryExpression(context, expression) {
        // The built-in data types have functions for each of the main operators (e.g. +, -, *)
        let call = new FunctionCall(new Reference(expression.operator, expression.left), [expression.right]);
        call.copyLocation(expression);
        return this.evaluateFunctionCall(context, call);
    }

    // RETURNS: Evaluation of the last expression in the block
    static evaluateBlock(context, block) {
        context.environment.enterScope();

        // Goes through all definitions first
        for (let definition of block.definitions) {
            this.define(context, definition);
        }

        let latest = this.create(context, Types.Undefined);

        // Returns the result of the last expression
        for (let expression of block.expressions) {
            latest = this.evaluate(context, expression);
        }
        
        // Stops the value from being deleted when the scope is exited
        context.store.addPlaceholder(latest);

        context.environment.exitScope();

        return latest;
    }

    // RETURNS: Boolean Obj
    static evaluateBooleanLiteral(context, boolean) {
        let obj = this.create(context, Types.Boolean);
        obj.set('value', boolean.value);
        return obj;
    }

    // RETURNS: Class Obj
    static evaluateClass(context, klass) {
        // Create the class object
        let classObj = this.create(context, Types.Class);
        if (klass.name != undefined && context.classes.has(klass.name)) {
            classObj.address = context.classes.get(klass.name);
            context.store.locations[classObj.address] = classObj;
        }
        context.store.pushTemp(classObj);

        // If the class has a name, store it as a reference
        if (klass.name != undefined) {
            let assign = new Assignment(new Reference(klass.name), '=', classObj, true);
            this.evaluateAssignment(context, assign);
        }

        classObj.set('class', klass);
        
        // Set its super class if it has one
        if (klass.superClass != undefined) {
            let superObj = this.evaluate(context, klass.superClass);

            // Ensures the super class is actually a class
            if (superObj.type != Types.Class) {
                Report.error(`Super class must be a class`, klass.superClass);
            }

            if (superObj.address == undefined) {
                console.log(`Super class has no address - evaluator.js`)
            }
            classObj.set('super', context.store.alloc(superObj));
        }

        // The scope in which this class was defined
        classObj.set('scope', context.environment.getScopeAddress());
        // classObj.set('scope', context.environment.getScopeIndex());

        // Assign all static properties of the class
        let statics = klass.getStatics(context, classObj);
        for (let [name, expression] of statics) {
            if (expression.isFunction()) {
                expression.isClassMethod = true;
            }

            let assign = new Assignment(new Reference(name, classObj), '=', expression);
            let obj = this.evaluateAssignment(context, assign);

            // Static functions operate on the Class object that they are a part of
            // if (obj.type == Types.Function) {
            //     obj.set('this', context.store.alloc(classObj));
            // }
        }

        // Store all functions of this class
        let functionAddresses = new Map();
        for (let [name, func] of klass.functions) {
            func.isClassMethod = true;
            let funcObj = this.evaluate(context, func);
            let address = context.store.alloc(funcObj);

            functionAddresses.set(name, address);
        }

        // Store the addresses of the functions in the class object
        classObj.set('functions', functionAddresses);

        context.store.addPlaceholder(classObj);
        context.store.popTemp();

        return classObj;
    }

    // Creates objects when the 'new' keyword is used
    // Similar to evaluateFunctionCallImpl in many ways
    // RETURNS: Obj
    static evaluateClassCall(context, call) {
        // Get the class' address and the actual Class object
        let classObj = this.evaluate(context, call.reference);
        context.store.pushTemp(classObj);

        if (classObj.type != Types.Class) {
            console.log(call.reference);
            Report.error(`Constructor call must refer to class`, call);
        }

        // Evaluate all of the arguments passed into the constructor
        let argObjects = [];

        for (let i = 0; i < call.args.length; i++) {
            let obj = this.evaluate(context, call.args[i]);
            argObjects.push(obj);
            
            // Push all the arguments to the temporary address stack so they aren't lost
            context.store.pushTemp(obj);
        }

        // Enter a scope to prevent variable name clashes
        context.environment.enterScope(classObj.get('scope'));

        let klass = classObj.get('class');
        
        // Create the arguments array
        let array = new ArrayLiteral(argObjects);
        let assign = new Assignment(new Reference('arguments'), '=', array, true);
        this.evaluateAssignment(context, assign);

        // Add each argument to the scope by setting it to the name of the corresponding parameter
        for (let i = 0; i < klass.params.length; i++) {
            let thisArgument;
            if (i >= argObjects.length) {
                // If a parameter hasn't been passed into the constructor, it is set as Undefined
                thisArgument = this.create(context, Types.Undefined);
                argObjects.push(thisArgument);
            } else {
                thisArgument = argObjects[i];
            }

            let assign = new Assignment(new Reference(klass.params[i]), '=', thisArgument, true);
            this.evaluateAssignment(context, assign);
        }

        // Pop all of the arguments that were pushed above
        for (let arg of call.args) {
            context.store.popTemp();
        }

        let obj;

        // If the class inherits from something, recursively call the super constructor
        if (klass.superClass != undefined) {
            // Get the super class object
            let superClassAddress = classObj.get('super');
            let superClassObj = context.getValue(superClassAddress);

            // Call the super class constructor
            let superCall = new FunctionCall(superClassObj, klass.superArgs);
            superCall.copyLocation(call);
            superCall.constructor = true;

            // Get the super object and set its typeAddress to this class
            obj = this.evaluate(context, superCall);

            // Free the previous typeAddress before replacing it
            context.store.free(obj.typeAddress);
            obj.typeAddress = context.store.alloc(classObj);
        } else {
            // Otherwise just create a new object of this class
            obj = new Obj(context.store.alloc(classObj));
        }

        // Pop classObj
        context.store.popTemp();

        if (klass.name != undefined) {
            obj.type = klass.name;
        }

        context.store.pushTemp(obj);

        // 'this' will point to the object
        let self = context.self;
        context.store.pushTemp(self);
        context.self = obj;

        // Add all of the arguments which were passed into the constructor
        for (let i = 0; i < klass.params.length; i++) {
            // if (i < argObjects.length) {
                let assign = new Assignment(new Reference(klass.params[i], new This()), '=', argObjects[i]);
                this.evaluateAssignment(context, assign);
            // }
        }

        // Run the 'init' expression of the class
        if (klass.init != undefined) {
            this.evaluate(context, klass.init);
        }

        // Stops the object from being deleted when the scope is exited
        // Not completely sure if this is needed
        // But it is used in evaluateFunctionCallImpl so I just used it here too
        context.store.addPlaceholder(obj);
        context.store.popTemp();
        
        // Reset the 'self' of the context to what it was before
        context.self = self;
        context.store.popTemp();
        context.environment.exitScope();

        return obj;
    }

    // RETURNS: Function Obj
    static evaluateFunction(context, func) {
        let obj = this.create(context, Types.Function);
        obj.set('function', func);
        obj.set('name', func.name != undefined ? func.name : '[Anonymous]');
        
        // The scope in which this function was defined
        obj.set('scope', context.environment.getScopeAddress());
        // obj.set('scope', context.environment.getScopeIndex());
        // console.log(`Function defined at scopeIndex: ${context.environment.getScopeIndex()}`);

        if (!(context.self instanceof Obj)) {
            Report.error(`Serious problem here, evaluateFunction evaluator.js`)
        }

        if (!func.isClassMethod) {
            // What the 'this' object will be when this function is called
            obj.set('this', context.store.alloc(context.self));

            // If the class has a name, store it as a reference
            if (func.name != undefined) {
                let assign = new Assignment(new Reference(func.name), '=', obj, true);
                this.evaluateAssignment(context, assign);
            }
        }
        context.store.addPlaceholder(obj);
        
        return obj;
    }

    // Searches for the appropriate function to call
    // RETURNS: Result of the function call
    static evaluateFunctionCall(context, call) {
        if (call.constructor) {
            return this.evaluateClassCall(context, call);
        }

        // By default, functions are acting on the current 'this' object
        // let object = context.self;
        let object;
        let tempPushed = false;
        let tempObject = call.reference.object;

        // If there is an actual object that the function is acting on, set it as that
        if (call.reference.object != undefined) {
            object = this.evaluate(context, call.reference.object);

            // Prevents the object from being evaluated twice
            call.reference.object = object;

            context.store.pushTemp(object);

            // Makes sure the pushTemp above is followed by a popTemp in evaluateFunctionCallImpl
            // tempPushed = true;
        }

        let func = this.evaluate(context, call.reference);

        // Stop the function from being freed
        // context.store.pushTemp(func);

        // Set the object back to the original expression
        call.reference.object = tempObject;

        // Must be a function obviously
        if (func.type != Types.Function) {
            Report.error(`Invalid function call - this error message should be more helpful in future versions`, call);
        }

        // If there is no calling object, set the object to what it was when the function was defined
        if (object == undefined) {
            let address = func.get('this');
            if (address == undefined) {
                object = this.create(context, Types.Undefined);

                // context.store.pushTemp(object);

                // Makes sure the pushTemp above is followed by a popTemp in evaluateFunctionCallImpl
                // tempPushed = true;

                // Report.error(`Function requires calling object`, call);
            } else {
                object = context.getValue(address);
            }

            // Is this really needed? I'm not sure but I'm scared to remove it
            context.store.pushTemp(object);
            // tempPushed = true;
        }

        return this.evaluateFunctionCallImpl(context, object, func, call);
    }

    // The above function deals with choosing the correct function to use
    // This one actually calls the function and evaluates the arguments
    // RETURNS: Result of the function call
    static evaluateFunctionCallImpl(context, object, func, call) {
        // Evaluate all of the arguments passed into the function
        let argObjects = [];

        for (let i = 0; i < call.args.length; i++) {
            let obj = this.evaluate(context, call.args[i]);
            argObjects.push(obj);

            // Same as in evaluateClassCall
            context.store.pushTemp(obj);
        }

        // Enter a scope to prevent variable name clashes
        context.environment.enterScope(func.get('scope'));
        
        func = func.get('function');

        // Create the arguments array
        let array = new ArrayLiteral(argObjects);
        let assign = new Assignment(new Reference('arguments'), '=', array, true);
        this.evaluateAssignment(context, assign);

        // Add each argument to the scope by setting it to the name of the corresponding parameter
        for (let i = 0; i < func.params.length; i++) {
            let thisArgument;
            if (i >= argObjects.length) {
                // If a parameter hasn't been passed into a function, it is set as Undefined
                thisArgument = this.create(context, Types.Undefined);
            } else {
                thisArgument = argObjects[i];
            }

            let assign = new Assignment(new Reference(func.params[i]), '=', thisArgument, true);
            this.evaluateAssignment(context, assign);
        }

        // Pop all of the arguments
        for (let arg of call.args) {
            context.store.popTemp();
        }

        // Set the 'self' of the context to the object that called the function
        let self = context.self;
        context.store.pushTemp(self);
        context.self = object;

        // Evaluate the function
        let value = this.evaluate(context, func.body);
        // By default, functions return Undefined
        if (value == undefined) {
            value = this.create(context, Types.Undefined);
        }

        // Stops the value from being deleted when the scope is exited
        context.store.addPlaceholder(value);

        // Reset the 'self' of the context to what it was before
        context.self = self;
        context.store.popTemp();
        context.environment.exitScope();

        // Explained in evaluateFunctionCall above
        // if (tempPushed) {
        // Pop the calling object
        context.store.popTemp();
        // }

        return value;
    }

    // RETURNS: Obj
    static evaluateIfElse(context, ifElse) {
        // Determine whether the condition evaluates to true
        let call = new FunctionCall(new Reference('toBoolean', ifElse.condition));
        let bool = this.evaluateFunctionCall(context, call);
        
        let result;
        if (bool.get('value')) {
            // If the condition is true
            result = this.evaluate(context, ifElse.thenBlock);
        } else {
            if (ifElse.elseBlock != undefined) {
                // Only evaluate the else block if there is one
                result = this.evaluate(context, ifElse.elseBlock);
            } else {
                // Return undefined by default
                result = this.create(context, Types.Undefined);
            }
        }

        return result;
    }

    // A native expression is an expression written in JavaScript rather than Cool
    // Used for built-in data types and functions
    // RETURNS: Result of the native expression
    static evaluateNativeExpression(context, expression) {
        return expression.func(context);
    }

    // RETURNS: Number Obj
    static evaluateNumberLiteral(context, number) {
        let obj = this.create(context, Types.Number);
        obj.set('value', number.value);
        return obj;
    }

    // Returns: Obj
    static evaluateObjectLiteral(context, objExpr) {
        let obj = this.create(context, Types.Object);
        context.store.pushTemp(obj);

        // Assign each defined property to the object
        for (let [propName, expression] of objExpr.properties) {
            let assign = new Assignment(new Reference(propName, obj), '=', expression);
            this.evaluateAssignment(context, assign);
        }

        context.store.addPlaceholder(obj);
        context.store.popTemp();

        return obj;
    }

    // RETURNS: Obj that the reference points to
    static evaluateReference(context, reference) {
        let refObject = reference.object;
        let refIdentifier = reference.identifier;

        let address = this.getAddress(context, reference);

        reference.object = refObject;
        reference.identifier = refIdentifier;

        return context.getValue(address);
    }

    // RETURNS: String Obj
    static evaluateStringLiteral(context, string) {
        let obj = this.create(context, Types.String);
        obj.set('value', string.value);
        return obj;
    }

    // RETURNS: Obj
    static evaluateThis(context, thisExp) {
        return context.self;
    }

    // RETURNS: Result of the unary expression
    static evaluateUnaryExpression(context, expression) {
        // The built-in data types have functions for each of the main unary operators (e.g. +, -, !)
        let call = new FunctionCall(new Reference('unary_' + expression.operator, expression.expression));
        call.copyLocation(expression);
        return this.evaluateFunctionCall(context, call);
    }

    // RETURNS: Undefined Obj
    static evaluateUndefinedLiteral(context, undef) {
        let obj = this.create(context, Types.Undefined);
        return obj;
    }

    // RETURNS: Array Obj
    static evaluateWhile(context, whileExpr) {
        // Initial condition evaluation
        let call = new FunctionCall(new Reference('toBoolean', whileExpr.condition));
        let bool = this.evaluateFunctionCall(context, call);
        
        // Returns an array of the evaluations of each loop
        let array = [];

        while (bool.get('value')) {
            let obj = this.evaluate(context, whileExpr.body);
            array.push(obj);
            context.store.pushTemp(obj);

            // Redo the condition after every loop
            call = new FunctionCall(new Reference('toBoolean', whileExpr.condition));
            bool = this.evaluateFunctionCall(context, call);
        }

        // Create the array and store it in a placeholder
        let result = this.evaluateArrayLiteral(context, new ArrayLiteral(array));

        // Pop the contents of the array
        for (let add of array) {
            context.store.popTemp();
        }
        
        context.store.addPlaceholder(result);
        
        return result;
    }

    // Definitions simply set values in the context and don't return anything
    // RETURNS: Nothing
    static define(context, definition) {
        if (definition.isClass()) {
            this.defineClass(context, definition);

        } else if (definition.isExtract()) {
            this.defineExtract(context, definition);

        } else if (definition.isFunction()) {
            this.defineFunction(context, definition);
        }
    }

    static defineClass(context, klass) {
        // Get the actual class expression from the definition
        klass = klass.classExpr;

        this.evaluate(context, klass);
    }

    static defineExtract(context, extract) {
        let klass = this.evaluate(context, extract.klass);

        if (klass.type != Types.Class) {
            Report.error(`Extract must refer to a class in the current context`, extract);
        }

        // Go through all properties of the class and add them to the current scope
        let keyValuePairs = klass.getKeysOrValues();
        for (let pair of keyValuePairs) {
            let value = context.getValue(pair[1]);

            // Assign each value to its key name
            let assign = new Assignment(new Reference(pair[0]), '=', value, true);
            this.evaluateAssignment(context, assign);
        }
    }

    static defineFunction(context, func) {
        // Get the actual function expression from the definition
        func = func.funcExpr;

        this.evaluate(context, func);

        /*let obj = this.create(context, Types.Function);
        obj.set('function', func);
        obj.set('name', func.name);
        
        // The scope in which this function was defined
        obj.set('scope', context.environment.getScopeIndex());

        if (!func.isClassMethod) {
            // What the 'this' object will be when this function is called
            obj.set('this', context.store.alloc(context.self));
        }
        
        // Assign the function to its name
        let assign = new Assignment(new Reference(func.name), '=', obj, true);
        this.evaluateAssignment(context, assign);*/
    }
}