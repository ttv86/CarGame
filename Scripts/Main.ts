import GameMap from "./DataReaders/GameMap";
import Style from "./DataReaders/Style";
import WebGlRenderer from "./Rendering/WebGlRenderer";
import Game from "./Game";
import Audio from "./DataReaders/Audio";
import decryptTexts from "./DataReaders/TextDecryptor";
import Font from "./DataReaders/Font";

function loadFile(filename: string): Promise<DataView> {
    return new Promise((resolve, reject) => {
        if (window.require) {
            // We are in electron app. Use ipc-interface to request files from the server.
            const { ipcRenderer } = window.require("electron");

            ipcRenderer.on("got-file", (_, arg: DataView | null) => {
                if (arg) {
                    resolve(arg);
                } else {
                    reject();
                }
            });

            ipcRenderer.send("require-file", filename);
        } else {
            // We are in browser. Use fetch-interface to request files from the server.
            fetch(`/data/${filename}`)
                .then(r => {
                    if (!r.ok) {
                        throw new Error(r.statusText);
                    }

                    return r.arrayBuffer();
                })
                .then(ab => resolve(new DataView(ab)), () => reject());
        }
    });
}

// Start game engine
async function start() {
    try {
        // Load needed data files
        const mapPromise = loadFile("NYC.CMP").then(x => new GameMap(x));
        const textsPromise = loadFile("ENGLISH.FXT").then(x => decryptTexts(x));
        const font1Promise = loadFile("SUB2.FON").then(x => new Font(x)); // Brief
        const font2Promise = loadFile("SCORE2.FON").then(x => new Font(x)); // Scores
        const font3Promise = loadFile("STREET2.FON").then(x => new Font(x)); // Locations
        const font4Promise = loadFile("MISSMUL2.FON").then(x => new Font(x)); // Lives & multipliers
        const font5Promise = loadFile("PAGER2.FON").then(x => new Font(x)); // Lives & multipliers
        //const audio1Promise = Promise.all([loadFile("AUDIO/VOCALCOM.SDT"), loadFile("AUDIO/VOCALCOM.RAW")]).then(([index, data]) => new Audio(index, data, false));

        const map = await mapPromise;
        const levelNumber = map.style.toString().padStart(3, "0");
        const stylePromise = loadFile(`style${levelNumber}.g24`).then(x => new Style(x));
        //const audio2Promise = Promise.all([loadFile(`AUDIO/LEVEL${levelNumber}.SDT`), loadFile(`AUDIO/LEVEL${levelNumber}.RAW`)]).then(([index, data]) => new Audio(index, data, false));

        const texts = await textsPromise;
        const font1 = await font1Promise;
        const font2 = await font2Promise;
        const font3 = await font3Promise;
        const font4 = await font4Promise;
        const font5 = await font5Promise;
        const style = await stylePromise;
        //const audio1 = await audio1Promise;
        //const audio2 = await audio2Promise;

        const downKeys = new Set<number>();
        const canvas = document.createElement("canvas");
        canvas.style.width = "100vw";
        canvas.style.height = "100vh";
        document.body.appendChild(canvas);
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        window.addEventListener("keydown", (ev) => downKeys.add(ev.keyCode));
        window.addEventListener("keyup", (ev) => downKeys.delete(ev.keyCode));
        //window.addEventListener("keydown", (ev) => console.log(ev.keyCode));

        const renderer = new WebGlRenderer(canvas, font1, font2, font3, font4);
        renderer.buildCityModel(map, style);
        const game = new Game(map, style, texts, renderer, font1, font2, font3, font4);

        window.addEventListener("resize", () => { renderer.resized(); game.resized(); });

        let prev = 0;
        function step(time: number) {
            // First update game logic. (Move cars, people, bullets, animation, etc...)
            game.update((time - prev) / 1000, downKeys);

            // Then render current state.
            renderer.renderScene();

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

window.addEventListener("load", start);