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
        if (this.parent != null && !forceNewScope) {
            stored = this.parent.set(identifier, address, false, true);
        }

        if (!stored) {
            if (this.identifiers.get(identifier) != undefined || !replaceOnly) {
                this.identifiers.set(identifier, address);
                stored = true;
            }
        }

        return stored;
    }
}