import WebGlCityRenderer from "./Rendering/WebGlCityRenderer";
import { IStyle } from "./DataReaders/Interfaces";

let gameDataDir: string | null = null;
function loadFile(filename: string): Promise<DataView> {
    return new Promise((resolve, reject) => {
        function makeRequest(uri: string) {
            fetch(uri)
                .then(r => {
                    if (!r.ok) {
                        throw new Error(r.statusText);
                    }

                    return r.arrayBuffer();
                })
                .then(ab => resolve(new DataView(ab)), () => reject());
        }

        if (window.require) {
            // We are in electron app. Use ipc-interface to request file location.
            if (!gameDataDir) {
                const { ipcRenderer } = window.require("electron");

                ipcRenderer.on("got-gameDataDir", (event: never, arg: string) => {
                    if (arg) {
                        gameDataDir = arg;
                        if ((gameDataDir.substr(-1) !== "/") && (gameDataDir.substr(-1) !== "\\")) {
                            gameDataDir += "/";
                        }

                        makeRequest(gameDataDir + filename);
                    } else {
                        reject();
                    }
                });

                ipcRenderer.send("get-gameDataDir");
            } else {
                makeRequest(gameDataDir + filename);
            }
        } else {
            // We are in browser. Use fetch-interface to request files from the server.
            makeRequest(`/${filename}`);
        }
    });
}

async function startGame() {
    try {
        const canvas = document.createElement("canvas");
        canvas.style.width = "100vw";
        canvas.style.height = "100vh";
        document.body.appendChild(canvas);
        canvas.width = window.innerWidth * window.devicePixelRatio;
        canvas.height = window.innerHeight * window.devicePixelRatio;

        const rendererFactory = (style: IStyle) => new WebGlCityRenderer(canvas, style);
        //const game = await (await import("./DataReaders/G1/G1Game")).loadAndCreate(1, renderer, loadFile);
        //const game = await (await import("./DataReaders/G2/G2Game")).loadAndCreate("wil", rendererFactory, loadFile);
        const game = await (await import("./DataReaders/Ref/RefGame")).loadAndCreate(rendererFactory, loadFile);

        window.addEventListener("keydown", (ev) => game.keyDown(ev.keyCode));
        window.addEventListener("keyup", (ev) => game.keyUp(ev.keyCode));
        window.addEventListener("resize", () => game.resized());

        // Call resize event, so gui components are moved to right places.
        game.resized();

        // All is set. Run game logic initilization.
        game.initialize();

        let prev = 0;
        function step(time: number) {
            // First update game logic. (Move cars, people, bullets, animation, etc...)
            game.update((time - prev) / 1000);

            // Then render current state.
            game.renderer.renderScene();

            // Finally request next frame.
            prev = time;
            requestAnimationFrame(step);
        }

        step(prev);
    } catch (error) {
        console.error(error);
        alert(`Error happened: ${error?.message ?? error.toString}`);
    }
}

window.addEventListener("load", startGame);