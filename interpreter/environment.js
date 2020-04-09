const Obj = require('./object');
const Types = require('../types/types');

module.exports = class {
    constructor(context) {
        this.context = context;
        this.scopes = [];
        this.scopeCounter = -1;
        this.scope = null;
    }

    // Enter a new scope - e.g. entering a function or other block of code
    enterScope() {
        this.scopeCounter++;
        if (this.scopeCounter >= this.scopes.length) {
            this.scopes.push(new Map());
        }

        this.scope = this.scopes[this.scopeCounter];
    }

    // Exit a scope - used after the end of a function or other block of code
    exitScope() {
        this.scopes.splice(this.scopeCounter, 1);
        this.scopeCounter--;

        // Go back one scope
        if (this.scopeCounter >= 0) {
            this.scope = this.scopes[this.scopeCounter]
        } else {
            this.scope = null;
        }
    }

    // Looks for an identifier in the current scope
    // If not found, checks each previous scope in turn
    // RETURNS: Obj (an Object in Cool)
    getValue(identifier) {
        let value, scope, counter;
        // If the current scope is null, something has gone very wrong
        if (this.scope == null) {
            value = undefined;
        } else {
            scope = this.scope;
            counter = this.scopeCounter;

            value = scope.get(identifier);
        }

        // Goes backwards through the scopes
        while (value == undefined && counter > 0) {
            counter--;
            scope = this.scopes[counter];
            value = scope.get(identifier);
        }

        // Must always return an Obj so if the value isn't found, it returns an Undefined Obj
        if (value == undefined) return Obj.create(this.context, Types.Undefined);

        return value;
    }

    // Sets a value to an identifier
    // Not as simple as just setting it in the current scope
    // If an identifier has been defined in a previous scope, it acts as a global variable
    // In that case, an assignment would set variable in the previous scope to the value
    // And it wouldn't be in the current scope
    setValue(identifier, value) {
        let scope = this.scope;
        let counter = this.scopeCounter;

        let findValue = scope.get(identifier);

        // If the value is undefined, don't store it as it just wastes space
        if (value.type == Types.Undefined) value = undefined;

        // Looks for the value, similar to getValue
        while (findValue == undefined && counter > 0) {
            counter--;
            scope = this.scopes[counter];
            findValue = scope.get(identifier);
        }

        // If the value is found in a scope, sets the value IN THAT SCOPE
        if (findValue != undefined) {
            scope.set(identifier, value);
        } else {
            // Otherwise it creates a new value in the current scope
            this.scope.set(identifier, value);
        }
    }
}