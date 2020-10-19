"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const fs_1 = require("fs");
const path_1 = require("path");
// Set this to where original game is installed.
let userSettings = { dataPaths: {} };
if (fs_1.existsSync("path.user")) {
    const userDataContent = fs_1.readFileSync("path.user", "utf-8");
    try {
        userSettings = JSON.parse(userDataContent);
    }
    catch (error) {
        console.log(`Error reading user settings: ${error.message}`);
    }
}
electron_1.contextBridge.exposeInMainWorld("electronBridge", {
    fetch: (filename) => {
        return new Promise((resolve, reject) => {
            let dir = path_1.join(__dirname, "wwwroot");
            let url = path_1.join(dir, filename);
            for (const key in userSettings.dataPaths) {
                const urlPart = `${key}/`;
                if (filename.indexOf(urlPart) === 0) {
                    dir = userSettings.dataPaths[key];
                    url = path_1.join(dir, filename);
                    break;
                }
            }
            if (url) {
                fs_1.readFile(url, (error, data) => {
                    console.log("post readFile", error, data);
                    if (error) {
                        reject(error);
                    }
                    else {
                        const ab = data.buffer.slice(0);
                        return resolve(ab);
                    }
                });
            }
            else {
                reject(`File ${filename} not found`);
            }
        });
    },
});
//# sourceMappingURL=preload.js.map