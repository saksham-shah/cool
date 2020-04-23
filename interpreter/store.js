module.exports = class {
    constructor() {
        // Stores all of the values in use
        this.locations = [];

        // Stores how many references there are to each value
        // Used to figure out when the value can be removed as it is no longer stored anywhere
        // NOTE: This whole thing may be completely unnecessary
        this.references = [];

        // Stores free addresses (of values which are no longer in use)
        this.freeAddresses = [];

        // Stores placeholder addresses for values waiting to be assigned
        this.placeholders = [];
    }

    // Takes a value, allocates a memory location for it and stores it
    // RETURNS: the address where it is stored
    alloc(value) {
        let address;
        // If there are free spaces in the array, fill them first
        if (this.freeAddresses.length > 0) {
            address = this.freeAddresses.pop();

            this.locations[address] = value;
            // Set references to 1 as this is the first reference to the new value
            this.references[address] = 1;
        } else {
            address = this.locations.length;

            // If there are no free spaces, create a new space in the array
            this.locations.push(value);
            this.references.push(1);
        }

        // Add this address to the object
        if (value != undefined) {
            value.addAddress(address);
            this.updatePlaceholders(value);
        }

        // If the object doesn't have an address yet, now it does
        // if (value != undefined && value.address == undefined) {
        //     value.address = address;
        // }

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
            this.updatePlaceholders(value);

            // Frees up this address before overwriting it
            this.free(address, false);
            this.locations[address] = value;

            // If there are other references to this value, it cannot simply be rewritten
            // if (this.references[address] > 1) {
            //     console.warn(`WARNING: Had to reallocate address ${address}`);
            //     this.references[address] -= 1;
            //     // A new address is found and the value is stored there
            //     return this.alloc(value);

            // } else {
            //     this.references[address] = 1;
            //     this.locations[address] = value;
            //     return address;
            // }
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

            // Decrement the number of references to this value
            // this.references[address] -= 1;

            // If the value has no references, it is no longer in use
            // The address is marked as free
            // if (this.references[address] == 0) {
            //     this.freeAddresses.push(address);
            // }
        }
    }

    // Stores this object as a placeholder while it is waiting to be assigned
    // RETURNS: Nothing
    addPlaceholder(obj) {
        let address = this.alloc(obj);
        this.placeholders.push(address);
    }

    // Checks if the object is stored at a placeholder address
    // If it is, it removes it from that address
    // RETURNS: Nothing
    updatePlaceholders(obj) {
        for (let i = this.placeholders.length - 1; i >= 0; i--) {
            if (obj.hasAddress(this.placeholders[i])) {
                this.free(this.placeholders[i]);
                this.placeholders.splice(i, 1);
            }
        }
    }

    // Increments the number of references of this address - UNUSED
    // RETURNS: The new number of references
    addReference(address) {
        if (address >= 0 && address < this.locations.length) {
            this.references[address]++;
            return this.references[address];
        }
    }
}