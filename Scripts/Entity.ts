import { IRenderer } from "./Rendering/WebGlCityRenderer";
import { IStyle } from "./DataReaders/Interfaces";
import Sprite from "./Sprite";
import Game from "./Game";
import Model from "./Rendering/Model";

/** Any physical object, such as character, car, etc in the game world. */
export default abstract class Entity {
    constructor(width: number, height: number, depth: number) {
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.width = width;
        this.height = height;
        this.depth = depth;
        this.rotation = 0;
    }

    public x: number;
    public y: number;
    public z: number;
    public readonly width: number;
    public readonly height: number;
    public readonly depth: number;

    /** Angle in radiands. */
    public rotation: number;

    public update(time: number) {
    }

    public abstract getSpriteIndex(): number | null;
}