var CharUtils = require('../utils/charutils');

module.exports = class FSM {
    constructor(initial, accepting, nextState) {
        this.initialState = initial;
        this.acceptingStates = accepting;
        this.nextStateFunc = nextState;
    }

    run(lexer) {
        let currentState = this.initialState;
        let output = '';
        let nextState = '';

        while (nextState != -1 && lexer.counter < lexer.len) {
            let char = lexer.getChar();
            nextState = this.nextStateFunc(currentState, char);

            if (nextState != -1) {
                currentState = nextState;
                output += char;
                lexer.counter++;
            }
        }

        return { recognised: this.acceptingStates.includes(currentState), value: output };
    }

    static buildNumberFSM() {
        return new FSM('Start', ['IntegerPart', 'DecimalPart'], (state, char) => {
            switch (state) {
                case 'Start':
                    if (CharUtils.isDigit(char)) return 'IntegerPart';
                    break;

                case 'IntegerPart':
                    if (CharUtils.isDigit(char)) return 'IntegerPart';
                    break;
            }

            return -1;
        });
    }
}