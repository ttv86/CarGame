import Entity from "../Entity";
import { IRenderer } from "../Rendering/WebGlRenderer";
import Style from "../DataReaders/Style";
import Vehicle from "./Vehicle";
import Game from "../Game";

const walkSpeed = 1; // 1 tile per second.
const turnSpeed = 1; // 1 radian (~57.3deg) per second.

/** People in game world. Player, police, pedestrians, etc... */
export default class Character extends Entity {
    constructor(game: Game, renderer: IRenderer, style: Style, x: number, y: number, z: number, facing: number) {
        super(game, renderer, style, 645, x, y, z);
        this.facing = facing;
    }

    public facing: number;

    public state: CharacterState = CharacterState.OnFoot;

    /** When player is in a vehicle, this contains reference to vehicle player is in. When player is not in a vehicle, this contains null. */
    public vehicle: Vehicle | null = null;

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

    public enterVehicle(vehicle: Vehicle) {
        if (!this.vehicle) {
            this.vehicle = vehicle;
            this.vehicle.charactersInVehicle.push(this);
            this.visible = false;
        }
    }

    public leaveVehicle() {
        if (this.vehicle) {
            const index = this.vehicle.charactersInVehicle.indexOf(this);
            if (index > -1) {
                this.vehicle.charactersInVehicle.splice(index, 1);
            }

            this.vehicle = null;
            this.visible = true;
        }
    }
}

export enum CharacterState {
    OnFoot,
    Driving,
    Falling,
}