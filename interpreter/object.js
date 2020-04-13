const Types = require('../types/types');
const Report = require('../utils/report');

// An Obj is an Object in Cool
module.exports = class Obj {
    constructor(type, context) {
        this.type = type; // The class of the object
        this.context = context; // The context that the object was created in
        this.properties = new Map(); // The properties of the object
        //this.functions = new Map(); // UNUSED
    }

    // Get a property of the object
    // RETURNS: Obj (Undefined Obj if the property isn't found)
    getProperty(propName) {
        // If the object directly has that property, return it
        if (this.properties.has(propName)) {
            return this.properties.get(propName);
        }

        // Search for the property in the class hierarchy of the object
        return this.getFunction(propName);
    }

    // Set a property of the object
    // RETURNS: Nothing
    setProperty(propName, value) {
        this.properties.set(propName, value);
    }

    // Get a property at an index of the Array-like object
    // RETURNS: Obj
    getArrayProperty(index, errorExpr) {
        switch (this.type) {
            case Types.String:
                let str = this.getProperty('.value');
                // Allow reverse string indexes
                if (index < 0) index += str.length;

                // Check if the index is within the bounds of the string
                if (index >= str.length || index < 0) {
                    throw new Error(Report.error(`Index [${index}] out of bounds`, errorExpr.line, errorExpr.column, errorExpr.file));
                }

                // Create a new String Obj to return
                let charObj = Obj.create(this.context, Types.String);
                charObj.setProperty('.value', str[index]);

                return charObj;

            case Types.Array:
                let arr = this.getProperty('.value');
                // Allow reverse array indexes
                if (index < 0) index += arr.length;

                // Check if the index is within the bounds of the array
                if (index >= arr.length || index < 0) {
                    throw new Error(Report.error(`Index [${index}] out of bounds`, errorExpr.line, errorExpr.column, errorExpr.file));
                }

                // No need to create an Obj as all items of the Array will already be Objs
                return arr[index];
            
            default:
                console.log("This code should never be executed. Line 46 object.js");
        }
    }

    // Set a property at an index of the Array-like object
    // RETURNS: Nothing
    setArrayProperty(index, value, errorExpr) {
        switch (this.type) {
            case Types.String:
                let str = this.getProperty('.value');
                if (index < 0) index += str.length;

                if (index >= str.length || index < 0) {
                    throw new Error(Report.error(`Index [${index}] out of bounds`, errorExpr.line, errorExpr.column, errorExpr.file));
                }

                let char;
                // Convert various Objs into a JS string
                if (value.type == Types.String) {
                    char = value.getProperty('.value');
                    
                } else if (value.type == Types.Number) {
                    char = value.getProperty('.value').toString();

                } else {
                    // Not a very helpful error message
                    throw new Error(Report.error(`String must consist of characters`, errorExpr.line, errorExpr.column, errorExpr.file));
                }

                // The strings MUST be one character in length
                if (char.length != 1) {
                    throw new Error(Report.error(`String must consist of characters`, errorExpr.line, errorExpr.column, errorExpr.file));
                }

                // JS doesn't have a native way to replace a char of a string
                // Splits the string in two and joins it back together
                str = str.substring(0, index) + char + str.substring(index + 1);
                this.setProperty('.value', str);

                break;

            case Types.Array:
                let arr = this.getProperty('.value');
                if (index < 0) index += arr.length;

                if (index >= arr.length || index < 0) {
                    throw new Error(Report.error(`Index [${index}] out of bounds`, errorExpr.line, errorExpr.column, errorExpr.file));
                }

                // Much simpler than the String one because Array items can be any Obj
                arr[index] = value;

                break;
            
            default:
                console.log("This code should never be executed. Line 89 object.js");
        }
    }

    // Equivalent of JS functions Map.keys(), Map.values() and Map.entries() for Cool objects
    // RETURNS: Array of either the keys, values or both (depending on the mode parameter)
    getKeysOrValues(mode) {
        let returnVal = []
        for (let [propName, value] of this.properties) {
            // Properties starting with '.' are internal and therefore excluded
            if (propName[0] != '.') {
                if (mode == 'key') {
                    returnVal.push(propName);
                } else if (mode == 'value') {
                    returnVal.push(value);
                } else {
                    returnVal.push([propName, value]);
                }
            }
        }
        return returnVal;
    }

    // This function has changed a lot and now it's just not necessary
    // But it's too late to turn back now
    // RETURNS: Obj
    static create(context, className) {
        // let klass = context.getClass(className);

        return new Obj(className, context);

        // CLEANUP REQUIRED AAAAAAAAAAAAA

        // if (klass == undefined) {
            klass = context.environment.getValue(className);

            if (klass.type != Types.Class) {
                throw new Error(Report.error(`${call.name} is not a class`, call.line, call.column, call.file));
            }

            klass = klass.getProperty('.class');
        // }

        let object;
        // console.log(className);
        if (klass.superClass !== undefined) {
            object = Obj.create(context, klass.superClass);
            object.type = className;
        } else {
            object = new Obj(className, context);
        }

        // klass.functions.forEach(func => {
        //     //object.functions.set(func.name, func);
        //     let funcObj = Obj.create(context, Types.Function);
        //     funcObj.setProperty('.function', func);
        //     object.setProperty(func.name, funcObj);
        // });

        return object;
    }
    
    // Searches for a function in the class of the object
    // Similar to the 'prototype' system in JS but a lot less advanced
    // RETURNS: Obj (Undefined Obj if the function isn't found)
    getFunction(functionName) {
        let klass = this.context.environment.getValue(this.type);
        klass = klass.getProperty('.class');

        let func = klass.getMethod(this.context, functionName);

        // If a function isn't found, return Undefined
        // Similar to the getValue method in Environment.js
        if (func == undefined) {
            return Obj.create(this.context, Types.Undefined);
        }

        // Wrap the Function Expression into a Cool Function Obj
        let funcObj = Obj.create(this.context, Types.Function);
        funcObj.setProperty('.name', func.name != undefined ? func.name : '[Anonymous]');
        funcObj.setProperty('.function', func);

        return funcObj;
    }
}