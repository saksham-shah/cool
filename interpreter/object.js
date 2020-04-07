const Types = require('../types/types');

module.exports = class Obj {
    constructor(type, context) {
        this.type = type;
        this.context = context;
        this.properties = new Map();
        this.functions = new Map();
    }

    getProperty(propName) {
        if (this.properties.has(propName)) {
            return this.properties.get(propName);
        }

        return Obj.create(this.context, Types.Undefined);
    }

    setProperty(propName, value) {
        this.properties.set(propName, value);
    }

    static create(context, className) {
        let klass = context.getClass(className);

        if (klass == undefined) {
            klass = context.environment.getValue(className);

            if (klass.type != Types.Class) {
                throw new Error(Report.error(`${call.name} is not a class`, call.line, call.column, call.file));
            }

            klass = klass.getProperty('class');
        }

        let object;
        // console.log(className);
        if (klass.superClass !== undefined) {
            object = Obj.create(context, klass.superClass);
            object.type = className;
        } else {
            object = new Obj(className, context);
        }

        klass.functions.forEach(func => {
            //object.functions.set(func.name, func);
            let funcObj = Obj.create(context, Types.Function);
            funcObj.setProperty('function', func);
            object.setProperty(func.name, funcObj);
        });

        return object;
    }

    // hasFunction(functionName) {
    //     return this.functions.has(functionName);
    // }
    
    getFunction(functionName) {
        // if (this.functions.has(functionName)) {
            return this.functions.get(functionName);
        // }

        // return Obj.create(this.context, Types.Undefined);
    }
}