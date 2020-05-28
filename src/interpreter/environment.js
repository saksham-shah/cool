const Scope = require('./scope');

module.exports = class {
    constructor(context) {
        this.context = context;

        // The initial scope
        this.scope = null;//new Scope();

        // The scope stack
        this.scopes = [];
        // this.scopes = [this.scope];
    }

    // Creates the base scope and stores it in the store
    // RETURNS: Nothing
    initialScope() {
        this.scope = new Scope();
        this.scopes.push(this.scope);

        this.context.store.alloc(this.scope);
    }

    // Enters a scope
    // Branches off the scope at index [branchIndex]
    // By default, branches off the current scope
    // RETURNS: Nothing
    enterScope(scopeAddress) {
        let parentScope;
        if (scopeAddress == undefined) {
            parentScope = this.scope;

        } else {
            parentScope = this.context.store.locations[scopeAddress];
        }

        // } else if (branchIndex < this.scopes.length) {
        //     parentScope = this.scopes[branchIndex];

        // } else {
        //     throw new Error("branchIndex out of range - environment.js")
        // }

        // Create the new scope
        let newScope = new Scope(parentScope);
        this.scopes.push(newScope);
        this.scope = newScope;

        // Store the new scope and add a reference to the parent scope
        this.context.store.alloc(this.scope);
        this.context.store.alloc(parentScope);
    }

    // Pops the last scope off the scope stack
    // RETURNS: Nothing
    exitScope() {
        // Free up all the identifiers used in the previous scope
        // this.scopes.pop().free(this.context);
        this.context.store.free(this.scopes.pop().address);
        this.scope = this.scopes[this.scopes.length - 1];
    }

    // Used to store the scope in which a function or class has been defined
    // RETURNS: Index of current scope
    getScopeIndex() {
        return this.scopes.length - 1;
    }

    // Adds a reference to the current scope and returns its address
    // RETURNS: The address of the current scope
    getScopeAddress() {
        return this.context.store.alloc(this.scope);
    }

    // Finds where an identifier is stored
    // RETURNS: Memory address of the identifier
    get(identifier, forceNewScope = false) {
        return this.scope.get(identifier, forceNewScope);
    }

    // Stores the memory address that the identifier refers to
    // RETURNS: Nothing
    set(identifier, address, forceNewScope = false) {
        this.scope.set(identifier, address, forceNewScope);
    }
}