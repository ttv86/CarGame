import Entity from "../Entity";
import { IRenderer } from "../Rendering/WebGlRenderer";
import Style from "../DataReaders/Style";
import Font from "../DataReaders/Font";
import Sprite from "../Sprite";
import { ITextBuffer } from "../Rendering/TextBuffer";

export default class LocationInfo extends Entity {
    private rightSide: Sprite;
    private time: number = 0;
    private textBuffer: ITextBuffer;

    constructor(renderer: IRenderer, style: Style, font: Font) {
        super(renderer, style, 25, 0, 0, 0);
        this.rightSide = new Sprite(renderer, style, 26, 220, 0);
        this.textBuffer = renderer.createTextBuffer(0, 0, 440, 30, font, "middle", "middle");
    }

    public update(time: number) {
        if (this.time > 0) {
            this.time -= time;
        } else {
            this.time = 0;
            this.visible = false;
        }
    }

    public render() {
        super.render();
        this.renderer.render(this.rightSide);
        this.renderer.render(this.textBuffer);
    }

    public showText(text: string) {
        if (text) {
            this.textBuffer.setText(text);
            this.time = 10;
            this.visible = true;
        } else {
            this.time = 0;
            this.visible = false;
        }
    }
}