import { contextBridge } from "electron";
import { readFile, readFileSync, existsSync } from "fs";
import { join } from "path"


// Set this to where original game is installed.
let userSettings: { dataPaths: Record<string, string> } = { dataPaths: {} };

if (existsSync("paths.json")) {
    const userDataContent = readFileSync("paths.json", "utf-8");
    try {
        userSettings = JSON.parse(userDataContent);
    } catch (error) {
        console.log(`Error reading user settings: ${error.message}`);
    }
}

contextBridge.exposeInMainWorld("electronBridge", {
    fetch: (filename: string): Promise<ArrayBuffer> => {
        return new Promise<ArrayBuffer>((resolve, reject) => {
            let dir = join(__dirname, "wwwroot");
            let url = join(dir, filename);
            for (const key in userSettings.dataPaths) {
                const urlPart = `${key}/`
                if (filename.indexOf(urlPart) === 0) {
                    dir = userSettings.dataPaths[key];
                    url = join(dir, filename);
                    break;
                }
            }

            if (url) {
                readFile(url, (error: unknown, data: Buffer) => {
                    console.log("post readFile", error, data);
                    if (error) {
                        reject(error)
                    } else {
                        const ab = data.buffer.slice(0);
                        return resolve(ab);
                    }
                });
            } else {
                reject(`File ${filename} not found`);
            }
        });
    },
}
);