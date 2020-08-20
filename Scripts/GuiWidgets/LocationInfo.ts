import Entity from "../Entity";
import { IRenderer } from "../Rendering/WebGlCityRenderer";
import Style from "../DataReaders/Style";
import Font from "../DataReaders/Font";
import Sprite from "../Sprite";
import { ITextBuffer } from "../Rendering/TextBuffer";
import Game from "../Game";

export default class LocationInfo extends Entity {
    private rightSide: Sprite;
    private time: number = 0;
    private textBuffer: ITextBuffer;

    constructor(game: Game, renderer: IRenderer, style: Style, font: Font) {
        super(game, renderer, style, 25, 0, 0, 0);
        this.rightSide = new Sprite(renderer, style, 26, 220, 0);
        this.textBuffer = renderer.createTextBuffer(0, 0, 440, 30, font, { horizontalAlign: "middle", verticalAlign: "middle" });
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
            this.time = 5;
            this.visible = true;
        } else {
            this.time = 0;
            this.visible = false;
        }
    }
}