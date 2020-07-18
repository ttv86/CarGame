import Entity from "../Entity";
import Style, { ICarInfo } from "../DataReaders/Style";
import { IRenderer } from "../Rendering/WebGlRenderer";

/** Cars, trains, etc. */
export default class Vehicle extends Entity {
    constructor(renderer: IRenderer, style: Style, x: number, y: number, z: number, facing: number, info: ICarInfo) {
        super(renderer, style, info.sprNum + style.spriteOffsets.Car, x, y, z);
        this.facing = facing;
        this.currentSpeed = 0;
        this.info = info;
    }

    public facing: number
    public currentSpeed: number;
    public info: ICarInfo;
}