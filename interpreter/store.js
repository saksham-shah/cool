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

        // If the object doesn't have an address yet, now it does
        if (value != undefined && value.address == undefined) {
            value.address = address;
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
            // If there are other references to this value, it cannot simply be rewritten
            if (this.references[address] > 1) {
                console.warn(`WARNING: Had to reallocate address ${address}`);
                this.references[address] -= 1;
                // A new address is found and the value is stored there
                return this.alloc(value);

            } else {
                this.references[address] = 1;
                this.locations[address] = value;
                return address;
            }
        }

        return -1;
    }

    // Frees an address when it is no longer in use
    // RETURNS: Nothing
    free(address) {
        if (address >= 0 && address < this.locations.length) {
            // Decrement the number of references to this value
            this.references[address] -= 1;

            // If the value has no references, it is no longer in use
            // The address is marked as free
            if (this.references[address] == 0) {
                this.freeAddresses.push(address);
            }
        }
    }

    // Increments the number of references of this address
    // RETURNS: The new number of references
    addReference(address) {
        if (address >= 0 && address < this.locations.length) {
            this.references[address]++;
            return this.references[address];
        }
    }
}