import Entity from "../Entity";
import { IStyle, IVehicleInfo } from "../DataReaders/Interfaces";
import { IRenderer } from "../Rendering/WebGlCityRenderer";
import Character from "./Character";
import Game from "../Game";

const maxWheelAngle = 0.5;

/** Cars, trains, etc. */
export default class Vehicle extends Entity {
    private speedChanging = false;
    private turning = false;
    private wheelAngle = 0;

    constructor(game: Game, renderer: IRenderer, style: IStyle, x: number, y: number, z: number, rotation: number, info: IVehicleInfo) {
        super(game, renderer, style, 0, x, y, z);
        throw new Error("Not implemented");
        //super(game, renderer, style, info.sprNum + style.spriteOffsets.Car, x, y, z);
        //this.rotation = rotation;
        //this.currentSpeed = 0;
        //this.info = info;
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
                this.wheelAngle = maxWheelAngle; // Math.min(this.wheelAngle + time, maxWheelAngle);
                this.turning = true;
                break;
            case "turnRight":
                this.wheelAngle = -maxWheelAngle; // Math.max(this.wheelAngle - time, -maxWheelAngle);
                this.turning = true;
                break;
        }
    }

    public update(time: number) {
        const sin = Math.sin(this.rotation);
        const cos = Math.cos(this.rotation);
        if (this.currentSpeed !== 0) {
            let newX: number, newY: number;
            if (this.wheelAngle !== 0) {
                newX = this.x + sin * this.currentSpeed;
                newY = this.y + cos * this.currentSpeed;
                this.rotation += this.wheelAngle * time * this.currentSpeed;
            } else {
                newX = this.x + sin * this.currentSpeed;
                newY = this.y + cos * this.currentSpeed;
            }

            const xx = (cos * this.width / 2) + (sin * this.height / 2);
            const yy = (sin * this.width / 2) + (cos * this.height / 2 );

            if (!(this.hitTest(newX + xx, newY + yy, this.z) || this.hitTest(newX - xx, newY - yy, this.z) || this.hitTest(newX + xx, newY - yy, this.z) || this.hitTest(newX - xx, newY + yy, this.z))) {
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

            if (!this.turning) {
                //if (this.wheelAngle > 0) {
                //    this.wheelAngle = Math.max(0, this.wheelAngle - time);
                //} else {
                //    this.wheelAngle = Math.min(0, this.wheelAngle + time);
                //}
                this.wheelAngle = 0;
            }
        }

        this.speedChanging = false;
        this.turning = false;
    }

    public currentSpeed: number;
    public info: IVehicleInfo;
    public driver: Character | null = null;
    public charactersInVehicle: Character[] = [];

    public hitTest(x: number, y: number, z: number): boolean {
        //const tileX = Math.floor(x / 64);
        //const tileY = Math.floor(y / 64);
        //const tileZ = Math.floor(z / 64);
        //const block = this.game.map.getBlock(tileX, tileY, tileZ - 1);
        //if ((block != null) && !block.flat) {
        //    return block.type === 5;
        //}

        return false;
    }
}

type VehicleCommand = "accelerate" | "decelerate" | "turnLeft" | "turnRight";