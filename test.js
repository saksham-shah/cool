function parseString(text) {
    return text.replace(/\\(.?)/g, function (match, char) {
        if (char == '\\') return '\\';
        if (char == 'n') return '\n';
        if (char == 't') return '\t';
        if (char == '') return '';
        return char;
    });
}

console.log(-(true ? 2 : 3))

// const readline = require('readline-sync');

// res = readline.question("INPUT: ");

// console.log(res == "");