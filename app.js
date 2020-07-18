"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const http_1 = require("http");
const fs_1 = require("fs");
const path_1 = require("path");
// Set this to where GTA is installed.
const gtaDataDir = `d:/Games/Rockstar Games/Grand Theft Auto/GTADATA`;
if (electron_1.app) {
    // Electron found. Create window using it.
    function createWindow() {
        // Create the browser window.
        const win = new electron_1.BrowserWindow({
            show: false,
            autoHideMenuBar: true,
            webPreferences: {
                nodeIntegration: true
            }
        });
        // Load the index.html of the app.
        win.loadFile('wwwroot/index.html');
        // Main menu should only contain reload and close buttons.
        const menu = electron_1.Menu.buildFromTemplate([{ role: "reload" }, { role: "close" }]);
        electron_1.Menu.setApplicationMenu(menu);
        win.maximize();
        win.show();
        win.webContents.openDevTools();
        electron_1.globalShortcut.register("f5", () => win.reload());
        electron_1.globalShortcut.register("CommandOrControl+R", () => win.reload());
        electron_1.ipcMain.on("require-file", (event, filename) => {
            // Check ".." so files outside data directory aren't read.
            if (filename.indexOf("..") === -1) {
                const file = path_1.join(gtaDataDir, filename);
                if (fs_1.existsSync(file)) {
                    const result = new DataView(new Uint8Array(fs_1.readFileSync(file)).buffer);
                    event.sender.send("got-files", result);
                    return;
                }
            }
            event.sender.send("got-files", null);
        });
    }
    electron_1.app.whenReady().then(createWindow);
}
else {
    // No electron found. Create http server.
    const mimes = {
        ".html": "text/html",
        ".css": "text/css",
        ".js": "text/javascript",
        ".json": "application/json",
        ".png": "image/png",
        ".ico": "image/x-icon",
    };
    const port = (_a = process.env.port) !== null && _a !== void 0 ? _a : 1337;
    http_1.createServer((req, res) => {
        var _a, _b;
        let url = (_a = (req.url === "/" ? "index.html" : req.url)) !== null && _a !== void 0 ? _a : "index.html";
        // Check ".." so files outside data directory aren't read.
        if (url.indexOf("..") > -1) {
            res.writeHead(404);
            res.end();
            return;
        }
        let dir = path_1.join(__dirname, "wwwroot");
        if (url.indexOf("/data/") === 0) {
            dir = gtaDataDir;
            url = url.substring(5);
        }
        let fileExt = path_1.extname(url);
        let mimeType = (_b = mimes[fileExt]) !== null && _b !== void 0 ? _b : "application/octet-stream";
        const fullPath = path_1.join(dir, url);
        if (!fs_1.existsSync(fullPath)) {
            res.writeHead(404);
            res.end();
            return;
        }
        res.writeHead(200, { "Content-Type": mimeType });
        fs_1.createReadStream(fullPath).pipe(res);
    }).listen(port);
    console.log(`Running HTTP server on port ${port}...`);
}
//# sourceMappingURL=app.js.map