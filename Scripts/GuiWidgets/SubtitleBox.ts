import Entity from "../Entity";
import Game from "../Game";
import { IRenderer } from "../Rendering/WebGlCityRenderer";
import Style from "../DataReaders/Style";
import Font from "../DataReaders/Font";
import { ITextBuffer } from "../Rendering/TextBuffer";

export default class SubtitleBox extends Entity {
    private readonly subtitleTextBuffer: ITextBuffer;

    constructor(game: Game, renderer: IRenderer, style: Style, font: Font) {
        super(game, renderer, style, 0, 0, 0, 0);

        this.subtitleTextBuffer = renderer.createTextBuffer(64, 0, 1000, 1000, font, { verticalAlign: "bottom", wordWrap: true });
    }

    public setText(text: string) {
        this.subtitleTextBuffer.setText(text);
    }

    public render() {
        this.renderer.render(this.subtitleTextBuffer);
    }

    public setLocation(width: number, height: number) {
        this.subtitleTextBuffer.setLocation(64, height - 200, width - 64, 200);
    }
}