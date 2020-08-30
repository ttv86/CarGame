import Game from "../Game";
import { ITextureLocation } from "./G1/Style";

export interface IGameMap {
    readonly width: number;
    readonly height: number;
    readonly areas: readonly IArea[];
    readonly lights: readonly ILight[];
    getBlock(x: number, y: number, z: number): IBlock | null;
}

type Slope = number;

export interface IBlock {
    readonly top: IWall | null;
    readonly bottom: IWall | null;
    readonly left: IWall | null;
    readonly right: IWall | null;
    readonly lid: ILid | null;
    readonly slope: Slope;
}

export interface ILight {
    readonly color: { readonly r: number, readonly g: number, readonly b: number };
    readonly pos: { readonly x: number, readonly y: number, readonly z: number };
}

export interface IWall {
    /** Index of texture from attached style file. */
    readonly tileIndex: number;

    /** Whether player can walk through this wall. */
    readonly playerWall: boolean;

    /** Whether bullets can go through this wall. For example cahin link fence can be penetrated by bullets, but not players. */
    readonly bulletWall: boolean;

    /** Whether render texture as transparent instead of opaque. */
    readonly transparent: boolean;

    /** Texture should be flipped on this wall. */
    readonly flip: boolean;

    /** Rotation of texture. */
    readonly rotate: TextureRotate;
}

export interface ILid {
    /** Index of texture from attached style file. */
    readonly tileIndex: number;

    /** Adjust tile light level. */
    readonly lightLevel: LightLevel;

    /** Whether render texture as transparent instead of opaque. */
    readonly transparent: boolean;

    /** Texture should be flipped on this wall. */
    readonly flip: boolean;

    /** Rotation of texture. */
    readonly rotate: TextureRotate;
}

export interface IArea {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
    readonly name: string;
}

export type VehicleType = "car" | "police" | "ambulance" | "train" | "tank" | "boat" | "bike" | "bus";
export interface IStyle {
    readonly tileImageData: HTMLImageElement | HTMLCanvasElement | ImageData;
    readonly spriteImageData: HTMLImageElement | HTMLCanvasElement | ImageData;
    getVehicleInfo(model: number): IVehicleInfo;
    getVehicleModelByType(type: VehicleType): number | null;
    getLidTileTexCoords(lid: ILid): ITextureLocation;
    getSideTileTexCoords(wall: IWall): ITextureLocation;
}

export interface ISpriteLocation {
    readonly tX: number;
    readonly tY: number;
    readonly tW: number;
    readonly tH: number;
}

export interface IVehicleInfo {
    readonly type: VehicleType;

    /** Speed in ???. TODO!! */
    readonly maxSpeed: number;
}

export type AudioName =
    "north" | "east" | "west" | "south" | "north-west" | "north-east" | "south-west" | "south-east";

export interface IAudio {
    play(name: IArea): void;
    play(name: AudioName): void;
}

export interface IFont {
    readonly height: number;
    readonly fontImageData: ImageData;
    getTextInfo(text: string): { widths: readonly number[], textureCoords: readonly number[] };
}

export interface IGameScript {
    initialize(game: Game): void;
    update(time: number): void;
}

export type SpecialTextCode =
    // Main menu options
    "play" | "options" |

    // Directions
    "north" | "east" | "west" | "south" | "north-west" | "north-east" | "south-west" | "south-east";

export interface ITextContainer {
    getAreaName(area: IArea): string;
    get(code: string): string;
    getSpecial(code: SpecialTextCode): string;
}

export enum TextureRotate {
    NoRotate = 0,
    Rotate90deg = 1,
    Rotate180deg = 2,
    Rotate270deg = 3,
}

export enum LightLevel {
    Normal = 0,
    Darken1 = 1,
    Darken2 = 2,
    Darken3 = 3,
}