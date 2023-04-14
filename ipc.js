const getAllFiles = require("./getAllFiles");

module.exports.init = () => {
    let files = getAllFiles(__dirname + "/ipc");
    for (let i in files) {
        global.dbm.log("Init IPC: " + files[i], "ipc");
        require(files[i]);
    }
}