/*
import { IFont, ITextContainer } from "./DataReaders/Interfaces";
import WebGlMainMenuRenderer from "./MainMenu/WebGlMainMenuRenderer";
import Model from "./Rendering/Model";
import { ITextBuffer } from "./Rendering/TextBuffer";

const frameTime = 1 / 10;

export default class MainMenu {
    private data: MenuData;
    private renderer: WebGlMainMenuRenderer;
    private bgModel: Model;
    private bgWithMapModel: Model;
    private titleAnimation: Model[];
    private frame: number = 0;
    private time: number = 0;
    private playText: ITextBuffer;
    private key: ITextBuffer;

    constructor(canvas: HTMLCanvasElement, data: MenuData) {
        this.renderer = new WebGlMainMenuRenderer(canvas);
        this.titleAnimation = data.titleAnimation.map(x => this.renderer.createModelFromImageData(x));
        this.bgModel = this.renderer.createModelFromImageData(data.backgroundWithoutMap);
        this.bgModel.center.y = 168;
        this.bgWithMapModel = this.renderer.createModelFromImageData(data.backgroundWithMap);
        this.bgWithMapModel.center.y = 168;
        this.data = data;
        this.playText = this.renderer.createTextBuffer(200, 200, 200, 200, data.bigFont);
        this.playText.setText(`${data.texts.get("Play")}\n${data.texts.get("GatherNetwork")}\n${data.texts.get("JoinNetwork")}\n${data.texts.get("Options")}`);
        this.key = this.renderer.createTextBuffer(100, 180, 100, 100, data.keyFont);
    }

    public resized() {
        this.renderer.resized();
    }

    public keyUp(keyCode: number) {

    }

    public keyDown(keyCode: number) {

    }

    public update(time: number) {
        this.time += time;
        while (this.time > frameTime) {
            this.time -= frameTime;
            this.frame++;

            this.key.setText(String.fromCharCode(33 + (this.frame % this.data.keyFont.charCount)));
        }
    }

    public render() {
        this.renderer.initRender();
        this.renderer.render(this.bgModel);
        this.renderer.render(this.titleAnimation[this.frame % this.titleAnimation.length]);
        this.renderer.render(this.playText);
        this.renderer.render(this.key);
    }
}

export interface MenuData {
    readonly titleAnimation: readonly ImageData[]
    readonly backgroundWithMap: ImageData;
    readonly backgroundWithoutMap: ImageData;
    readonly playerImages: readonly ImageData[];
    readonly playerNameBox: ImageData;
    readonly bigFont: IFont;
    readonly midFont: IFont;
    readonly smallFont: IFont;
    readonly keyFont: IFont;
    readonly texts: ITextContainer;
}

export function loadRawImage(data: DataView, width: number) {
    const height = Math.floor(data.byteLength / width / 3);
    const imageData: ImageData = new ImageData(width, height);
    const byteLength = width * height * 3;
    for (let i = 0, j = 0; i < byteLength; i += 3, j += 4) {
        imageData.data[j + 0] = data.getUint8(i + 0);
        imageData.data[j + 1] = data.getUint8(i + 1);
        imageData.data[j + 2] = data.getUint8(i + 2);
        imageData.data[j + 3] = 255;
    }

    return imageData;
}*/