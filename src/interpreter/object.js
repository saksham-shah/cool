const Types = require('../types/types');

module.exports = class Obj {
    constructor(typeAddress, address = undefined) {
        // The memory address of this object's class
        this.typeAddress = typeAddress;
        // The actual name of the class
        this.type = undefined;

        // Whether they were created in JS code (rather than Cool code)
        this.internal = false;
        
        // The memory address(es) where this object is stored
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

    // RETURNS: Nothing
    deleteProperty(propertyName) {
        this.properties.delete(propertyName);
    }

    // RETURNS: Value stored at that property
    get(propertyName) {
        return this.devProperties.get(propertyName);
    }

    // RETURNS: Nothing
    set(propertyName, value) {
        this.devProperties.set(propertyName, value);
    }

    // Gets all the addresses stored in this object
    // e.g. all its properties (and items if it is an array)
    // RETURNS: Array of addresses
    getReferences() {
        let addresses = [];
        // Adds the address of the object's class
        // if (!this.internal) {
        addresses.push(this.typeAddress);
        // }

        // Adds all object properties
        for (let address of this.properties.values()) {
            addresses.push(address);
        }

        // Adds all array items (if it is an array)
        if (this.type == Types.Array) {
            let arr = this.get('value');
            for (let address of arr) {
                addresses.push(address);
            }
        }

        // Adds references related to classes
        if (this.type == Types.Class) {
            // All methods/functions of this class
            let funcs = this.get('functions').values();
            for (let address of funcs) {
                addresses.push(address);;
            }

            // The super class
            let superAddress = this.get('super');
            if (superAddress != undefined) {
               addresses.push(superAddress);
            }
        }

        // Adds references related to functions
        if (this.type == Types.Function) {
            // The 'this' object of the function
            let thisAddress = this.get('this');
            if (thisAddress != undefined) {
                addresses.push(thisAddress);
            }
        }

        return addresses;
    }

    // Equivalent of JS functions Map.keys(), Map.values() and Map.entries() for Cool objects
    // RETURNS: Array of either the keys, values or both (depending on the mode parameter)
    getKeysOrValues(mode) {
        let returnVal = []
        for (let [propName, value] of this.properties) {
            if (mode == 'key') {
                returnVal.push(propName);
                
            } else if (mode == 'value') {
                returnVal.push(value);

            } else {
                returnVal.push([propName, value]);
            }
        }
        return returnVal;
    }

    // Checks if this object is a literal - UNUSED
    // RETURNS: Boolean
    isLiteral() {
        if (this.type == undefined) return false;

        return this.type == Types.Number || this.type == Types.Boolean || this.type == Types.String || this.type == Types.Undefined;
    }
}