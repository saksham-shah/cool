const Environment = require('./environment');
const Store = require('./store')

const Obj = require('./object');
const Types = require('../types/types');
const Evaluator = require('./evaluator');

module.exports = class {
    constructor(store = new Store()) {
        // Stores all identifiers and their memory addresses
        this.environment = new Environment(this);

        // Stores the actual data
        this.store = store;

        // All the named classes available in this context
        this.classes = new Map();

        // The object that 'this' refers to
        this.self = null;
    }

    // Takes an address and returns the value stored there
    // RETURNS: Obj
    getValue(address) {
        let value = this.store.read(address);

        if (this.store.references[address] <= 0) throw new Error();
        // If the value is undefined, return an Undefined object
        if (value == undefined) {
            value = Evaluator.create(this, Types.Undefined);
            value.address = address;
            this.store.locations[address] = value;
            // this.store.write(address, value);
        }

        return value;
    }

    // Sets the default self object
    // This method will likely be removed soon as it is not really needed
    defaultSelf() {
        this.self = Evaluator.create(this, Types.Object);
        this.store.alloc(this.self);
    }
}