import GameMap from "./DataReaders/GameMap";
import Style from "./DataReaders/Style";
import WebGlRenderer from "./Rendering/WebGlRenderer";
import Game from "./Game";
import Audio from "./DataReaders/Audio";
import decryptTexts from "./DataReaders/TextDecryptor";
import Font from "./DataReaders/Font";
import readMissions from "./DataReaders/MissionReader";

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

                ipcRenderer.on("got-gameDataDir", (_, arg: string) => {
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
            makeRequest(`/data/${filename}`);
        }
    });
}

// Start game engine
async function start() {
    const missionId = 1;
    try {
        const missions = readMissions(await loadFile("MISSION.INI"));

        const mission = missions.get(missionId);
        if (!mission) {
            throw new Error(`Can't find mission ${missionId}.`);
        }

        // Load needed data files
        const mapPromise = loadFile(mission.map.toUpperCase()).then(x => new GameMap(x));

        // Meanwhile map is loading, start loading other data files.
        const textsPromise = loadFile("ENGLISH.FXT").then(x => decryptTexts(x));
        const font1Promise = loadFile("SUB2.FON").then(x => new Font(x)); // Brief
        const font2Promise = loadFile("SCORE2.FON").then(x => new Font(x)); // Scores
        const font3Promise = loadFile("STREET2.FON").then(x => new Font(x)); // Locations
        const font4Promise = loadFile("MISSMUL2.FON").then(x => new Font(x)); // Lives & multipliers
        const font5Promise = loadFile("PAGER2.FON").then(x => new Font(x)); // Pager
        const audio1Promise = Promise.all([loadFile("AUDIO/VOCALCOM.SDT"), loadFile("AUDIO/VOCALCOM.RAW")]).then(([index, data]) => new Audio(index, data, false));

        // Wait here until map is loaded, we need information from it to load correct style and city-audio files.
        const map = await mapPromise;
        const levelNumber = map.style.toString().padStart(3, "0");
        const stylePromise = loadFile(`style${levelNumber}.g24`).then(x => new Style(x));
        const audio2Promise = Promise.all([loadFile(`AUDIO/LEVEL${levelNumber}.SDT`), loadFile(`AUDIO/LEVEL${levelNumber}.RAW`)]).then(([index, data]) => new Audio(index, data, false));

        // Wait here global data files.
        const [texts, font1, font2, font3, font4, font5, audio1] = await Promise.all([textsPromise, font1Promise, font2Promise, font3Promise, font4Promise, font5Promise, audio1Promise]);

        // Wait here city-specific data files.
        const [style, audio2] = await Promise.all([stylePromise, audio2Promise]);

        const canvas = document.createElement("canvas");
        canvas.style.width = "100vw";
        canvas.style.height = "100vh";
        document.body.appendChild(canvas);
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const renderer = new WebGlRenderer(canvas);
        renderer.buildCityModel(map, style);
        const game = new Game(map, style, mission, texts, renderer, font1, font2, font3, font4, font5);

        window.addEventListener("keydown", (ev) => game.keyDown(ev.keyCode));
        window.addEventListener("keyup", (ev) => game.keyUp(ev.keyCode));

        window.addEventListener("resize", () => { renderer.resized(); game.resized(); });

        let prev = 0;
        function step(time: number) {
            // First update game logic. (Move cars, people, bullets, animation, etc...)
            game.update((time - prev) / 1000);

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