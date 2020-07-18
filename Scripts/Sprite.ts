import { IRenderer } from "./Rendering/WebGlRenderer";
import Style from "./DataReaders/Style";
import Model from "./Rendering/Model";

export default class Sprite {
    public readonly renderer: IRenderer;
    public readonly width: number;
    public readonly height: number;
    public readonly model: Model | null;

    constructor(renderer: IRenderer, style: Style, spriteIndex: number, x: number = 0, y: number = 0) {
        this.renderer = renderer;

        const position = style.spritePosition(spriteIndex);
        if (!position) {
            // Invalid sprite. Can't draw anything.
            this.width = 0;
            this.height = 0;
            this.model = null;
            return;
        }

        this.width = position.width;
        this.height = position.height;
        this.model = renderer.createModelFromSprite(position, style.spriteCanvas, x, y);
    }

    public render() {
        if (this.model) {
            this.renderer.render(this.model);
        }
    }
}