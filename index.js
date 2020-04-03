const fs = require('fs');
const Lexer = require('./lexer/lexer');
const Parser = require('./parser/parser');

let codeText;

const filename = 'code.cool';

fs.readFile(`./${filename}`, 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }

    codeText = data;
    console.log(codeText);

    let parser = new Parser(codeText, filename);

    let test = parser.test();

    console.log(test);

    // let lexer = new Lexer(codeText, filename);

    // let test = lexer.allTokens();
    // console.log(test);
});

