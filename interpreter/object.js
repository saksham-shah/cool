const Types = require('../types/types');

module.exports = class Obj {
    constructor(typeAddress, address = undefined) {
        // The memory address of this object's class
        this.typeAddress = typeAddress;
        // The actual name of the class
        this.type = undefined;
        
        // The memory address(es) where this object is stored
        this.address = address;
        this.otherAddresses = [];

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

    // Adds an address where this object is stored
    // RETURNS: Nothing
    addAddress(address) {
        if (this.address == undefined) {
            this.address = address;
        } else {
            // If a primary address has already been set, add this new address to an array
            this.otherAddresses.push(address);
        }
    }

    // Removes an address where this object is no longer stored
    // RETURNS: The new primary address
    removeAddress(address) {
        if (this.address == address) {
            // A new primary address is chosen from the array
            if (this.otherAddresses.length > 0) {
                this.address = this.otherAddresses.splice(0, 1)[0];
            } else {
                // This means the object is not stored anywhere and should be deleted entirely
                this.address = undefined;
            }
        } else {
            // Look for (and remove) the address in the array
            for (let i = this.otherAddresses.length - 1; i >= 0; i--) {
                if (this.otherAddresses[i] == address) {
                    this.otherAddresses.splice(i, 1);
                    return this.address;
                }
            }
        }

        return this.address;
    }

    // Checks whether this object is stored at a particular address
    // RETURNS: Boolean
    hasAddress(address) {
        if (this.address == address) return true;

        // Look for the address in the array
        for (let i = 0; i < this.otherAddresses.length; i++) {
            if (this.otherAddresses[i] == address) {
                return true;
            }
        }

        return false;
    }

    // Gets all the addresses stored in this object
    // e.g. all its properties (and items if it is an array)
    // RETURNS: Array of addresses
    getReferences() {
        let addresses = [];
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

    // Checks if this object is a literal - UNUSED
    // RETURNS: Boolean
    isLiteral() {
        if (this.type == undefined) return false;

        return this.type == Types.Number || this.type == Types.Boolean || this.type == Types.String || this.type == Types.Undefined;
    }

    // RETURNS: The function address if it is found, otherwise undefined
    findFunction(functionName) {

    }
}