const Environment = require('./environment');
const Store = require('./store')

const Obj = require('./object');
const Types = require('../types/types');

module.exports = class {
    constructor() {
        // Stores all identifiers and their memory addresses
        this.environment = new Environment(this);

        // Stores the actual data
        this.store = new Store();

        // All the classes available in this context - UNUSED
        this.classes = new Map();

        // The object that 'this' refers to
        this.self = null;
    }

    // Sets the default self object
    // This method will likely be removed soon as it is not really needed
    defaultSelf() {
        this.self = Obj.create(this, Types.Object);
    }
}