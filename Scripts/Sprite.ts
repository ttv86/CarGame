import { IRenderer } from "./Rendering/WebGlCityRenderer";
import { IStyle } from "./DataReaders/Interfaces";
import Model from "./Rendering/Model";

export default class Sprite {
    public readonly renderer: IRenderer;
    public readonly width: number;
    public readonly height: number;
    public readonly model: Model | null;

    constructor(renderer: IRenderer, style: IStyle, spriteIndex: number, x: number = 0, y: number = 0) {
        this.renderer = renderer;

        const position = null; // TODO: style.spritePosition(spriteIndex);
        //if (!position) {
            // Invalid sprite. Can't draw anything.
            this.width = 0;
            this.height = 0;
            this.model = null;
            return;
        //}

        //this.width = position.width;
        //this.height = position.height;
        //this.model = renderer.createModelFromSprite(position, style.spriteCanvas, x, y);
    }

    public render() {
        if (this.model) {
            this.renderer.render(this.model);
        }
    }
}