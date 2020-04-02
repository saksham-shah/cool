const fs = require('fs');
const Lexer = require('./lexer/lexer');

let codeText;

fs.readFile('./code.cool', 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }

    codeText = data;
    console.log(codeText);

    let lex = new Lexer(codeText);

    let tokens = lex.allTokens();

    console.log(tokens);
});

