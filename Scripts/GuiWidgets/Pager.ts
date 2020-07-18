import Style from "../DataReaders/Style";
import { IRenderer } from "../Rendering/WebGlRenderer";
import Entity from "../Entity";
import Sprite from "../Sprite";

export default class Pager extends Entity {
    private light: Sprite;
    private lightVisible: boolean = false;
    private time: number = 0;

    constructor(webGlRenderer: IRenderer, style: Style) {
        super(webGlRenderer, style, 28, 0, 0, 0);
        this.light = new Sprite(webGlRenderer, style, 29, 22, 38);
    }

    public update(time: number) {
        this.time += time;

        // Change blink status every half second.
        while (this.time > 0.5) {
            this.time -= 0.5;
            this.lightVisible = !this.lightVisible;
        }
    }

    public render() {
        super.render();
        if (this.lightVisible) {
            this.light.render();
        }
    }
}