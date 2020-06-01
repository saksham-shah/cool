module.exports = class {
    constructor() {
        // this.context = context;

        // Stores all of the values in use
        this.locations = [];

        // Counts references to each object
        this.references = [];

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
        if (value != undefined && value.address != undefined) {
            this.references[value.address]++;
            return value.address;
        }

        let address;
        // If there are free spaces in the array, fill them first
        if (this.freeAddresses.length > 0) {
            address = this.freeAddresses.pop();

            if (this.locations[address] != undefined) {
                console.log(`Tried to store at: ${address}`)
                throw new Error()
            }

            this.locations[address] = value;
            this.references[address] = 1;
        } else {
            address = this.locations.length;

            // If there are no free spaces, create a new space in the array
            this.locations.push(value);
            this.references.push(1);
        }

        // Add this address to the object
        if (value != undefined) {
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
    // ASSUMES that it is rewriting over the value that it was previously using
    // RETURNS: The address where it was stored (not always the address specified)
    write(address, value) {
        if (address >= 0 && address < this.locations.length) {
            // Adds this address to the object
            this.pushTemp(value);

            // Frees up this address as it is no longer in use
            this.free(address);

            // Gets a new address to write to (which is returned)
            let newAddress = this.alloc(value);

            this.popTemp();

            return newAddress;
        }

        return -1;
    }

    // Frees an address when it is no longer in use
    // RETURNS: Nothing
    free(address, reachable) {
        if (address >= 0 && address < this.locations.length) {

            // If reachable is undefined, this means this is part of the tracing collector
            // In which case, don't bother freeing the address if it isn't reachable
            // The tracing collection will free unreachable addresses
            if (reachable != undefined && !reachable[address]) {
                return;
            }

            let value = this.locations[address];

            // Decrements the number of references to this object
            this.references[address]--;

            // This means the object is not stored anywhere
            // So all its references can also be freed
            if (this.references[address] == 0) {
                this.locations[address] = undefined;

                if (value != undefined) {
                    value.address = undefined;

                    // Recursively frees all its references
                    let addresses = value.getReferences();
                    for (let add of addresses) {
                        this.free(add, reachable);
                    }
                }

                // Mark this address as free
                this.freeAddresses.push(address);

            } else if (this.references[address] < 0) {
                console.log("hmm.....")
                console.log(this.locations[address])
                this.references[address] = 0;
                throw new Error();
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

    // Traverses the objects and scopes stored in this store, and removes any unreachable addresses
    // Needed to prevent memory leaks due to circular referencing
    // RETURNS: The number of addresses it freed
    tracingCollection(addresses) {
        let reachable = [];
        for (let i = 0; i < this.locations.length; i++) {
            reachable.push(false);
        }

        // Flag all the addresses already in the array as reachable (i.e. not to be deleted)
        for (let address of addresses) {
            reachable[address] = true;
        }

        // Add the placeholder address
        if (!reachable[this.placeholder]) {
            addresses.push(this.placeholder);
            reachable[this.placeholder] = true;
        }

        // Add the temporary addresses
        for (let address of this.tempAddresses) {
            if (!reachable[address]) {
                addresses.push(address);
                reachable[address] = true;
            }
        }

        while (addresses.length > 0) {
            // Get the object/scope stored at this address
            let value = this.read(addresses[0]);

            if (value != undefined) {
                // Loop through all references made from the object
                for (let address of value.getReferences()) {
                    // If the address hasn't already been added to the array
                    if (!reachable[address]) {
                        // Set the address as reachable and add it to the array
                        reachable[address] = true;
                        addresses.push(address);
                    }
                }
            } else {
                console.log(`WARNING: tracing collector found undefined value @${addresses[0]}`);
            }

            if (this.references[addresses[0]] <= 0) {
                console.log(`ERROR: tracing collector found illegal free address @${addresses[0]}. Expect an actual error any time now...`);
            }

            // Remove this address from the array
            addresses.splice(0, 1);
        }

        let freed = 0;

        for (let i = 0; i < reachable.length; i++) {
            // If the address isn't reachable
            if (this.references[i] > 0 && !reachable[i]) {
                // Increment the counter
                freed++;

                // Remove the object/scope at index i
                // Duplicate code from Store.free() for now

                let value = this.locations[i];

                this.locations[i] = undefined;
                this.references[i] = 0;

                if (value != undefined) {
                    value.address = undefined;

                    // Recursively frees all its references
                    let addresses = value.getReferences();
                    for (let address of addresses) {
                        this.free(address, reachable);
                    }
                }

                // Mark this address as free
                this.freeAddresses.push(i);
            }
        }

        return freed;
    }
}