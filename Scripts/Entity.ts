import { IRenderer } from "./Rendering/WebGlRenderer";
import Style from "./DataReaders/Style";
import Sprite from "./Sprite";

/** Any object, character, car, etc in the game world. */
export default class Entity extends Sprite {
    
    constructor(renderer: IRenderer, style: Style, spriteIndex: number, x: number, y: number, z: number) {
        super(renderer, style, spriteIndex);

        this.x = x;
        this.y = y;
        this.z = z;
        this.visible = true;
        this.rotation = 0;
        if (this.model) {
            this.model.center = this;
        }
    }

    public x: number;
    public y: number;
    public z: number;
    public visible: boolean;

    /** Angle in radiands. */
    public rotation: number;

    public update(time: number) {
    }
}