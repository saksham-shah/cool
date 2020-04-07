const Environment = require('./environment');

const Obj = require('./object');
const Types = require('../types/types');

module.exports = class {
    constructor() {
        // Stores all identifiers and values
        this.environment = new Environment(this);

        // All the classes available in this context
        this.classes = new Map();

        // The object that 'this' refers to
        this.self = null;
    }

    addClass(klass) {
        this.classes.set(klass.name, klass);
    }

    getClass(className) {
        return this.classes.get(className);
    }

    addFunction(func) {
        let value = Obj.create(this, Types.Function);
        value.setProperty('.function', func);
        this.environment.setValue(func.name, value);
    }

    defaultSelf() {
        this.self = Obj.create(this, Types.Object);
    }
}