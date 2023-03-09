const fs = require("fs");

function getAllFiles (dirPath, arrayOfFiles) {
    let files = fs.readdirSync(dirPath);

    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function(file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            arrayOfFiles.push(dirPath + (dirPath.endsWith("/") ? "" : "/") + file);
        }
    });

    return arrayOfFiles;
}

module.exports = getAllFiles;