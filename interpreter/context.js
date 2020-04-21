const Environment = require('./environment');
const Store = require('./store')

const Obj = require('./object');
const Types = require('../types/types');
const Evaluator = require('./evaluator');

module.exports = class {
    constructor() {
        // Stores all identifiers and their memory addresses
        this.environment = new Environment(this);

        // Stores the actual data
        this.store = new Store();

        // All the named classes available in this context
        this.classes = new Map();

        // The object that 'this' refers to
        this.self = null;
    }

    // Takes an address and returns the value stored there
    // RETURNS: Obj
    getValue(address) {
        let value = this.store.read(address);

        // If the value is undefined, store an Undefined object there
        if (value == undefined) {
            value = Evaluator.create(this, Types.Undefined);
            this.store.write(address, value);
        }

        return value;
    }

    // Sets the default self object
    // This method will likely be removed soon as it is not really needed
    defaultSelf() {
        this.self = Evaluator.create(this, Types.Object);
    }

    /*
    // Used to get native classes like Number, String etc
    // RETURNS: Memory address of that class
    getClass(name) {
        return this.classes.get(name);
    }

    // Used to set the same classes as mentioned above
    // RETURNS: Nothing
    setClass(name, address) {
        this.classes.set(name, address);
    }

*/





/*
    getClassReference(address) {
        let klass = this.classes.get(address);

        if (klass == undefined) {
            throw new Error(`Undefined class at address ${address} - context.js`);
        }

        return klass;
    }

    setClassReference(address, reference) {
        this.classes.set(address, reference);
    }
*/
}