const fs = require('fs');
const p = require('path');
const readline = require('readline-sync');

module.exports = class {
    // Ask a (Y/N) question
    // RETURNS: Boolean (true if user said yes)
    static yesNo(question) {
        let res;
        // Keep asking until the user gives a valid response
        do {
            res = readline.question(`${question} (Y/N):`);
            // Also allow empty string, which defaults to yes
        } while (res != '' && res.toLowerCase() != 'y' && res.toLowerCase() != 'n');
        
        console.log();
        return res.toLowerCase() != 'n';  
    }
    
    // If a file/folder already exists, ask if it can be deleted
    // RETURNS: Boolean saying whether the file/folder was deleted
    static confirmDelete(path) {
        console.log(`${path} already exists.`);
        if (fs.lstatSync(path).isDirectory()) {
            if (!this.yesNo("Would you like to recreate it? NOTE: This will delete all files in this directory.")) {
                return false;
            }
    
            // Delete the directory if the user said yes
            this.deleteDir(path);
            return true;
        }
    
        if (!this.yesNo("Would you like to recreate it? NOTE: This will delete the contents of this file.")) {
            return false;
        }
    
        // Delete the file if the user said yes
        fs.unlinkSync(path);
        return true;
    }
    
    // Creates a file
    // RETURNS: Nothing
    static createFile(filePath, contents) {
        // If the file exists, ask if it can be deleted
        if (fs.existsSync(filePath)) {
            if (!this.confirmDelete(filePath)) return;
        }
    
        // Create the file
        fs.writeFileSync(filePath, contents);
        console.log(`Created file: ${filePath}\n`);
    }
    
    // Creates a folder
    // RETURNS: Nothing
    static createDir(dirPath) {
        // If the folder exists, ask if it can be deleted
        if (fs.existsSync(dirPath)) {
            if (!this.confirmDelete(dirPath)) return;
        }
    
        // Create the folder
        fs.mkdirSync(dirPath);
        console.log(`Created directory: ${dirPath}\n`);
    }
    
    // Deletes a folder
    // RETURNS: Nothing
    static deleteDir(dirPath) {
        if (fs.existsSync(dirPath)) {
            // Delete everything in this folder
            fs.readdirSync(dirPath).forEach(file => {
                const curPath = p.join(dirPath, file);
                if (fs.lstatSync(curPath).isDirectory()) {
                    // Recursively delete the subfolder
                    this.deleteDir(curPath);
                } else {
                    // Delete the file
                    fs.unlinkSync(curPath);
                }
            });

            // Once the folder is empty, delete it
            fs.rmdirSync(dirPath);
        }
    }
}