import { IStyle, IVehicleInfo, ILid, ITextureLocation, IWall, ISpriteLocation, VehicleType, IFont } from "../Interfaces";
import { BinaryReader } from "../BinaryReader";
import { TextChars } from "./TextContainer";

const margin = 2;
const tileSize = 64;
const tileSizeWithMargin = tileSize + margin + margin;
const tileTextureSize = 2400; // NOTE: should this be square of 2?
const tilesPerRow = Math.floor(tileTextureSize / tileSizeWithMargin);

export default class Style implements IStyle {
    private spriteInfo = new Map<number, ISpriteLocation>();
    private carInfo: ICarInfo[] = [];
    private mapObjects: IMapObject[] = [];
    private recycleCars: number[] = [];

    constructor(data: DataView) {
        const reader = new BinaryReader(data);
        const magic = reader.readString(4);
        const version = reader.readUint16();
        if ((magic !== "GBST") || (version !== 700)) {
            throw new Error("Invalid style file");
        }

        let tileData: Uint8ClampedArray | null = null;
        let spriteData: Uint8ClampedArray | null = null;
        const paletteBase = {
            tile: 0,
            sprite: 0,
            carRemap: 0,
            pedRemap: 0,
            codeObjRemap: 0,
            mapObjRemap: 0,
            userRemap: 0,
            fontRemap: 0,
        };
        const spriteBase = {
            car: 0,
            pedestrian: 0,
            codeObj: 0,
            mapObj: 0,
            user: 0,
            font: 0,
        };

        let physicalPalette: Uint8ClampedArray | null = null;
        const virtualPalette = [];
        const fontBase: number[] = [];
        const spriteInfo: ISpriteDataInfo[] = [];

        while (reader.position < reader.length) {
            const blockType = reader.readString(4);
            const blockSize = reader.readUint32();
            const end = reader.position + blockSize;
            let counter;
            switch (blockType) {
                case "TILE":
                    tileData = reader.readByteArray(blockSize);
                    break;
                case "SPRG":
                    spriteData = reader.readByteArray(blockSize);
                    break;
                case "PPAL":
                    physicalPalette = reader.readByteArray(blockSize);
                    break;
                case "PALX":
                    for (let i = 0; i < 16384; i++) {
                        virtualPalette.push(reader.readUint16());
                    }
                    break;
                case "PALB":
                    counter = 0;
                    paletteBase.tile = counter;
                    counter += reader.readUint16();

                    paletteBase.sprite = counter;
                    counter += reader.readUint16();

                    paletteBase.carRemap = counter;
                    counter += reader.readUint16();

                    paletteBase.pedRemap = counter;
                    counter += reader.readUint16();

                    paletteBase.codeObjRemap = counter;
                    counter += reader.readUint16();

                    paletteBase.mapObjRemap = counter;
                    counter += reader.readUint16();

                    paletteBase.userRemap = counter;
                    counter += reader.readUint16();

                    paletteBase.fontRemap = counter;
                    counter += reader.readUint16();
                    break;
                case "SPRB":
                    counter = 0;
                    spriteBase.car = counter;
                    counter += reader.readUint16();

                    spriteBase.pedestrian = counter;
                    counter += reader.readUint16();

                    spriteBase.codeObj = counter;
                    counter += reader.readUint16();

                    spriteBase.mapObj = counter;
                    counter += reader.readUint16();

                    spriteBase.user = counter;
                    counter += reader.readUint16();

                    spriteBase.font = counter;
                    counter += reader.readUint16();
                    break;
                case "SPRX":
                    const spriteCount = blockSize / 8;
                    for (let i = 0; i < spriteCount; i++) {
                        spriteInfo.push({
                            dataStart: reader.readUint32(),
                            width: reader.readUint8(),
                            height: reader.readUint8(),
                        });
                        reader.readUint16();
                    }
                    break;
                case "FONB":
                    let fontCount = reader.readUint16();
                    for (let i = 0; i < fontCount; i++) {
                        fontBase.push(reader.readUint16());
                    }
                    break;
                case "CARI":
                    while (reader.position < end) {
                        const model = reader.readUint8();
                        const sprite = reader.readUint8();
                        const width = reader.readUint8();
                        const height = reader.readUint8();
                        const numRemaps = reader.readUint8();
                        const passengers = reader.readUint8();
                        const wreck = reader.readUint8();
                        const rating = reader.readUint8();
                        const frontWheelOffset = reader.readInt8();
                        const rearWheelOffset = reader.readInt8();
                        const frontWindowOffset = reader.readInt8();
                        const rearWindowOffset = reader.readInt8();
                        const infoFlags = reader.readUint8();
                        const infoFlags2 = reader.readUint8();
                        const remaps: number[] = [];
                        for (let i = 0; i < numRemaps; i++) {
                            remaps.push(reader.readUint8());
                        }

                        const doors: {x: number, y: number}[] = [];
                        const numDoors = reader.readUint8();
                        for (let i = 0; i < numDoors; i++) {
                            doors.push({ x: reader.readInt8(), y: reader.readInt8() });
                        }

                        this.carInfo.push({
                            model, sprite, width, height, passengers, wreck, rating,
                            frontWheelOffset, rearWheelOffset, frontWindowOffset, rearWindowOffset,
                            infoFlags, infoFlags2, remaps, doors
                        });
                    }

                    break;
                case "OBJI":
                    while (reader.position < end) {
                        this.mapObjects.push({ model: reader.readUint8(), sprites: reader.readUint8() });
                    }

                    break;

                case "RECY":
                    while (reader.position < end) {
                        this.recycleCars.push(reader.readUint8());
                    }

                    break;

                default:
                    console.log(`Unknown style block ${blockType}: ${blockSize}`);
                    reader.position += blockSize;
                    break;
            }
        }

        if (!tileData) {
            throw new Error("Failed to find tile data.");
        }

        if (!spriteData) {
            throw new Error("Failed to find sprite data.");
        }

        if (!physicalPalette) {
            throw new Error("Physical palette is null");
        }

        let carSprite = spriteBase.car;
        for (const car of this.carInfo) {
            const offset = car.sprite;
            car.sprite = carSprite;
            carSprite += offset;
        }

        this.tileImageData = this.generateTiles(tileData, virtualPalette, paletteBase.tile, physicalPalette);
        this.spriteImageData = this.generateSprites(spriteData, spriteInfo, virtualPalette, paletteBase.sprite, physicalPalette);

        /*
         * fonts[0] = big text (only uppercase)
         * fonts[1] = small yellowish text (both cases)
         * fonts[2] = mid sized purplish text (only uppercase) Probably car names?
         * fonts[3] = ???
         * fonts[4] = ???
         * fonts[5] = mid sized black text (only uppercase) Location names
         * fonts[6] = mid sized white text (only uppercase)
         */
        const fonts: StyleFont[] = [];
        this.fonts = fonts;
        let fontCounter = spriteBase.font;
        for (const font of fontBase) {
            fonts.push(new StyleFont(this, fontCounter, font));
            fontCounter += font;
        }

        console.log("cars", this.carInfo);
        console.log("map objects", this.mapObjects);
        console.log("recycle cars", this.recycleCars);
        console.log("font base", fontBase);
        console.log("spriteBase", spriteBase);
        console.log("spriteInfo", this.spriteInfo);
        console.log("fonts", this.fonts);
    }

    public readonly tileImageData: HTMLCanvasElement;

    public readonly spriteImageData: HTMLCanvasElement;

    public readonly fonts: readonly IFont[];

    public getSpritePosition(spriteIndex: number): ISpriteLocation | null {
        return this.spriteInfo.get(spriteIndex) ?? null;
    }

    public getVehicleInfo(model: number): IVehicleInfo {
        return null!;
    }

    public getVehicleModelByType(type: VehicleType): number | null {
        return null;
    }

    public getLidTileTexCoords(lid: ILid): ITextureLocation {
        return this.getTileTexCoords(lid.tileIndex);
    }

    public getSideTileTexCoords(wall: IWall): ITextureLocation {
        return this.getTileTexCoords(wall.tileIndex);
    }

    private getTileTexCoords(tileIndex: number): ITextureLocation {
        const x = ((tileIndex % tilesPerRow) * tileSizeWithMargin + margin) / tileTextureSize;
        const y = (Math.floor(tileIndex / tilesPerRow) * tileSizeWithMargin + margin) / tileTextureSize;

        return { tX: x, tY: y, tW: tileSize / tileTextureSize, tH: tileSize / tileTextureSize };
    }

    private generateTiles(tileData: Uint8ClampedArray, virtualPalette: readonly number[], paletteBase: number, physicalPalette: Uint8ClampedArray): HTMLCanvasElement {
        const tiles = tileData.length >> 12;
        const imageDataList: Uint8ClampedArray[] = [];
        for (let i = 0; i < tiles; i++) {
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
                    const pixelIndex = (y << 8) + (x << 2);
                    const imageData = imageDataList[tile];
                    if ((pos < tileData.length) && (tileData[pos] > 0)) {
                        const palette = virtualPalette[paletteBase + tile];
                        const color = ((palette >> 6) * 256 + tileData[pos]) * 256 + ((palette % 64) * 4);
                        imageData[pixelIndex + 0] = physicalPalette[color + 2];
                        imageData[pixelIndex + 1] = physicalPalette[color + 1];
                        imageData[pixelIndex + 2] = physicalPalette[color + 0];
                        imageData[pixelIndex + 3] = 255;
                    } else {
                        imageData[pixelIndex + 0] = 0;
                        imageData[pixelIndex + 1] = 0;
                        imageData[pixelIndex + 2] = 0;
                        imageData[pixelIndex + 3] = 0;
                    }

                    pos++;
                }
            }
        }

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

        //bigTexture.style.position = "fixed";
        //bigTexture.style.top = "0";
        //bigTexture.style.height = "100vh";
        //bigTexture.style.left = "0";
        //document.body.appendChild(bigTexture);
        return bigTexture;
    }

    private generateSprites(spriteData: Uint8ClampedArray, spriteInfo: readonly ISpriteDataInfo[], virtualPalette: readonly number[], paletteBase: number, physicalPalette: Uint8ClampedArray): HTMLCanvasElement {
        const imageDataList: [number, number, ImageData][] = [];

        let counter = 0;
        for (const sprite of spriteInfo) {
            const imageData = new Uint8ClampedArray(sprite.width * sprite.height * 4);

            for (let y = 0; y < sprite.height; y++) {
                for (let x = 0; x < sprite.width; x++) {
                    const c = spriteData[(256 * y) + x + sprite.dataStart];
                    if (c > 0) {
                        const palette = virtualPalette[paletteBase + imageDataList.length];
                        const color = ((palette >> 6) * 256 + c) * 256 + ((palette % 64) * 4);
                        imageData[(((y * sprite.width) + x) * 4) + 0] = physicalPalette[color + 2];
                        imageData[(((y * sprite.width) + x) * 4) + 1] = physicalPalette[color + 1];
                        imageData[(((y * sprite.width) + x) * 4) + 2] = physicalPalette[color + 0];
                        imageData[(((y * sprite.width) + x) * 4) + 3] = 255;
                    } else {
                        imageData[(((y * sprite.width) + x) * 4) + 0] = 0;
                        imageData[(((y * sprite.width) + x) * 4) + 1] = 0;
                        imageData[(((y * sprite.width) + x) * 4) + 2] = 0;
                        imageData[(((y * sprite.width) + x) * 4) + 3] = 0;
                    }
                }
            }

            imageDataList.push([imageDataList.length, sprite.height, new ImageData(imageData, sprite.width)]);
        }

        imageDataList.sort((a, b) => a[1] - b[1]);
        const canvas = document.createElement("canvas");
        canvas.width = 2048;
        canvas.height = 2048;
        const context = canvas.getContext("2d");
        if (!context) {
            throw new Error("Failed to get canvas rendering context while generating tiles.");
        }

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

            context.putImageData(sprite, x, y);
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
}

class StyleFont implements IFont {
    private base: number;
    private style: Style;
    private charCount: number;

    constructor(style: Style, base: number, charCount: number) {
        this.base = base;
        this.style = style;
        this.charCount = charCount;
        this.fontImageData = style.spriteImageData;
        const positionInfo = this.style.getSpritePosition(this.base)
        this.height = positionInfo?.height ?? 0;
    }

    public readonly height: number;
    public readonly fontImageData: HTMLCanvasElement;

    public getTextInfo(text: string): { widths: readonly number[]; textureCoords: readonly number[]; } {
        const widths: number[] = [];
        const textureCoords: number[] = [];
        for (let i = 0; i < text.length; i++) {
            const code = text.charCodeAt(i);
            const index = TextChars.indexOf(code);
            if (index >= 0) {
                const pos = this.style.getSpritePosition(this.base + index);
                if (pos) {
                    widths.push(pos.width);
                    textureCoords.push(pos.tX, pos.tY, pos.tX + pos.tW, pos.tY, pos.tX, pos.tY + pos.tH, pos.tX + pos.tW, pos.tY + pos.tH);
                }
            }
        }

        return { widths, textureCoords };
    }
}

interface ISpriteDataInfo {
    dataStart: number;
    width: number;
    height: number;
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

interface ICarInfo {
    model: number;
    sprite: number;
    width: number;
    height: number;
    passengers: number;
    wreck: number;
    rating: number;
    frontWheelOffset: number;
    rearWheelOffset: number;
    frontWindowOffset: number;
    rearWindowOffset: number;
    infoFlags: number;
    infoFlags2: number;
    remaps: number[];
    doors: { x: number, y: number }[];
}

interface IMapObject {
    model: number;
    sprites: number;
}