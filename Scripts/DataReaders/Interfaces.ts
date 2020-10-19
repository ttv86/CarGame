import Game from "../Game";

export interface IGameMap {
    readonly width: number;
    readonly height: number;
    readonly maxAltitude: number;
    readonly areas: readonly IArea[];
    readonly lights: readonly ILight[];
    getBlock(x: number, y: number, z: number): IBlock | null;
}

type Slope = number;

export interface IBlock {
    readonly top: ITileInfo | null;
    readonly bottom: ITileInfo | null;
    readonly left: ITileInfo | null;
    readonly right: ITileInfo | null;
    readonly lid: ITileInfo | null;
    readonly slope?: Slope;
}

export interface ILight {
    readonly color: { readonly r: number, readonly g: number, readonly b: number };
    readonly radius: number;
    readonly position: { readonly x: number, readonly y: number, readonly z: number };
    //intensity, shape, onTime, offTime
}

export interface ITileInfo {
    /** Index of texture from attached style file. This is applied to the "front" of the tile. */
    readonly tileIndex: number;

    /** Whether objects can go through this wall. */
    readonly collision: Collision;

    /** Index of texture from attached style file. This is applied to the "back" of the tile. */
    readonly backTileIndex?: number;

    /** Adjust tile light level. */
    readonly lightLevel?: LightLevel;

    /** Whether render texture as transparent instead of opaque. */
    readonly transparent?: boolean;

    /** Transformation of texture. */
    readonly transform?: TextureTransform;
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
    getSpritePosition(spriteIndex: number): ISpriteLocation | null;
    getVehicleInfo(model: number): IVehicleInfo;
    getVehicleModelByType(type: VehicleType): number | null;
    getLidTileTexCoords(lid: ITileInfo): ITextureLocation;
    getSideTileTexCoords(wall: ITileInfo): ITextureLocation;
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
    readonly fontImageData: HTMLImageElement | HTMLCanvasElement | ImageData;
    getTextInfo(text: string): { widths: readonly number[], textureCoords: readonly number[] };
}

export interface IGameScript {
    initialize(game: Game): void;
    update(time: number): void;
}

export interface ITextContainer {
    get(code: string, useFormating?: boolean): string | null;
}

export enum TextureTransform {
    NoTransform = 0,
    Rotate90deg = 1,
    Rotate180deg = 2,
    Rotate270deg = 3,
    Mirror = 4,
    Rotate90degAndMirror = 5,
    Rotate180degAndMirror = 6,
    Rotate270degAndMirror = 7,
}

export enum LightLevel {
    Normal = 0,
    Darken1 = 1,
    Darken2 = 2,
    Darken3 = 3,
}

export enum Collision {
    /** Everything can go through this. */
    NoCollision = 0,

    /** Vehicles collide, but smaller objects can go though. */
    VehicleCollision = 1,

    /** Characters and vehicles collide, but small objects can go through. */
    CharacterCollision = 2,

    /** Nothing can go through. */
    Solid = 3,
}

export interface ITextureLocation {
    /** Texture x. */
    tX: number;
    /** Texture y. */
    tY: number;
    /** Texture width. */
    tW: number;
    /** Texture height. */
    tH: number;
}

export interface ISpriteLocation extends ITextureLocation {
    /** Sprite width. */
    width: number;

    /** Sprite height. */
    height: number;
}