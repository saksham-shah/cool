const Keywords = require('./keywords');
const TokenType = require('./tokenType');
const Token = require('./token');
const FSM = require('./fsm')

const CharUtils = require('../utils/charutils');
const Report = require('../utils/report');

// Lexer takes a text input and converts it into Tokens
module.exports = class {
    constructor(input, file) {
        this.input = input;
        this.file = file;

        this.len = input.length;
        this.counter = 0;

        this.line = 1;
        this.column = 1;

        // Used for the lookahead function
        this.buffer = null;

        // Finite state machine which detects whether a number format is valid
        this.numberFSM = FSM.buildNumberFSM();
        // Finite state machine which detects whether a string format is valid
        this.stringFSM = FSM.buildStringFSM();
    }

    // Generates all tokens for the input - currently unused
    // RETURNS: array of Tokens
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

    // Generates the next token
    // RETURNS: Token
    nextToken() {
        // If there are tokens in the buffer, return the the first one
        if (this.buffer) {
            let token =  this.buffer;
            this.buffer = null;
            return token;
        };

        return this.readToken();
    }

    // Reads the next characters in the input to generate the next token
    // RETURNS: Token
    readToken() {
        // Skips spaces etc.
        this.skipWhiteSpace();

        // End of the text input
        if (this.counter >= this.len) {
            return new Token(TokenType.Endofinput, 'end', this.line, this.column, this.file);
        }
        
        // Next character
        let char = this.getChar();

        // Gets the corresponding token depending on what the next character is

        if (CharUtils.isLetter(char)) {
            return this.recogniseIdentifier();
        }

        if (CharUtils.isDigit(char)) {
            return this.recogniseNumber();
        }

        if (CharUtils.isStringMark(char)) {
            return this.recogniseString();
        }

        if (CharUtils.isOperator(char)) {
            return this.recogniseOperator(char);
        }

        if (CharUtils.isBracket(char)) {
            return this.recogniseBracket(char);
        }

        if (CharUtils.isDot(char) || CharUtils.isComma(char) || CharUtils.isColon(char) || CharUtils.isSemicolon(char)) {
            return this.recogniseDelimiter(char);
        }

        if (CharUtils.isNewline(char)) {
            let line = this.line;
            let column = this.column;

            this.counter++;
            this.line++;
            this.column = 0;

            return new Token(TokenType.Newline, 'new line', line, column, this.file);
        }

        Report.error(`Unexpected token ${char}`, this);
    }

    // Look at the next token without actually moving on to it (used by Parser)
    // RETURNS: Token
    lookahead() {
        let token = this.readToken();

        this.buffer = token;
        
        return token;
    }

    // Get the current position of the counter
    // RETURNS: State object
    getState() {
        return {
            counter: this.counter,
            line: this.line,
            column: this.column
        }
    }

    // Sets the current position of the counter to the value in the state object
    // RETURNS: Nothing
    setState(state) {
        this.counter = state.counter;
        this.line = state.line;
        this.column = state.column;
    }
    
    // The next few methods all recognise and return a token
    // RETURNS: Token

    // Variable and function names and keywords
    recogniseIdentifier() {
        let value = '';

        let char = this.getChar();

        do {
            value += char;
            this.counter++;

            char = this.getChar();
        } while (CharUtils.isLetter(char) || CharUtils.isDigit(char));

        // Check if it is a keyword
        return this.recogniseKeyword(value);
    }

    recogniseKeyword(value) {
        let column = this.column;
        this.column += value.length;

        for (let keyword of Keywords) {
            // If the identifier is a keyword, return a Keyword token
            if (value == TokenType[keyword]) {
                return new Token(TokenType[keyword], value, this.line, column, this.file)
            };
        }

        // Otherwise return a normal Identifier token
        return new Token(TokenType.Identifier, value, this.line, column, this.file);
    }

    recogniseNumber() {
        // Check if a valid number is entered
        let result = this.numberFSM.run(this);

        if (!result.recognised) {
            Report.error(`Invalid number ${result.value}`, this);
        }

        let column = this.column;
        this.column += result.value.length;

        return new Token(TokenType.Number, Number(result.value), this.line, column, this.file);
    }

    recogniseString() {
        // Check if a valid number is entered
        let result = this.stringFSM.run(this);

        if (!result.recognised) {
            Report.error(`Invalid string ${result.value}`, this);
        }

        let column = this.column;
        this.column += result.value.length;

        return new Token(TokenType.String, parseString(result.value.substr(1, result.value.length - 2)), this.line, column, this.file);
    }

    recogniseOperator(char) {
        let column = this.column;
        
        this.counter++;
        this.column++;

        let nextChar = null;
        if (this.counter + 1 < this.len) nextChar = this.getChar();

        if (nextChar == '=' || nextChar == '&' || nextChar == '|') {
            this.counter++;
            this.column++;
        }

        switch (char) {
            case '+':
                if (nextChar == '=') {
                    return new Token(TokenType.PlusEqual, '+=', this.line, column, this.file);
                }

                if (nextChar == '+') {
                    this.counter++;
                    this.column++;
                    return new Token(TokenType.PlusPlus, '++', this.line, column, this.file);
                }

                return new Token(TokenType.Plus, '+', this.line, column, this.file);

            case '-':
                if (nextChar == '=') {
                    return new Token(TokenType.MinusEqual, '-=', this.line, column, this.file);
                }

                if (nextChar == '-') {
                    this.counter++;
                    this.column++;
                    return new Token(TokenType.MinusMinus, '--', this.line, column, this.file);
                }

                return new Token(TokenType.Minus, '-', this.line, column, this.file);

            case '*':
                if (nextChar == '=') {
                    return new Token(TokenType.TimesEqual, '*=', this.line, column, this.file);
                }
                return new Token(TokenType.Times, '*', this.line, column, this.file);
        
            case '/':
                if (nextChar == '/') {
                    this.skipUntilNewline();
                    return this.readToken();
                }

                if (nextChar == '*') {
                    this.skipUntilMultilineEnd();
                    return this.readToken();
                }

                if (nextChar == '=') {
                    return new Token(TokenType.DivideEqual, '/=', this.line, column, this.file);
                }
                return new Token(TokenType.Divide, '/', this.line, column, this.file);
            
            case '%':
                if (nextChar == '=') {
                    return new Token(TokenType.ModEqual, '%=', this.line, column, this.file);
                }
                return new Token(TokenType.Mod, '%', this.line, column, this.file);

            case '=':
                if (nextChar == '=') {
                    return new Token(TokenType.DoubleEquals, '==', this.line, column, this.file);
                }
                if (nextChar == '>') {
                    this.counter++;
                    this.column++;
                    return new Token(TokenType.Arrow, '=>', this.line, column, this.file);
                }
                return new Token(TokenType.Equal, '=', this.line, column, this.file);
            
            case '!':
                if (nextChar == '=') {
                    return new Token(TokenType.NotEqual, '!=', this.line, column, this.file);
                }
                return new Token(TokenType.Not, '!', this.line, column, this.file);
            
            case '&':
                if (nextChar == '&') {
                    return new Token(TokenType.And, '&&', this.line, column, this.file);
                }
                break;

            case '|':
                if (nextChar == '|') {
                    return new Token(TokenType.Or, '||', this.line, column, this.file);
                }
                break;

            case '>':
                if (nextChar == '=') {
                    return new Token(TokenType.GreaterThanOrEqual, '>=', this.line, column, this.file);
                }
                return new Token(TokenType.GreaterThan, '>', this.line, column, this.file);

            case '<':
                if (nextChar == '=') {
                    return new Token(TokenType.LessThanOrEqual, '<=', this.line, column, this.file);
                }
                return new Token(TokenType.LessThan, '<', this.line, column, this.file);
        }

        this.column--;
        Report.error(`Unexpected token ${char}`, this);
    }

    recogniseBracket(char) {
        this.counter ++;
        this.column++;

        switch (char) {
            case '(':
                return new Token(TokenType.OpenBracket, '(', this.line, this.column - 1, this.file);

            case ')':
                return new Token(TokenType.CloseBracket, ')', this.line, this.column - 1, this.file);

            case '[':
                return new Token(TokenType.OpenSquare, '[', this.line, this.column - 1, this.file);
                
            case ']':
                return new Token(TokenType.CloseSquare, ']', this.line, this.column - 1, this.file);

            case '{':
                return new Token(TokenType.OpenBrace, '{', this.line, this.column - 1, this.file);
                
            case '}':
                return new Token(TokenType.CloseBrace, '}', this.line, this.column - 1, this.file);

            default:
                this.column--;
                Report.error(`Unexpected token ${char}`, this);

        }

        if (char === '(') {
            return new Token(TokenType.OpenBracket, '(', this.line, this.column - 1, this.file);
        }

        if (char === ')') {
            return new Token(TokenType.CloseBracket, ')', this.line, this.column - 1, this.file);
        }
    }

    recogniseDelimiter(char) {
        this.counter ++;
        this.column++;

        if (char === '.') {
            return new Token(TokenType.Dot, '.', this.line, this.column - 1, this.file);
        }

        if (char === ',') {
            return new Token(TokenType.Comma, ',', this.line, this.column - 1, this.file);
        }

        if (char === ':') {
            return new Token(TokenType.Colon, ':', this.line, this.column - 1, this.file);
        }

        if (char === ';') {
            return new Token(TokenType.Semicolon, ';', this.line, this.column - 1, this.file);
        }
    }

    // Gets the next character in the input
    // RETURNS: character
    getChar() {
        return this.input.charAt(this.counter);
    }

    // Remove unnecessary whitespace
    // RETURNS: nothing
    skipWhiteSpace() {
        while (this.counter < this.len && (CharUtils.isWhitespace(this.getChar()))) {
            // if (CharUtils.isNewline(this.getChar())) {
            //     this.line++;
            //     this.column = 0;
            // }
            this.counter++;
            this.column++;
        }
    }

    // Skip to the next line (used for commenting code)
    // RETURNS: nothing
    skipUntilNewline() {
        while (this.counter < this.len && !CharUtils.isNewline(this.getChar())) {
            this.counter++;
            this.column++;
        }
    }

    // Skip to the next *\ (end of multiline comment)
    skipUntilMultilineEnd() {
        let found = false;
        while (this.counter < this.len && !found) {
            if (this.getChar() == '*') {
                this.counter++;
                this.column++;
                if (this.getChar() == '/') {
                    found = true;
                    this.counter++;
                    this.column++;
                }
            } else {
                if (CharUtils.isNewline(this.getChar())) {
                    this.line++;
                    this.column = 0;
                }
                this.counter ++;
                this.column ++;
            }
        }
    }
}

function parseString(text) {
    return text.replace(/\\(.?)/g, function (match, char) {
        if (char == '\\') return '\\';
        if (char == 'n') return '\n';
        if (char == 't') return '\t';
        if (char == '') return '';
        return char;
    });
}