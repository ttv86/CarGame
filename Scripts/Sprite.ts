import { IRenderer } from "./Rendering/WebGlCityRenderer";
import { IStyle } from "./DataReaders/Interfaces";
import Model from "./Rendering/Model";

export default class Sprite {
    public readonly renderer: IRenderer;
    public readonly width: number;
    public readonly height: number;
    public readonly model: Model | null;

    constructor(renderer: IRenderer, style: IStyle, spriteIndex: number) {
        this.renderer = renderer;

        const position = style.getSpritePosition(spriteIndex);
        if (!position) {
            // Invalid sprite. Can't draw anything.
            this.width = 0;
            this.height = 0;
            this.model = null;
            return;
        }

        this.width = position.width;
        this.height = position.height;
        this.model = renderer.createModelFromSprite(position, style.spriteImageData);
    }

    public render() {
        if (this.model) {
            this.renderer.render(this.model);
        }
    }
}