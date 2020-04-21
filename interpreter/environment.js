const Scope = require('./scope');

module.exports = class {
    constructor() {
        // The initial scope
        this.scope = new Scope();

        // The scope stack
        this.scopes = [this.scope];
    }

    // Enters a scope
    // Branches off the scope at index [branchIndex]
    // By default, branches off the current scope
    // RETURNS: Nothing
    enterScope(branchIndex) {
        let parentScope;
        if (branchIndex == undefined) {
            parentScope = this.scope;

        } else if (branchIndex < this.scopes.length) {
            parentScope = this.scopes[branchIndex];

        } else {
            throw new Error("branchIndex out of range - environment.js")
        }

        let newScope = new Scope(parentScope);
        this.scopes.push(newScope);
        this.scope = newScope;
    }

    // Pops the last scope off the scope stack
    // RETURNS: Nothing
    exitScope() {
        this.scope = this.scopes.pop();
    }

    // Finds where an identifier is stored
    // RETURNS: Memory address of the identifier
    get(identifier) {
        return this.scope.get(identifier);
    }

    // Stores the memory address that the identifier refers to
    // RETURNS: Nothing
    set(identifier, address, forceNewScope = false) {
        this.scope.set(identifier, address, forceNewScope);
    }
}