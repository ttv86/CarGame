import Entity from "../Entity";
import { IRenderer } from "../Rendering/WebGlCityRenderer";
import { IStyle } from "../DataReaders/Interfaces";
import Vehicle from "./Vehicle";
import Game from "../Game";

const frameTime = 1 / 10;
const walkSpeed = 2; // 1 tile per second.
const turnSpeed = Math.PI; // 3.14 radian (180deg) per second.

/** People in game world. Player, police, pedestrians, etc... */
export default class Character extends Entity {
    private animation: ICharacterAnimation;
    private time: number = 0;
    private animationFrame: number = 0;
    private currentAnimation: keyof ICharacterAnimation = "stand";
    private hadCommand: boolean = false;

    constructor(animation: ICharacterAnimation, x: number, y: number, z: number, facing: number) {
        super(13 / 64, 5 / 64, 1 / 64);
        this.x = x;
        this.y = y;
        this.z = z;
        this.animation = animation;
        this.rotation = facing;
        this.state = CharacterState.OnFoot;
        this.vehicle = null;
    }

    public state: CharacterState;

    /** When player is in a vehicle, this contains reference to vehicle player is in. When player is not in a vehicle, this contains null. */
    public vehicle: Vehicle | null;

    public do(command: string, time: number) {
        switch (command) {
            case "walk":
                this.x += Math.sin(this.rotation) * time * walkSpeed;
                this.y += Math.cos(this.rotation) * time * walkSpeed;
                this.hadCommand = true;
                if (this.currentAnimation !== "run") {
                    this.animationFrame = 0;
                    this.currentAnimation = "run";
                }
                break;
            case "retreat":
                this.x -= Math.sin(this.rotation) * time * walkSpeed;
                this.y -= Math.cos(this.rotation) * time * walkSpeed;
                this.hadCommand = true;
                break;
            case "turnLeft":
                this.rotation += time * turnSpeed;
                this.hadCommand = true;
                break;
            case "turnRight":
                this.rotation -= time * turnSpeed;
                this.hadCommand = true;
                break;
        }
    }

    public enterVehicle(vehicle: Vehicle) {
        if (!this.vehicle) {
            this.vehicle = vehicle;
            this.vehicle.charactersInVehicle.push(this);
            //this.visible = false;
        }
    }

    public leaveVehicle() {
        if (this.vehicle) {
            const index = this.vehicle.charactersInVehicle.indexOf(this);
            if (index > -1) {
                this.vehicle.charactersInVehicle.splice(index, 1);
            }

            this.vehicle = null;
            //this.visible = true;
        }
    }

    public getSpriteIndex() {
        return this.animation[this.currentAnimation][this.animationFrame];
    }

    public update(time: number) {
        if (!this.hadCommand) {
            if (this.currentAnimation !== "stand") {
                this.animationFrame = 0;
                this.currentAnimation = "stand";
            }
        }

        this.time += time;
        const animation = this.animation[this.currentAnimation];
        while (this.time > frameTime) {
            this.animationFrame = (this.animationFrame + 1) % animation.length;
            this.time -= frameTime;
        }

        this.hadCommand = false;
    }
}

export interface ICharacterAnimation {
    readonly stand: readonly number[];
    readonly walk: readonly number[];
    readonly run: readonly number[];
}

export enum CharacterState {
    OnFoot,
    Driving,
    Falling,
}