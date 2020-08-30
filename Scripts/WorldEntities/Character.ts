import Entity from "../Entity";
import { IRenderer } from "../Rendering/WebGlCityRenderer";
import { IStyle } from "../DataReaders/Interfaces";
import Vehicle from "./Vehicle";
import Game from "../Game";

const walkSpeed = 64; // 1 tile per second.
const turnSpeed = Math.PI; // 3.14 radian (180deg) per second.

/** People in game world. Player, police, pedestrians, etc... */
export default class Character extends Entity {
    constructor(game: Game, renderer: IRenderer, style: IStyle, x: number, y: number, z: number, facing: number) {
        super(game, renderer, style, 743, x, y, z);
        this.rotation = facing;
    }

    public state: CharacterState = CharacterState.OnFoot;

    /** When player is in a vehicle, this contains reference to vehicle player is in. When player is not in a vehicle, this contains null. */
    public vehicle: Vehicle | null = null;

    public do(command: string, time: number) {
        switch (command) {
            case "walk":
                this.x += Math.sin(this.rotation) * time * walkSpeed;
                this.y += Math.cos(this.rotation) * time * walkSpeed;
                break;
            case "retreat":
                this.x -= Math.sin(this.rotation) * time * walkSpeed;
                this.y -= Math.cos(this.rotation) * time * walkSpeed;
                break;
            case "turnLeft":
                this.rotation += time * turnSpeed;
                break;
            case "turnRight":
                this.rotation -= time * turnSpeed;
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