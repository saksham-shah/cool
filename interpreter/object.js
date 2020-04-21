const Types = require('../types/types');

module.exports = class Obj {
    constructor(typeAddress, address = undefined) {
        // The memory address of this object's class
        this.typeAddress = typeAddress;
        // The actual name of the class
        this.type = undefined;
        
        // The memory address where this object is stored
        this.address = address;

        // The properties and methods of this object
        this.properties = new Map();

        // The developer-only properties of this object
        this.devProperties = new Map();
    }

    // RETURNS: Memory address of the property
    getProperty(propertyName) {
        return this.properties.get(propertyName);
    }

    // RETURNS: Nothing
    setProperty(propertyName, address) {
        this.properties.set(propertyName, address);
    }

    // RETURNS: Value stored at that property
    get(propertyName) {
        return this.devProperties.get(propertyName);
    }

    // RETURNS: Nothing
    set(propertyName, value) {
        this.devProperties.set(propertyName, value);
    }

    // Checks if this object is a literal
    // RETURNS: Boolean
    isLiteral() {
        if (this.type == undefined) return false;

        return this.type == Types.Number || this.type == Types.Boolean || this.type == Types.String || this.type == Types.Undefined;
    }

    // RETURNS: The function address if it is found, otherwise undefined
    findFunction(functionName) {

    }
}