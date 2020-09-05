import GuiWidget from "../../GuiWidgets/GuiWidget";
import { IRenderer } from "../../Rendering/WebGlCityRenderer";
import { IStyle, ISpriteLocation } from "../Interfaces";
import Model from "../../Rendering/Model";

const margin = 2;
const frameTime = 1 / 10;
export default class HeadWidget extends GuiWidget {
    private readonly sprites: { model: Model, spriteLocation: ISpriteLocation }[];
    private readonly width: number;
    private readonly height: number;
    private spriteIndex: number;
    private count: number;
    private renderer: IRenderer;
    private time: number;

    constructor(style: IStyle, renderer: IRenderer, headSprites: readonly number[]) {
        let height = 0;
        let width = 0;
        const sprites: { model: Model, spriteLocation: ISpriteLocation }[] = [];
        let x = 0;
        for (const section of headSprites) {
            const spriteLocation = style.getSpritePosition(section);
            if (spriteLocation) {
                const model = renderer.createModelFromSprite(spriteLocation, style.spriteImageData);
                sprites.push({ model, spriteLocation });
                x += spriteLocation.width - 0.5;
                height = Math.max(height, spriteLocation.height);
                width = Math.max(width, spriteLocation.width + 2);
            }
        }

        super("top", height + margin + margin);
        this.count = 0;
        this.width = width;
        this.height = height;
        this.renderer = renderer;
        this.sprites = sprites;
        this.spriteIndex = 0;
        this.time = 0;
    }

    public render() {
        let x = this.area.x + (this.area.width / 2) - (this.count * this.width / 2);
        const model = this.sprites[this.spriteIndex].model;
        for (let i = 0; i < this.count; i++) {
            this.renderer.renderSprite(model, x + 1, this.area.y + margin);
            x += this.width;
        }
    }

    public update(time: number) {
        this.visible = this.count > 0;
        if (this.count === 0) {
            return;
        }

        this.time += time;
        while (this.time > frameTime) {
            this.spriteIndex++;
            this.time -= frameTime;
        }

        while (this.spriteIndex >= this.sprites.length) {
            this.spriteIndex -= this.sprites.length;
        }
    }

    public setNumber(count: number) {
        this.count = count;
    }
}