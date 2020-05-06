const fs = require('fs');
const p = require('path');

const RunFile = require('./runfile');

const Report = require('./utils/report');

// Make sure config.json exists
if (!fs.existsSync('./cool/config.json')) {
    throw new Error(`Cannot find config file (cool/config.json). Have you run 'npm run setup'?`)
}

// Get the path to the file which will be run
let config = fs.readFileSync('./cool/config.json');
config = JSON.parse(config);
let filePath = config.input;

// filePath is relative to the 'code' folder
// Get the path relative to the root
let path = p.join('./cool/code', filePath);

// Entered file doesn't exist
if (!fs.existsSync(path)) {
    Report.error(`No such file ${filePath}`)
}

// Entered file is actually a directory
if (fs.lstatSync(path).isDirectory()) {
    Report.error(`${filePath} is a directory`)
}

// Get the code
let code = fs.readFileSync(path, 'utf8');

// Run the code
runFile = new RunFile(code, filePath);
runFile.run();