import { IStyle, IFont } from "../DataReaders/Interfaces";
import { IRenderer } from "../Rendering/WebGlCityRenderer";
import Entity from "../Entity";
import Sprite from "../Sprite";
import { ITextBuffer } from "../Rendering/TextBuffer";
import Game from "../Game";

export default class Pager extends Entity {
    private light: Sprite;
    private lightVisible: boolean = false;
    private lightTime: number = 0;
    private textTime: number = 0;
    private textBuffer: ITextBuffer;
    private position: number = 0;
    private hideLimit: number = 0;

    constructor(game: Game, renderer: IRenderer, style: IStyle, font: IFont) {
        super(game, renderer, style, 28, 0, 0, 0);
        this.light = new Sprite(renderer, style, 29, 22, 38);
        this.textBuffer = renderer.createTextBuffer(22, 14, 116, 18, font, { verticalAlign: "middle", wordWrap: false });
        this.visible = false;
    }

    public setText(text: string) {
        this.position = 180;
        this.textBuffer.setText(text);
        const [width] = this.textBuffer.getDimensions();
        this.hideLimit = -width;
        this.visible = true;
    }

    public update(time: number) {
        if (!this.visible) {
            return;
        }

        this.lightTime += time;
        this.textTime += time;

        // Move text by 50 pixels per second
        while (this.textTime > 0.02) {
            this.textTime -= 0.02;
            this.position--;
            this.textBuffer.setLocation(this.position, 14, 116, 18);
            if (this.position <= this.hideLimit) {
                this.visible = false;
            }
        }

        // Change blink status every half second.
        while (this.lightTime > 0.5) {
            this.lightTime -= 0.5;
            this.lightVisible = !this.lightVisible;
        }
    }

    public render() {
        super.render();
        if (this.lightVisible) {
            this.renderer.render(this.light);
        }

        this.renderer.clip([22, 14, 116, 18]);
        this.renderer.render(this.textBuffer);
        this.renderer.clip(null);
    }
}