import WebGlCityRenderer from "./Rendering/WebGlCityRenderer";
import { IStyle } from "./DataReaders/Interfaces";

let gameDataDir: string | null = null;
function loadFile(filename: string): Promise<DataView> {
    return new Promise((resolve, reject) => {
        let request: Promise<ArrayBuffer>;
        if ((typeof electronBridge === "object") && electronBridge?.fetch) {
            request = electronBridge.fetch(filename)
        } else {
            request = fetch(`/${filename}`)
                .then(r => {
                    if (!r.ok) {
                        throw new Error(r.statusText);
                    }

                    return r.arrayBuffer();
                });
        }

        return request.then(ab => resolve(new DataView(ab)), (error) => reject(error));
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