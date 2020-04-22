module.exports = class {
    constructor(parent = null) {
        // The scope directly above this one
        // Hierarchy leads back to the base scope
        this.parent = parent;

        // Stores the memory addresses linked to each identifier
        this.identifiers = new Map();
    }

    // Finds where an identifier is stored
    // RETURNS: Memory address of the identifier
    get(identifier) {
        let address = this.identifiers.get(identifier);

        // Recursively searches the parent scopes
        if (address == undefined) {
            if (this.parent != null) {
                address = this.parent.get(identifier);
            }
        }

        return address;
    }

    // Stores the memory address that the identifier refers to
    // RETURNS: Boolean which says whether the identifier has been stored
    set(identifier, address, forceNewScope = false, replaceOnly = false) {
        let stored = false;
        // Looks for a variable to replace in a parent scope
        // If forceNewScope is true, it is forced to create a new identifier in this scope
        if (this.parent != null && !forceNewScope) {
            stored = this.parent.set(identifier, address, false, true);
        }

        // If it hasn't been stored already
        if (!stored) {
            // Stores in the current scope
            if (this.identifiers.get(identifier) != undefined || !replaceOnly) {
                this.identifiers.set(identifier, address);
                stored = true;
            }
        }

        return stored;
    }

    // Frees up all the space taken up by identifiers stored in this scope
    // Used before deleting the scope, so the identifiers will no longer be used
    // RETURNS: Nothing
    free(context) {
        for (let address of this.identifiers.values()) {
            context.store.free(address);
        }
    }
}