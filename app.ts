import { app, BrowserWindow, Menu, globalShortcut, ipcMain } from "electron";
import { createServer, IncomingMessage, ServerResponse } from "http";
import { createReadStream, existsSync, readFileSync, readFile, statSync } from "fs";
import { extname, join } from "path";

// Set this to where original game is installed.
const gameDataDir = readFileSync("path.user", "utf-8");

if (app) {
    // Electron found. Create window using it.
    function createWindow() {
        // Create the browser window.
        const win = new BrowserWindow({
            show: false, // Start window as hidden. Show it after all initilization is done.
            autoHideMenuBar: true, // Don't show menu bar by defalt (it can be shown using Alt-key).
            minWidth: 320,
            minHeight: 240,
            title: "Car Game",
            webPreferences: {
                nodeIntegration: true
            }
        });

        // Load the index.html of the app.
        win.loadFile('wwwroot/index.html');

        // Main menu should only contain reload and close buttons.
        const menu = Menu.buildFromTemplate([
            { role: "reload", accelerator: "F5" },
            { role: "toggleDevTools", accelerator: "F12" },
            { role: "close" },
        ]);
        Menu.setApplicationMenu(menu);

        win.maximize();
        win.show();

        ipcMain.on("get-gameDataDir", (event: Electron.IpcMainEvent) => {
            event.sender.send("got-gameDataDir", gameDataDir);
        });

        ipcMain.on("require-file", (event: Electron.IpcMainEvent, filename: string) => {
            // Check ".." so files outside data directory aren't read.
            filename = decodeURI(filename);
            if (gameDataDir && (filename.indexOf("..") === -1)) {
                const file = join(gameDataDir, filename);
                if (existsSync(file)) {
                    if (!statSync(file).isFile()) {
                        event.sender.send("got-file", null);
                        return;
                    }

                    readFile(file, (err, data) => {
                        if (data) {
                            const result = new DataView(data);
                            event.sender.send("got-file", result);
                        } else {
                            event.sender.send("got-file", null);
                        }
                    })
                    return;
                }
            }

            event.sender.send("got-file", null);
        });
    }

    app.whenReady().then(createWindow);
} else {
    // No electron found. Create http server.
    const mimes: Record<string, string> = {
        ".html": "text/html",
        ".css": "text/css",
        ".js": "text/javascript",
        ".json": "application/json",
        ".png": "image/png",
        ".ico": "image/x-icon",
    };

    const port = process.env.port ?? 1337
    createServer((req: IncomingMessage, res: ServerResponse) => {
        let url = req.url === "/" ? "index.html" : decodeURI(req.url ?? "index.html");
        // Check ".." so files outside data directory aren't read.
        if ((!gameDataDir) || (url.indexOf("..") > -1)) {
            res.writeHead(404);
            res.end();
            return;
        }

        let dir = join(__dirname, "wwwroot");
        if (url.indexOf("/data/") === 0) {
            dir = gameDataDir;
            url = url.substring(5);
        }

        let fileExt = extname(url);
        let mimeType = mimes[fileExt] ?? "application/octet-stream";
        const fullPath = join(dir, url);
        if (!existsSync(fullPath)) {
            res.writeHead(404);
            res.end();
            return;
        }

        if (!statSync(fullPath).isFile()) {
            res.writeHead(404);
            res.end();
            return;
        }

        res.writeHead(200, { "Content-Type": mimeType });
        createReadStream(fullPath).pipe(res);
    }).listen(port);
    console.log(`Running HTTP server on port ${port}...`)
}