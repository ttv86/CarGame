import { BinaryReader } from "../BinaryReader";
import { IStyle, ITileInfo, IVehicleInfo, VehicleType, ISpriteLocation, ITextureLocation, LightLevel } from "../Interfaces";
import GameMap from "./GameMap";

const margin = 2;
const tileSize = 64;
const tileSizeWithMargin = tileSize + margin + margin;
const tileTextureSize = 80 * 40; // NOTE: should this be square of 2?
const tilesPerRow = Math.floor(tileTextureSize / tileSizeWithMargin);

export default class Style implements IStyle {
    private spriteInfo = new Map<number, ISpriteLocation>();

    constructor(data: DataView) {
        const reader = new BinaryReader(data);

        // Header
        const version = reader.readInt32();
        const sideSize = reader.readInt32();
        const lidSize = reader.readInt32();
        const auxSize = reader.readInt32();
        const animSize = reader.readInt32();
        const clutSize = reader.readInt32();
        const tileClutSize = reader.readInt32();
        const spriteClutSize = reader.readInt32();
        const newCarClutSize = reader.readInt32();
        const fontClutSize = reader.readInt32();
        const paletteIndexSize = reader.readInt32();
        const objectInfoSize = reader.readInt32();
        const carSize = reader.readInt32();
        const spriteInfoSize = reader.readInt32();
        const spriteGraphicsSize = reader.readInt32();
        const spriteNumbersSize = reader.readInt32();

        // Read counts first, so we can adjust sprite offsets.
        reader.position = reader.length - spriteNumbersSize;
        this.readSpriteNumbers(reader);
        reader.position = 64;

        // Tiles
        const tileSize = sideSize + lidSize + auxSize;
        this.sideTiles = sideSize >> 12;
        this.lidTiles = lidSize >> 12;
        this.auxTiles = auxSize >> 12;
        const tileData = reader.readBytes(tileSize);

        if (tileSize % 0x4000 != 0) {
            reader.position += 0x4000 - (tileSize % 0x4000); // Pad tiles to next 16K
        }

        // Animations
        this.animationInfos = this.readAnimations(reader, animSize);

        // Palette
        const paletteData = reader.readBytes(clutSize);
        if (clutSize % 0x10000 != 0) {
            reader.position += 0x10000 - (clutSize % 0x10000); // Pad palette to next 64K
        }

        const paletteIndexData = reader.readBytes(paletteIndexSize);
        const paletteContainer = new PaletteContainer(tileClutSize >> 10);
        paletteContainer.readPalettes(paletteData);
        paletteContainer.readIndex(paletteIndexData);

        // Object infos
        this.objectInfos = this.readObjectInfo(reader, objectInfoSize);

        // Car infos
        this.carInfos = this.readCarInfo(reader, carSize);

        // Sprites
        const spriteInfo = this.readSpriteInfo(reader, spriteInfoSize);
        const spriteGraphics = reader.readBytes(spriteGraphicsSize);

        this.spriteImageData = this.generateSprites(spriteGraphics, spriteInfo, paletteContainer);
        this.tileImageData = this.generateTiles(tileData, this.sideTiles, this.lidTiles, this.auxTiles, paletteContainer);
    }

    public readonly sideTiles: number;

    public readonly lidTiles: number;

    public readonly auxTiles: number;

    public readonly spriteOffsets: Record<SpriteType, number> = {} as Record<SpriteType, number>;

    public readonly tiles: ImageData[] = [];

    public readonly carInfos: readonly ICarInfo[] = [];

    public readonly objectInfos: readonly IObjectInfo[] = [];

    public readonly animationInfos: readonly IAnimationInfo[] = [];

    public getSpritePosition(spriteIndex: number): ISpriteLocation | null {
        return this.spriteInfo.get(spriteIndex) ?? null;
    }

    public readonly tileImageData: HTMLCanvasElement;
    public readonly spriteImageData: HTMLCanvasElement;

    public getVehicleInfo(model: number): IVehicleInfo {
        return null!;
    }

    public getVehicleModelByType(type: VehicleType): number | null {
        return null;
    }

    public getLidTileTexCoords(lid: ITileInfo): ITextureLocation {
        const tileIndex = (this.sideTiles + lid.tileIndex) * 4 + (lid.lightLevel ?? LightLevel.Normal);
        const x = ((tileIndex % tilesPerRow) * tileSizeWithMargin + margin) / tileTextureSize;
        const y = (Math.floor(tileIndex / tilesPerRow) * tileSizeWithMargin + margin) / tileTextureSize;

        return { tX: x, tY: y, tW: tileSize / tileTextureSize, tH: tileSize / tileTextureSize };
    }

    public getSideTileTexCoords(wall: ITileInfo): ITextureLocation {
        const tileIndex = wall.tileIndex * 4;
        const x = ((tileIndex % tilesPerRow) * tileSizeWithMargin + margin) / tileTextureSize;
        const y = (Math.floor(tileIndex / tilesPerRow) * tileSizeWithMargin + margin) / tileTextureSize;

        return { tX: x, tY: y, tW: tileSize / tileTextureSize, tH: tileSize / tileTextureSize };
    }

    private readAnimations(reader: BinaryReader, animSize: number): readonly IAnimationInfo[] {
        const result: IAnimationInfo[] = [];
        const end = reader.position + animSize;
        const count = reader.readUint8();
        for (let i = 0; i < count; i++) {
            const block = reader.readUint8();
            const which = reader.readUint8();
            const speed = reader.readUint8();
            const frame_count = reader.readUint8();
            const frames = reader.readBytes(frame_count);
            result.push({ block, which, speed, frames });
        }

        reader.position = end;
        return result;
    }

    private readObjectInfo(reader: BinaryReader, objectInfoSize: number): readonly IObjectInfo[] {
        const result: IObjectInfo[] = [];
        const end = reader.position + objectInfoSize;
        while (reader.position < end) {
            var width = reader.readInt32();
            var height = reader.readInt32();
            var depth = reader.readInt32();
            var spriteNumber = reader.readUint16(); // + spriteOffset;
            var weight = reader.readUint16();
            var aux = reader.readUint16();
            var status = reader.readUint8();
            var numInto = reader.readUint8();
            var into = reader.readBytes(numInto * 2);
            result.push({width, height, depth, spriteNumber, weight, aux, status, into});
        }

        return result;
    }

    private readCarInfo(reader: BinaryReader, carSize: number): readonly ICarInfo[] {
        const result: ICarInfo[] = [];
        const end = reader.position + carSize;
        while (reader.position < end) {
            const width = reader.readUint16();
            const height = reader.readUint16();
            const depth = reader.readUint16();
            const sprNum = reader.readUint16();
            const weight = reader.readInt16();
            const maxSpeed = reader.readInt16();
            const minSpeed = reader.readInt16();
            const acceleration = reader.readInt16();
            const braking = reader.readInt16();
            const grip = reader.readInt16();
            const handling = reader.readInt16();
            const remap24: IHslInfo[] = [];
            for (let i = 0; i < 12; i++) {
                const h = reader.readInt16();
                const s = reader.readInt16();
                const l = reader.readInt16();
                remap24.push({ hue: h, saturation: s, lightness: l });
            }

            const remap8 = reader.readBytes(12); // No need. Can be skipped.
            const vtype = reader.readUint8();
            const model = reader.readUint8();
            const turning = reader.readUint8();
            const damagable = reader.readUint8();
            const value = [ reader.readUint16(), reader.readUint16(), reader.readUint16(), reader.readUint16() ];
            const cx = reader.readInt8();
            const cy = reader.readInt8();
            const moment = reader.readInt32();
            const rbpMass = reader.readFixedFloat();
            const glThrust = reader.readFixedFloat();
            const tyreAdhesionX = reader.readFixedFloat();
            const tyreAdhesionY = reader.readFixedFloat();
            const handbrakeFriction = reader.readFixedFloat();
            const footbrakeFriction = reader.readFixedFloat();
            const frontBrakeBias = reader.readFixedFloat();
            const turnRatio = reader.readInt16();
            const driveWheelOffset = reader.readInt16();
            const steeringWheelOffset = reader.readInt16();
            const backEndSlideValue = reader.readFixedFloat();
            const handbrakeSlideValue = reader.readFixedFloat();
            const convertible = reader.readUint8();
            const engine = reader.readUint8();
            const radio = reader.readUint8();
            const horn = reader.readUint8();
            const soundFunction = reader.readUint8();
            const fastChangeFlag = reader.readUint8();
            const doorCount = reader.readInt16();
            const doors: IDoor[] = [];
            for (let i = 0; i < doorCount; i++) {
                const rpx = reader.readInt16();
                const rpy = reader.readInt16();
                const object = reader.readInt16();
                const delta = reader.readInt16();
                doors.push({ rpx, rpy, object, delta });
            }
            result.push({
                width,
                height,
                depth,
                sprNum,
                weight,
                maxSpeed,
                minSpeed,
                acceleration,
                braking,
                grip,
                handling,
                remap24,
                vtype,
                model,
                turning,
                damagable,
                value,
                cx,
                cy,
                moment,
                rbpMass,
                glThrust,
                tyreAdhesionX,
                tyreAdhesionY,
                handbrakeFriction,
                footbrakeFriction,
                frontBrakeBias,
                turnRatio,
                driveWheelOffset,
                steeringWheelOffset,
                backEndSlideValue,
                handbrakeSlideValue,
                convertible,
                engine,
                radio,
                horn,
                soundFunction,
                fastChangeFlag,
                doors,
            });
        }

        return result;
    }

    private readSpriteInfo(reader: BinaryReader, spriteInfoSize: number): readonly ISpriteInfo[] {
        const spriteInfos: ISpriteInfo[] = [];
        const end = reader.position + spriteInfoSize;
        while (reader.position < end) {
            const w = reader.readUint8();
            const h = reader.readUint8();
            const deltaCount = reader.readUint8();
            const ws = reader.readUint8();
            const size = reader.readUint16();
            const palette = reader.readUint16();
            const x = reader.readUint8();
            const y = reader.readUint8();
            const page = reader.readUint16();
            reader.readBytes(6 * deltaCount);
            spriteInfos.push({ w, h, deltaCount, ws, size, palette, x, y, page });
        }

        return spriteInfos;
    }

    private readSpriteNumbers(reader: BinaryReader) {
        let offset = 0;
        for (const spriteType of spriteTypes) {
            const count = reader.readUint16();
            this.spriteOffsets[spriteType] = offset;
            offset += count;
        }
    }

    private generateTiles(tileData: readonly number[], sideTileCount: number, lidTileCount: number, auxTileCount: number, paletteContainer: PaletteContainer): HTMLCanvasElement {
        const bigTexture = document.createElement("canvas");
        bigTexture.width = tileTextureSize;
        bigTexture.height = tileTextureSize;
        const bigContext = bigTexture.getContext("2d");
        if (!bigContext) {
            throw new Error(":(");
        }

        bigContext.imageSmoothingEnabled = false;
        bigContext.fillStyle = "rgb(0,0,0,0.0)";
        bigContext.fillRect(0, 0, tileTextureSize, tileTextureSize);

        const tiles = tileData.length >> 12;
        const remapTiles = ((sideTileCount + lidTileCount + auxTileCount) * 4);
        const imageDataList: Uint8ClampedArray[] = [];
        for (let i = 0; i < remapTiles; i++) {
            imageDataList.push(new Uint8ClampedArray(0x4000)); // Each tile is 64 pixels * 64 pixels * 4 colors.            
        }

        const rows = tileData.length >> 8;
        let pos = 0;
        for (let dataY = 0; dataY < rows; dataY++) {
            for (let dataX = 0; dataX < 256; dataX++) {
                const tile = (dataX >> 6) + ((dataY >> 6) << 2);
                if (tile < tiles) {
                    const x = dataX % 64;
                    const y = dataY % 64;
                    const tileIndex = tile * 4;
                    for (let r = 0; r < 4; r++) {
                        const palette = paletteContainer.getTilePalette(tile, r);
                        const color = palette[tileData[pos]];
                        const imageData = imageDataList[tileIndex + r];
                        const pixelIndex = (y << 8) + (x << 2);
                        imageData[pixelIndex + 0] = color.r;
                        imageData[pixelIndex + 1] = color.g;
                        imageData[pixelIndex + 2] = color.b;
                        imageData[pixelIndex + 3] = color.a;
                    }

                    pos++;
                }
            }
        }

        let i = 0;
        for (const imageData of imageDataList) {
            const data = new ImageData(imageData, tileSize);
            const x = (i % tilesPerRow) * tileSizeWithMargin + margin;
            const y = Math.floor(i / tilesPerRow) * tileSizeWithMargin + margin;
            bigContext.putImageData(data, x, y);

            if (margin > 0) {
                // Add some similar content around texture, so image smoothing doesn't mess with edges.
                bigContext.drawImage(bigTexture,
                    x, y, tileSize, 1,
                    x - margin, y - margin, tileSize + margin + margin, margin);
                bigContext.drawImage(bigTexture,
                    x, y, 1, tileSize,
                    x - margin, y, margin, tileSize);

                bigContext.drawImage(bigTexture,
                    x, y + tileSize - 1, tileSize, 1,
                    x - margin, y + tileSize, tileSize + margin + margin, margin);
                bigContext.drawImage(bigTexture,
                    x + tileSize - 1, y, 1, tileSize,
                    x + tileSize, y, margin, tileSize);
            }

            i++;
        }

        //let image = document.createElement("img");
        //image.src = bigTexture.toDataURL();
        //image.style.position = "fixed";
        //image.style.left = "0";
        //image.style.top = "0";
        ////image.style.height = "100vh";
        //image.style.height = `${tileTextureSize * 4}px`;
        //image.style.border = "1px solid black";
        //document.body.appendChild(image);

        return bigTexture;
    }

    private generateSprites(spriteData: readonly number[], spriteInfo: readonly ISpriteInfo[], paletteContainer: PaletteContainer): HTMLCanvasElement {
        const imageDataList: [number, number, HTMLCanvasElement][] = [];
        for (const sprite of spriteInfo) {
            const imageData = new Uint8ClampedArray(sprite.w * sprite.h * 4);

            for (let y = 0; y < sprite.h; y++) {
                for (let x = 0; x < sprite.w; x++) {
                    const c = spriteData[256 * ((sprite.page * 256) + sprite.y + y) + (sprite.x + x)];
                    const palette = paletteContainer.getSpritePalette(sprite.palette)[c];
                    imageData[(((y * sprite.w) + x) * 4) + 0] = palette.r;
                    imageData[(((y * sprite.w) + x) * 4) + 1] = palette.g;
                    imageData[(((y * sprite.w) + x) * 4) + 2] = palette.b;
                    imageData[(((y * sprite.w) + x) * 4) + 3] = palette.a;
                }
            }

            const canvas = document.createElement("canvas");
            canvas.width = sprite.w;
            canvas.height = sprite.h;
            const context = canvas.getContext("2d");
            if (!context) {
                throw new Error("Failed to get canvas rendering context while generating tiles.");
            }

            context.putImageData(new ImageData(imageData, sprite.w), 0, 0);
            imageDataList.push([imageDataList.length, sprite.h, canvas]);
        }

        imageDataList.sort((a, b) => a[1] - b[1]);
        const canvas = document.createElement("canvas");
        canvas.width = 2048;
        canvas.height = 2048;
        const context = canvas.getContext("2d");
        if (!context) {
            throw new Error("Failed to get canvas rendering context while generating tiles.");
        }

        //// Uncomment this to get purple opaque background for sprites. Good for debugging.
        //context.fillStyle = "rgb(255,0,255)";
        //context.fillRect(0, 0, 2048, 2048);

        let margin = 4;
        let x = margin;
        let y = margin;
        const limit = canvas.width - margin;
        for (const item of imageDataList) {
            const sprite = item[2];
            if (x + sprite.width >= limit) {
                y += sprite.height + margin;
                x = margin;
            }

            context.drawImage(sprite, x, y);
            this.spriteInfo.set(item[0], {
                tX: x / canvas.width,
                tY: y / canvas.height,
                tW: sprite.width / canvas.width,
                tH: sprite.height / canvas.height,
                width: sprite.width,
                height: sprite.height,
            });
            x += sprite.width + margin;
        }

        //const image = document.createElement("img");
        //image.src = canvas.toDataURL();
        //image.style.position = "fixed";
        //image.style.left = "0";
        //image.style.top = "0";
        ////image.style.width = "100vw";
        ////image.style.height = "100vh";
        //document.body.appendChild(image);

        return canvas;
    }

    ////private generateTileCanvas(map: GameMap) {
    ////    const bigTexture = document.createElement("canvas");
    ////    bigTexture.width = 2048;
    ////    bigTexture.height = 2048;
    ////    const bigContext = bigTexture.getContext("2d");
    ////    if (!bigContext) {
    ////        throw new Error(":(");
    ////    }

    ////    bigContext.fillStyle = "rgb(0,0,0,0.0)";
    ////    bigContext.fillRect(0, 0, 2048, 2048);

    ////    const tileIndexes = new Map<string, number>();
    ////    for (let x = 0; x < 256; x++) {
    ////        for (let y = 0; y < 256; y++) {
    ////            for (let z = 0; z < 6; z++) {
    ////                const block = map.getBlock(x, y, z);
    ////                if (block != null) {
    ////                    if (block.lid.tileIndex > 0) {
    ////                        const key = `L${block.lid}/${block.lid.lightLevel}`;
    ////                        if (!tileIndexes.has(key)) {
    ////                            tileIndexes.set(key, (this.sideTiles + block.lid.tileIndex) * 4 + block.lid.lightLevel);
    ////                        }
    ////                    }

    ////                    if (block.bottom.tileIndex > 0) {
    ////                        const key = `S${block.bottom}`;
    ////                        if (!tileIndexes.has(key)) {
    ////                            tileIndexes.set(key, block.bottom.tileIndex * 4);
    ////                        }
    ////                    }

    ////                    if (block.top.tileIndex > 0) {
    ////                        const key = `S${block.top}`;
    ////                        if (!tileIndexes.has(key)) {
    ////                            tileIndexes.set(key, block.top.tileIndex * 4);
    ////                        }
    ////                    }

    ////                    if (block.left.tileIndex > 0) {
    ////                        const key = `S${block.left}`;
    ////                        if (!tileIndexes.has(key)) {
    ////                            tileIndexes.set(key, block.left.tileIndex * 4);
    ////                        }
    ////                    }

    ////                    if (block.right.tileIndex > 0) {
    ////                        const key = `S${block.right}`;
    ////                        if (!tileIndexes.has(key)) {
    ////                            tileIndexes.set(key, block.right.tileIndex * 4);
    ////                        }
    ////                    }
    ////                }
    ////            }
    ////        }
    ////    }

    ////    const tilesPerRow = 20;
    ////    const multiplier = 2048 / tilesPerRow;
    ////    const margin = (multiplier - 64) / 2
    ////    const helperCanvas = document.createElement("canvas");
    ////    helperCanvas.width = 64;
    ////    helperCanvas.height = 64;
    ////    const helperContext = helperCanvas.getContext("2d")!;
    ////    const values = [...tileIndexes.values()];
    ////    for (let i = 0; i < values.length; i++) {
    ////        const imageData = this.tiles[values[i]];
    ////        helperContext.putImageData(imageData, 0, 0);
    ////        const x = margin + Math.floor(i % tilesPerRow) * multiplier;
    ////        const y = margin + Math.floor(i / tilesPerRow) * multiplier;
    ////        if (margin > 0) {
    ////            bigContext.drawImage(helperCanvas, 0, 0, 1, 1, x - margin, y - margin, margin, margin);
    ////            bigContext.drawImage(helperCanvas, 63, 0, 1, 1, x + 64, y - margin, margin, margin);
    ////            bigContext.drawImage(helperCanvas, 0, 63, 1, 1, x - margin, y + 64, margin, margin);
    ////            bigContext.drawImage(helperCanvas, 63, 63, 1, 1, x + 64, y + 64, margin, margin);

    ////            bigContext.drawImage(helperCanvas, 0, 0, 64, 1, x, y - margin, 64, margin);
    ////            bigContext.drawImage(helperCanvas, 0, 0, 1, 64, x - margin, y, margin, 64);
    ////            bigContext.drawImage(helperCanvas, 0, 63, 64, 1, x, y + 64, 64, margin + 1);
    ////            bigContext.drawImage(helperCanvas, 63, 0, 1, 64, x + 64, y, margin + 1, 64);
    ////        }

    ////        bigContext.drawImage(helperCanvas, x, y);
    ////    }

    ////    //const image = document.createElement("img");
    ////    //image.src = bigTexture.toDataURL();
    ////    //image.style.position = "fixed";
    ////    //image.style.left = "0";
    ////    //image.style.top = "0";
    ////    //image.style.height = "100vh";
    ////    //document.body.appendChild(image);
    ////}
}

class PaletteContainer {
    private tileIndexSize: number;
    private index: number[] = [];
    private palettes: {r: number, g: number, b: number, a: number}[][] = [];

    constructor(tileIndexSize: number) {
        this.tileIndexSize = tileIndexSize;
    }

    public readPalettes(data: number[]) {
        var paletteCount = data.length >> 10;
        var index = 0;
        while (this.palettes.length < paletteCount) {
            this.palettes.push([]);
        }

        var kMax = paletteCount >> 6;
        for (var k = 0; k < kMax; k++)
        {
            for (var j = 0; j < 256; j++)
            {
                for (var i = 0; i < 64; i++)
                {
                    var b = data[index + 0];
                    var g = data[index + 1];
                    var r = data[index + 2];
                    index += 4;
                    this.palettes[(k << 6) + i].push({ r, g, b, a: j == 0 ? 0 : 255 });
                }
            }
        }

        for (var j = 0; j < 256; j++)
        {
            for (var i = 0; i < (paletteCount % 64); i++)
            {
                var b = data[index + 0];
                var g = data[index + 1];
                var r = data[index + 2];
                index += 4;
                this.palettes[(kMax << 6) + i].push({ r, g, b, a: j == 0 ? 0 : 255 });
            }
        }
    }

    public readIndex(paletteIndexData: number[]) {
        const count = paletteIndexData.length >> 1;
        var pos = 0;
        for (var i = 0; i < count; i++) {
            var value = paletteIndexData[pos + 0] | (paletteIndexData[pos + 1] << 8);
            this.index.push(value);
            pos += 2;
        }
    }

    public getTilePalette(tileIndex: number, remap: number) {
        return this.palettes[this.index[(tileIndex << 2) + remap]];
    }

    public getSpritePalette(spriteIndex: number) {
        return this.palettes[this.index[this.tileIndexSize + spriteIndex]];
    }
}

export interface ICarInfo {
    width: number;
    height: number;
    depth: number;
    sprNum: number;
    weight: number;
    maxSpeed: number;
    minSpeed: number;
    acceleration: number;
    braking: number;
    grip: number;
    handling: number;
    remap24: readonly IHslInfo[]
    vtype: number;
    model: number;
    turning: number;
    damagable: number;
    value: readonly number[];
    cx: number;
    cy: number;
    moment: number;
    rbpMass: number;
    glThrust: number;
    tyreAdhesionX: number;
    tyreAdhesionY: number;
    handbrakeFriction: number;
    footbrakeFriction: number;
    frontBrakeBias: number;
    turnRatio: number;
    driveWheelOffset: number;
    steeringWheelOffset: number;
    backEndSlideValue: number;
    handbrakeSlideValue: number;
    convertible: number;
    engine: number;
    radio: number;
    horn: number;
    soundFunction: number;
    fastChangeFlag: number;
    doors: readonly IDoor[];
}

interface ISpriteInfo {
    w: number;
    h: number;
    ws: number;
    size: number;
    deltaCount: number;
    x: number;
    y: number;
    page: number;
    palette: number;
}

interface IDoor {
    rpx: number;
    rpy: number;
    object: number;
    delta: number;
}

interface IHslInfo {
    hue: number;
    saturation: number;
    lightness: number;
}

interface IAnimationInfo
{
    block: number;

    /** 0 - Side, 1 - Lid */
    which: number;

    /** Ticks per frame */
    speed: number;
    frames: number[];
}

interface IObjectInfo {
    width: number;
    height: number;
    depth: number;
    spriteNumber: number;
    weight: number;
    aux: number;
    status: number;
    into: readonly number[];
}

type SpriteType = "Arrow" | "Digits" | "Boat" | "Box" | "Bus" | "Car" | "Object" | "Ped" | "Speedo" | "Tank" | "TrafficLights" | "Train" | "TrDoors" | "Bike" | "Tram" | "WBus" | "WCar" | "Ex" | "TumCar" | "TumTruck" | "Ferry";
const spriteTypes: SpriteType[] = ["Arrow", "Digits", "Boat", "Box", "Bus", "Car", "Object", "Ped", "Speedo", "Tank", "TrafficLights", "Train", "TrDoors", "Bike", "Tram", "WBus", "WCar", "Ex", "TumCar", "TumTruck", "Ferry"];