import Entity from "../Entity";
import { IRenderer } from "../Rendering/WebGlRenderer";
import Style from "../DataReaders/Style";

const walkSpeed = 1; // 1 tile per second.
const turnSpeed = 1; // 1 radian (~57.3deg) per second.

/** People in game world. Player, police, pedestrians, etc... */
export default class Character extends Entity {
    constructor(renderer: IRenderer, style: Style, x: number, y: number, z: number, facing: number) {
        super(renderer, style, 661, x, y, z);
        this.facing = facing;
    }

    public facing: number

    public do(command: string, time: number) {
        switch (command) {
            case "walk":
                this.x += Math.sin(this.facing) * time * walkSpeed;
                this.y += Math.cos(this.facing) * time * walkSpeed;
                break;
            case "retreat":
                this.x -= Math.sin(this.facing) * time * walkSpeed;
                this.y -= Math.cos(this.facing) * time * walkSpeed;
                break;
            case "turnLeft":
                this.facing += time * turnSpeed;
                break;
            case "turnRight":
                this.facing -= time * turnSpeed;
                break;
        }
    }
}