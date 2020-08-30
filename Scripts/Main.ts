import GameMap from "./DataReaders/G1/GameMap";
import Style from "./DataReaders/G1/Style";
import WebGlRenderer from "./Rendering/WebGlCityRenderer";
import Game from "./Game";
import Audio from "./DataReaders/G1/Audio";
import decryptTexts from "./DataReaders/G1/TextContainer";
import Font from "./DataReaders/G1/Font";
import readMissions from "./DataReaders/G1/MissionReader";
//import MainMenu, { loadRawImage } from "./MainMenu";
import TextContainer from "./DataReaders/G1/TextContainer";
import Mission from "./DataReaders/G1/Mission";

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

////// Start game engine
////async function startMenu() {
////    try {
////        const fontFiles = [
////            "F_MHEAD.FON",
////            "F_MTEXT.FON",
////            "F_MMISS.FON",

////            "F_KEY.FON",
////            "F_CITY1.FON",
////            "F_CITY2.FON",
////            "F_CITY3.FON",
////            "F_CITY4.FON",
////]
////        const imageFiles = [
////            {
////                "file": "F_LOGO0.RAW",
////                "width": 640
////            },
////            {
////                "file": "F_LOGO1.RAW",
////                "width": 640
////            },
////            {
////                "file": "F_LOGO2.RAW",
////                "width": 640
////            },
////            {
////                "file": "F_LOGO3.RAW",
////                "width": 640
////            },
////            {
////                "file": "F_LOGO4.RAW",
////                "width": 640
////            },
////            {
////                "file": "F_LOGO5.RAW",
////                "width": 640
////            },
////            {
////                "file": "F_LOGO6.RAW",
////                "width": 640
////            },
////            {
////                "file": "F_LOGO7.RAW",
////                "width": 640
////            },
////            {
////                "file": "F_LOWER0.RAW",
////                "width": 640
////            },
////            {
////                "file": "F_LOWER1.RAW",
////                "width": 640
////            },
////            {
////                "file": "F_PLAY1.RAW",
////                "width": 102
////            },
////            {
////                "file": "F_PLAY2.RAW",
////                "width": 102
////            },
////            {
////                "file": "F_PLAY3.RAW",
////                "width": 102
////            },
////            {
////                "file": "F_PLAY4.RAW",
////                "width": 102
////            },
////            {
////                "file": "F_PLAY5.RAW",
////                "width": 102
////            },
////            {
////                "file": "F_PLAY6.RAW",
////                "width": 102
////            },
////            {
////                "file": "F_PLAY7.RAW",
////                "width": 102
////            },
////            {
////                "file": "F_PLAY8.RAW",
////                "width": 102
////            },
////            {
////                "file": "F_PLAYN.RAW",
////                "width": 180
////            },
////            //{
////            //    "file": "F_UPPER.RAW",
////            //    "width": 640
////            //}
////        ];

////        // Start loading processes
////        const imagePromise = Promise.all(imageFiles.map(f => loadFile(f.file).then(x => loadRawImage(x, f.width))));
////        const fontPromise = Promise.all(fontFiles.map(f => loadFile(f).then(x => new Font(x))));
////        const textsPromise = loadFile("ENGLISH.FXT").then(x => new TextContainer(x));

////        // Wait here until both loading processes are finished.
////        const images = await imagePromise;
////        const fonts = await fontPromise;
////        const texts = await textsPromise;

////        const canvas = document.createElement("canvas");
////        canvas.style.width = "100vw";
////        canvas.style.height = "100vh";
////        document.body.appendChild(canvas);
////        canvas.width = window.innerWidth;
////        canvas.height = window.innerHeight;

////        const menu = new MainMenu(canvas, {
////            titleAnimation: [images[0], images[1], images[2], images[3], images[4], images[5], images[6], images[7]],
////            backgroundWithoutMap: images[8],
////            backgroundWithMap: images[9],
////            playerImages: [images[10], images[11], images[12], images[13], images[14], images[15], images[16], images[17]],
////            playerNameBox: images[18],
////            bigFont: fonts[0],
////            midFont: fonts[1],
////            smallFont: fonts[2],
////            keyFont: fonts[3],
////            texts
////        });

////        window.addEventListener("keydown", (ev) => menu.keyDown(ev.keyCode));
////        window.addEventListener("keyup", (ev) => menu.keyUp(ev.keyCode));

////        window.addEventListener("resize", () => menu.resized());

////        let prev = 0;
////        function step(time: number) {
////            // Update menu
////            menu.update((time - prev) / 1000);

////            // Then render current state.
////            menu.render();

////            // Finally request next frame.
////            prev = time;
////            requestAnimationFrame(step);
////        }

////        step(prev);
////    } catch (error) {
////        console.error(error);
////        alert(`Error happened: ${error?.message ?? error.toString}`);
////    }
////}

async function startGame() {
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
        const textsPromise = loadFile("ENGLISH.FXT").then(x => new TextContainer(x));
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

        texts.mapIndex = map.style;

        const renderer = new WebGlRenderer(canvas);
        renderer.buildCityModel(map, style);
        const game = new Game(map, style, new Mission(mission), texts, renderer, font1, font2, font3, font4, font5, audio1, audio2);

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

window.addEventListener("load", startGame);