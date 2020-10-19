import { IRenderer } from "./Rendering/WebGlCityRenderer";
import { IStyle, IGameMap, Collision } from "./DataReaders/Interfaces";
import Sprite from "./Sprite";
import Game from "./Game";
import Model from "./Rendering/Model";

/** Any physical object, such as character, car, etc in the game world. */
export default abstract class Entity {
    private rotationValue = 0;
    private boxX: number = 0;
    private boxY: number = 0;

    constructor(game: Game, width: number, height: number, depth: number) {
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.game = game;
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
    protected readonly game: Game;

    /** Angle in radiands. */
    public get rotation(): number {
        return this.rotationValue;
    }

    public set rotation(newValue: number) {
        this.rotationValue = newValue;
        const cos = Math.cos(newValue);
        const sin = Math.sin(newValue);
        this.boxX = (cos * (this.width / 2)) + (sin * (this.height / 2));
        this.boxY = (cos * (this.height / 2)) + (sin * (this.width / 2));
    }

    public update(time: number) {
    }

    public abstract getSpriteIndex(): number | null;

    /**
     * Tests if entity would collide to a map block given a new position.
     * @param map Map to test against.
     * @param x New x coordinate.
     * @param y New y coordinate.
     * @param z New z coordinate.
     */
    public hitTest(x: number, y: number, z: number): number {
        const tileX = Math.floor(x);
        const tileY = Math.floor(y);
        const tileZ = Math.ceil(z);

        const tileX1 = Math.floor(x - this.boxX);
        const tileX2 = Math.floor(x + this.boxX);
        const tileY1 = Math.floor(y - this.boxY);
        const tileY2 = Math.floor(y + this.boxX);

        const block = this.game.map.getBlock(tileX1, tileY1, tileZ);
        if (block != null) {
            if ((tileX !== tileX1) && block.left) {
                // Left wall
                if (block.left.collision !== Collision.NoCollision) {
                    return Number.MAX_VALUE; // No way there's way through.
                }
            }

            if ((tileX !== tileX2) && block.right) {
                // Right wall
                if (block.right.collision !== Collision.NoCollision) {
                    return Number.MAX_VALUE; // No way there's way through.
                }
            }

            if ((tileY !== tileY1) && block.top) {
                // Top wall
                if (block.top.collision !== Collision.NoCollision) {
                    return Number.MAX_VALUE; // No way there's way through.
                }
            }

            if ((tileY !== tileY2) && block.bottom) {
                // Bottom wall
                if (block.bottom.collision !== Collision.NoCollision) {
                    return Number.MAX_VALUE; // No way there's way through.
                }
            }

            //return Number.MAX_VALUE;
        }

        return 0;
    }
}