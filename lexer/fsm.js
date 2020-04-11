var CharUtils = require('../utils/charutils');

// Finite state machine used to detect valid numbers, strings etc
module.exports = class FSM {
    constructor(initial, accepting, nextState) {
        this.initialState = initial;
        this.acceptingStates = accepting;
        this.nextStateFunc = nextState;
    }

    // Finds a valid string
    // RETURNS: { recognised: Boolean, value: string }
    run(lexer) {
        let currentState = this.initialState;
        let output = '';
        let nextState = '';

        // While an invalid character is not found (and the input doesn't end)
        while (nextState != -1 && lexer.counter < lexer.len) {
            let char = lexer.getChar();
            nextState = this.nextStateFunc(currentState, char);

            // If the character is valid, add it to the output
            if (nextState != -1) {
                currentState = nextState;
                output += char;
                lexer.counter++;
            }
        }

        return { recognised: this.acceptingStates.includes(currentState), value: output };
    }

    // Detects valid numbers (only integers right now)
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

    // Detects valid strings
    static buildStringFSM() {
        return new FSM('Start', ['End'], (state, char) => {
            switch (state) {
                case 'Start':
                    if (CharUtils.isStringMark(char)) return 'Main';
                    break;

                case 'Main':
                    if (CharUtils.isStringMark(char)) return 'End'
                    if (!CharUtils.isNewline(char)) return 'Main';
                    break;
            }

            return -1;
        });
    }
}