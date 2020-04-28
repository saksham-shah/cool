module.exports = class {
    constructor(context) {
        this.context = context;

        // Stores all of the values in use
        this.locations = [];

        // Stores free addresses (of values which are no longer in use)
        this.freeAddresses = [];

        // One buffer memory location to temporarily store an object that may be assigned
        this.placeholder = undefined;

        // Stack of temporary addresses
        // Similar to the placeholder but also separately required
        this.tempAddresses = [];
    }

    // Takes a value, allocates a memory location for it and stores it
    // RETURNS: the address where it is stored
    alloc(value) {
        let address;
        // If there are free spaces in the array, fill them first
        if (this.freeAddresses.length > 0) {
            address = this.freeAddresses.pop();

            this.locations[address] = value;
        } else {
            address = this.locations.length;

            // If there are no free spaces, create a new space in the array
            this.locations.push(value);
        }

        // Add this address to the object
        if (value != undefined) {
            if (value.hasAddress(address)) {
                console.log(`alloc: VALUE ALREADY HAS ADDRESS ${address}`);
                console.log(value);
                throw new Error(`store.js:alloc`);
            }
            value.addAddress(address);
        }

        return address;
    }

    // Reads the value at an address
    // RETURNS: The value
    read(address) {
        if (address >= 0 && address < this.locations.length) {
            return this.locations[address];
        }
    }

    // Stores a value at an address
    // ASSUMES that it is rewriting over the value that it was previously using
    // RETURNS: The address where it was stored (not always the address specified)
    write(address, value) {
        if (address >= 0 && address < this.locations.length) {
            // Adds this address to the object
            this.pushTemp(value);

            // Frees up this address before overwriting it
            this.free(address, false);
            this.locations[address] = value;

            if (value.hasAddress(address)) {
                console.log(`write: VALUE ALREADY HAS ADDRESS ${address}`);
                console.log(value);
                throw new Error(`store.js:write`);
            }
            value.addAddress(address);

            this.popTemp();
        }

        return -1;
    }

    // Frees an address when it is no longer in use
    // RETURNS: Nothing
    free(address, markAsFree = true) {
        if (address >= 0 && address < this.locations.length) {

            let value = this.locations[address];
            if (value != undefined) {
                // Removes this address from the object
                let newAddress = value.removeAddress(address);

                this.locations[address] = undefined;

                // This means the object is not stored anywhere
                // So all its references can also be freed
                if (newAddress == undefined) {
                    let addresses = value.getReferences();
                    for (let add of addresses) {
                        this.free(add);
                    }
                }
            }

            // Mark this address as free
            if (markAsFree) {
                this.freeAddresses.push(address);
            }
        }
    }

    // Stores this object as a placeholder while it is waiting to be assigned
    // RETURNS: Nothing
    addPlaceholder(obj) {
        // Get the address of the new placholder
        let address = this.alloc(obj);

        // Free the previous placeholder
        if (this.placeholder != undefined) {
            this.free(this.placeholder);
        }

        // Store the placeholder address
        this.placeholder = address;
    }

    // Stores an object temporarily and pushed its address to a stack
    // RETURNS: The temporary address where the object is stored
    pushTemp(obj) {
        let address = this.alloc(obj);
        this.tempAddresses.push(address);
        return address;
    }

    // Pops the last address from the stack of temporary addresses
    // RETURNS: Nothing
    popTemp() {
        let address = this.tempAddresses.pop();
        this.free(address);

    }

}

/*
module.exports = class {
    constructor(context) {
        this.context = context;

        // Stores all of the values in use
        this.locations = [];

        // Stores free addresses (of values which are no longer in use)
        this.freeAddresses = [];

        // Stores placeholder addresses for values waiting to be assigned
        this.placeholders = [];
        this.placeholderScopes = [];
    }

    // Takes a value, allocates a memory location for it and stores it
    // RETURNS: the address where it is stored
    alloc(value) {
        let address;
        // If there are free spaces in the array, fill them first
        if (this.freeAddresses.length > 0) {
            address = this.freeAddresses.pop();

            this.locations[address] = value;
        } else {
            address = this.locations.length;

            // If there are no free spaces, create a new space in the array
            this.locations.push(value);
            // this.references.push(1);
        }

        // Add this address to the object
        if (value != undefined) {
            value.addAddress(address);
            this.checkPlaceholders(value);
        }

        return address;
    }

    // Reads the value at an address
    // RETURNS: The value
    read(address) {
        if (address >= 0 && address < this.locations.length) {
            return this.locations[address];
        }
    }

    // Stores a value at an address
    // ASSUMES that it is rewriting over value that it was previously using
    // RETURNS: The address where it was stored (not always the address specified)
    write(address, value) {
        if (address >= 0 && address < this.locations.length) {
            // Adds this address to the object
            value.addAddress(address);
            this.checkPlaceholders(value);

            // Frees up this address before overwriting it
            this.free(address, false);
            this.locations[address] = value;
        }

        return -1;
    }

    // Frees an address when it is no longer in use
    // RETURNS: Nothing
    free(address, markAsFree = true) {
        if (address >= 0 && address < this.locations.length) {

            let value = this.locations[address];
            if (value != undefined) {
                // Removes this address from the object
                let newAddress = value.removeAddress(address);

                // This means the object is not stored anywhere
                // So all its references can also be freed
                if (newAddress == undefined) {
                    let addresses = value.getReferences();
                    for (let add of addresses) {
                        this.free(add);
                    }
                }
            }

            // Mark this address as free
            if (markAsFree) {
                this.freeAddresses.push(address);
            }
        }
    }

    // Stores this object as a placeholder while it is waiting to be assigned
    // RETURNS: Nothing
    addPlaceholder(obj, scopeOffset = -1) {
        // Get the address of the new placholder
        let address = this.alloc(obj);

        // Push the placeholder to the array
        this.placeholders.push(address);
        // Get the scope of the placeholder
        // This is the minimum scope that this placeholder will remain in
        // i.e. if the scope level gets lower than this value, the placeholder will be deleted
        // It is -1 by default as most placeholders are created just before exiting a scope
        this.placeholderScopes.push(this.context.environment.getScopeIndex() + scopeOffset);

        //console.log(`[@${address}] Added placeholder at scope: ${this.context.environment.getScopeIndex()}`);
        //console.log(obj);
    }

    // Checks if this object is stored in a placeholder address
    // If it is, it removes it from that address
    // RETURNS: Nothing
    checkPlaceholders(obj) {
        // Go through all placeholders and check if the object is stored at any of them
        for (let i = this.placeholders.length - 1; i >= 0; i--) {
            if (obj.hasAddress(this.placeholders[i])) {
                this.free(this.placeholders[i]);
                //console.log(`[@${this.placeholders[i]}] Removed placeholder`);
                //console.log(obj);
                this.placeholders.splice(i, 1);
                this.placeholderScopes.splice(i, 1);
            }
        }
    }

    // Cleans up all placeholders from a specified scope
    // Placeholders are cleaned after two scopes are exited from their creation
    // RETURNS: Nothing
    cleanPlaceholders(scopeIndex) {
        //console.log(`Cleaning placeholders of scope: ${scopeIndex}`);
        // Go through all placeholders and remove any that were stored at this scope (or higher)
        for (let i = this.placeholders.length - 1; i >= 0; i--) {
            if (this.placeholderScopes[i] >= scopeIndex) {
                this.free(this.placeholders[i]);
                //console.log(`[@${this.placeholders[i]}] Removed placeholder of scope: ${this.placeholderScopes[i]}`);
                this.placeholders.splice(i, 1);
                this.placeholderScopes.splice(i, 1);
            }
        }
    }
}*/