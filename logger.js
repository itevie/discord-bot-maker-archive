module.exports.log = (msg, type = "info") => {
    console.log("[" + type + "] " + msg);
    try { global.sendLog(msg, type) } catch {}
}