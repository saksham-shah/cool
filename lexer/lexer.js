const TokenType = require('./tokenType');
const Token = require('./token');
const FSM = require('./fsm')
const CharUtils = require('../utils/charutils');

module.exports = class {
    constructor(input) {
        this.input = input;
        this.len = input.length;
        this.counter = 0;

        this.numberFSM = FSM.buildNumberFSM();
    }

    allTokens() {
        this.counter = 0;
        let tokens = [];
        let token;

        do {
            token = this.nextToken();
            tokens.push(token);
        } while (token.type != TokenType.Endofinput);

        return tokens;
    }

    nextToken() {
        this.skipWhiteSpace();

        if (this.counter >= this.len) {
            return new Token(TokenType.Endofinput, 'end');
        }
        
        let char = this.getChar();

        // while (CharUtils.isNewline(char)) {
        //     this.counter++;
        //     char = this.getChar();
        // };

        if (CharUtils.isLetter(char)) {
            return this.recogniseIdentifier();
        }

        if (CharUtils.isDigit(char)) {
            return this.recogniseNumber();
        }

        if (CharUtils.isOperator(char)) {
            return this.recogniseOperator(char);
        }

        if (CharUtils.isBracket(char)) {
            return this.recogniseBracket(char);
        }

        // if (CharUtils.isNewline(char)) {

        //     this.counter++;



        //     //return new Token(TokenType.Newline, 'new line');
        // }

        console.log('BADAAD');

        throw new Error(`Unexpected token ${char}`);
    }

    recogniseIdentifier() {
        let value = '';

        let char = this.getChar();

        do {
            value += char;
            this.counter++;

            char = this.getChar();
        } while (CharUtils.isLetter(char) || CharUtils.isDigit(char));

        return this.recogniseKeyword(value);
    }

    recogniseKeyword(value) {
        let keywords = Object.keys(TokenType).filter(key => TokenType[key].charAt(0).toLowerCase() === value.charAt(0));

        for (let keyword of keywords) {
            if (value == TokenType[keyword]) return new Token(TokenType[keyword], value);
        }

        return new Token(TokenType.Identifier, value);
    }

    recogniseNumber() {
        let result = this.numberFSM.run(this);

        if (!result.recognised) {
            throw new Error(`Invalid number ${result.value}`);
        }

        return new Token(TokenType.Number, Number(result.value));
    }

    recogniseOperator(char) {
        this.counter++;
        if (char === '=') {
            return new Token(TokenType.Equal, '=');
        }

        if (char === '+') {
            return new Token(TokenType.Plus, '+');
        }

        if (char === '-') {
            return new Token(TokenType.Minus, '-');
        }

        if (char === '*') {
            return new Token(TokenType.Times, '*');
        }

        if (char === '/') {
            return new Token(TokenType.Divide, '/');
        }
    }

    recogniseBracket(char) {
        this.counter ++;

        if (char === '(') {
            return new Token(TokenType.OpenBracket, '(');
        }

        if (char === ')') {
            return new Token(TokenType.CloseBracket, ')');
        }
    }

    getChar() {
        return this.input.charAt(this.counter);
    }

    lookAhead() {
        if (this.counter + 1 < this.len) return this.input.charAt(this.counter + 1);
        return null;
    }

    skipWhiteSpace() {
        while (this.counter < this.len && CharUtils.isWhitespace(this.getChar())) {
            this.counter++;
        }
    }
}