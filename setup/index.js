const fs = require('fs');
const p = require('path');

const utils = require('./fsutils');

let config = fs.readFileSync('./setup/config.json');
config = JSON.parse(config);

// Wrap it in a function so that it can be exited using return
(() => {
    // If the folder already exists, ask before recreating it
    if (fs.existsSync(p.join('./', config.folder))) {
        console.log("It seems like you have already run this setup program before. ");
        if (!utils.yesNo("Are you sure you want to do it again?")) {
            return;
        }
    }

    console.log("Running setup program\n");

    // Create the folder
    utils.createDir(p.join('./', config.folder));

    // Create README.txt
    let readmeFile = fs.readFileSync(p.join('./setup/files', config.readme), 'utf8');
    utils.createFile(p.join('./', config.folder, config.readme), readmeFile);

    // Create the 'code' folder
    utils.createDir(p.join('./', config.folder, 'code'));

    // Create code.cool
    let helloWorldCode = fs.readFileSync(p.join('./setup/files', config.helloWorld), 'utf8');
    utils.createFile(p.join('./', config.folder, 'code', config.helloWorld), helloWorldCode);

    // Create the config JSON object
    let configObj = {
        input: config.helloWorld
    }

    let configStr = JSON.stringify(configObj, null, '\t');
    // Create config.json
    utils.createFile(p.join('./', config.folder, 'config.json'), configStr);

    console.log('Setup complete.\n');
    console.log(`Please read the README located in the '${config.folder}' directory.`);

})();