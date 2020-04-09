const Types = require('../types/types');

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
    setProperty(propName, value) {
        this.properties.set(propName, value);
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