const Obj = require('./object');
const Types = require('../types/types');

module.exports = class {
    constructor(context) {
        this.context = context;
        this.scopes = [];
        this.scopeCounter = -1;
        this.scope = null;
    }

    enterScope() {
        this.scopeCounter++;
        if (this.scopeCounter >= this.scopes.length) {
            this.scopes.push(new Map());
        }

        this.scope = this.scopes[this.scopeCounter];
    }

    exitScope() {
        this.scopes.splice(this.scopeCounter, 1);
        this.scopeCounter--;

        if (this.scopeCounter >= 0) {
            this.scope = this.scopes[this.scopeCounter]
        } else {
            this.scope = null;
        }
    }

    getValue(identifier) {
        let value, scope, counter;
        if (this.scope == null) {
            value = undefined;
        } else {
            scope = this.scope;
            counter = this.scopeCounter;

            value = scope.get(identifier);
        }

        while (value == undefined && counter > 0) {
            counter--;
            scope = this.scopes[counter];
            value = scope.get(identifier);
        }

        if (value == undefined) return Obj.create(this.context, Types.Undefined);

        return value;
    }

    setValue(identifier, value) {
        let scope = this.scope;
        let counter = this.scopeCounter;

        let findValue = scope.get(identifier);

        if (value.type == Types.Undefined) value = undefined;

        while (findValue == undefined && counter > 0) {
            counter--;
            scope = this.scopes[counter];
            findValue = scope.get(identifier);
        }

        if (findValue != undefined) {
            scope.set(identifier, value);
        } else {
            this.scope.set(identifier, value);
        }
    }
}