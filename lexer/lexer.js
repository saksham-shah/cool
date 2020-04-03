const TokenType = require('./tokenType');
const Token = require('./token');
const FSM = require('./fsm')

const CharUtils = require('../utils/charutils');
const Report = require('../utils/report');

module.exports = class {
    constructor(input, file) {
        this.input = input;
        this.file = file;

        this.len = input.length;
        this.counter = 0;

        this.line = 1;
        this.column = 1;

        this.buffer = [];

        this.numberFSM = FSM.buildNumberFSM();
    }

    allTokens() {
        this.counter = 0;
        this.line = 1;
        this.column = 1;

        let tokens = [];
        let token;

        do {
            token = this.nextToken();
            tokens.push(token);
        } while (token.type != TokenType.Endofinput);

        return tokens;
    }

    nextToken() {
        if (this.buffer.length > 0) return this.buffer.pop();

        return this.readToken();
    }

    readToken() {
        this.skipWhiteSpace();

        if (this.counter >= this.len) {
            return new Token(TokenType.Endofinput, 'end', this.line, this.column, this.file);
        }
        
        let char = this.getChar();

        while (CharUtils.isNewline(char)) {
            this.counter++;
            char = this.getChar();

            this.line++;
            this.column = 1;
        };

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

        throw new Error(Report.error(`Unexpected token ${char}`, this.line, this.column, this.file));
    }

    lookahead() {
        let token = this.readToken();

        this.buffer.push(token);
        
        return token;
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

        let column = this.column;
        this.column += value.length;

        for (let keyword of keywords) {
            if (value == TokenType[keyword]) {
                return new Token(TokenType[keyword], value, this.line, column, this.file)
            };
        }

        return new Token(TokenType.Identifier, value, this.line, column, this.file);
    }

    recogniseNumber() {
        let result = this.numberFSM.run(this);

        if (!result.recognised) {
            throw new Error(Report.error(`Invalid number ${result.value}`, this.line, this.column, this.file));
        }

        let column = this.column;
        this.column += result.value.length;

        return new Token(TokenType.Number, Number(result.value), this.line, column, this.file);
    }

    recogniseOperator(char) {
        this.counter++;
        this.column++;

        if (char === '=') {
            return new Token(TokenType.Equal, '=', this.line, this.column - 1, this.file);
        }

        if (char === '+') {
            return new Token(TokenType.Plus, '+', this.line, this.column - 1, this.file);
        }

        if (char === '-') {
            return new Token(TokenType.Minus, '-', this.line, this.column - 1, this.file);
        }

        if (char === '*') {
            return new Token(TokenType.Times, '*', this.line, this.column - 1, this.file);
        }

        if (char === '/') {
            return new Token(TokenType.Divide, '/', this.line, this.column - 1, this.file);
        }
    }

    recogniseBracket(char) {
        this.counter ++;
        this.column++;

        if (char === '(') {
            return new Token(TokenType.OpenBracket, '(', this.line, this.column - 1, this.file);
        }

        if (char === ')') {
            return new Token(TokenType.CloseBracket, ')', this.line, this.column - 1, this.file);
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
            this.column++;
        }
    }
}