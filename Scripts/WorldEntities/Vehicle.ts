import Entity from "../Entity";
import Style, { ICarInfo } from "../DataReaders/Style";
import { IRenderer } from "../Rendering/WebGlRenderer";
import Character from "./Character";
import Game from "../Game";

/** Cars, trains, etc. */
export default class Vehicle extends Entity {
    private speedChanging = false;

    constructor(game: Game, renderer: IRenderer, style: Style, x: number, y: number, z: number, rotation: number, info: ICarInfo) {
        super(game, renderer, style, info.sprNum + style.spriteOffsets.Car, x, y, z);
        this.rotation = rotation;
        this.currentSpeed = 0;
        this.info = info;
    }

    public do(command: VehicleCommand, time: number) {
        switch (command) {
            case "accelerate":
                this.currentSpeed += time * 1;
                this.speedChanging = true;
                if (this.currentSpeed > this.info.maxSpeed) {
                    this.currentSpeed = this.info.maxSpeed;
                }

                break;
            case "decelerate":
                this.currentSpeed -= time * 1;
                this.speedChanging = true;
                break;
            case "turnLeft":
                this.rotation += time * this.currentSpeed;
                break;
            case "turnRight":
                this.rotation -= time * this.currentSpeed;
                break;
        }
    }

    public update(time: number) {
        if (this.currentSpeed !== 0) {
            const newX = this.x + Math.sin(this.rotation) * this.currentSpeed;
            const newY = this.y + Math.cos(this.rotation) * this.currentSpeed;
            if (!this.hitTest(newX, newY, this.z)) {
                this.x = newX;
                this.y = newY;
            } else {
                this.currentSpeed = 0;
            }

            if (!this.speedChanging) {
                this.currentSpeed *= 1 - time;
                if (Math.abs(this.currentSpeed) < 0.01) {
                    this.currentSpeed = 0;
                }
            }
        }

        this.speedChanging = false;
    }

    public currentSpeed: number;
    public info: ICarInfo;
    public charactersInVehicle: Character[] = [];

    public hitTest(x: number, y: number, z: number): boolean {
        const tileX = Math.floor(x / 64);
        const tileY = Math.floor(y / 64);
        const tileZ = Math.floor(z / 64);
        const block = this.game.map.blocks[tileX][tileY][tileZ - 1];
        if ((block != null) && !block.flat) {
            return block.type === 5;
        }

        return false;
    }
}

type VehicleCommand = "accelerate" | "decelerate" | "turnLeft" | "turnRight";