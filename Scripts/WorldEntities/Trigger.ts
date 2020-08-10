import Entity from "../Entity";
import Game from "../Game";
import { IRenderer } from "../Rendering/WebGlRenderer";
import Style from "../DataReaders/Style";

/** Trigger can have a callback that is called, when user is within the trigger area. */
export default class Trigger extends Entity {
    private callbacks: (() => void)[] = [];
    private readonly x1: number;
    private readonly x2: number;
    private readonly y1: number;
    private readonly y2: number;

    constructor(game: Game, renderer: IRenderer, style: Style, x: number, y: number, z: number, size: number) {
        super(game, renderer, style, 0, x, y, z);
        const halfSize = 32 + size;
        this.x1 = x - halfSize;
        this.x2 = x + halfSize;
        this.y1 = y - halfSize;
        this.y2 = y + halfSize;
        this.size = size;
    }

    public readonly size: number;
    public disabled: boolean = false;

    public test(x: number, y: number, z: number): boolean {
        return (!this.disabled) && (x >= this.x1) && (x <= this.x2) && (y >= this.y1) && (y <= this.y2);
    }

    public addCallback(callback: () => void): void {
        this.callbacks.push(callback);
    }

    public execute(): void {
        for (const callback of this.callbacks) {
            callback();
        }
    }
}