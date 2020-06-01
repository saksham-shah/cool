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
        this.scope = new Scope(this);

        let address = this.context.store.alloc(this.scope);
        this.scopes.push(address);
    }

    // Enters a scope
    // Branches off the scope at index [branchIndex]
    // By default, branches off the current scope
    // RETURNS: Nothing
    enterScope(scopeAddress) {
        // Get the address of the current scope (if one isn't given)
        if (scopeAddress == undefined) {
            scopeAddress = this.scope.address;
        }

        // Create the new scope
        this.scope = new Scope(this, scopeAddress);
        let address = this.context.store.alloc(this.scope);
        this.scopes.push(address);

        // Store the new scope and add a reference to the parent scope
        this.context.store.alloc(this.context.getValue(scopeAddress));
    }

    // Pops the last scope off the scope stack
    // RETURNS: Nothing
    exitScope() {
        // Free up the address of the previous scope
        this.context.store.free(this.scopes.pop());
        let address = this.scopes[this.scopes.length - 1];
        this.scope = this.context.getValue(address);

        // Run the tracing garbage collector
        this.runTracingCollector();
    }

    // Runs the tracing garbage collector
    // RETURNS: Nothing
    runTracingCollector() {
        // Create the initial array of reachable addresses
        
        // All scopes on the scope stack are reachable
        let addresses = this.scopes.slice();

        // The current 'this' object is reachable
        if (this.context.self != undefined) {
            addresses.push(this.context.self.address);
            if (this.context.self.address == undefined) {
                throw new Error();
            }
        } else {
            console.log(`WARNING: No 'this' object for some reason`);
        }

        // Run the collector
        this.context.store.tracingCollection(addresses);
    }

    // UNUSED
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