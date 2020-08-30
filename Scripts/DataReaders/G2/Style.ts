import { IStyle, IVehicleInfo, ILid, ITextureLocation, IWall, ISpriteLocation, VehicleType } from "../Interfaces";
import { BinaryReader } from "../BinaryReader";

const margin = 2;
const tileSize = 64;
const tileSizeWithMargin = tileSize + margin + margin;
const tileTextureSize = 2400; // NOTE: should this be square of 2?
const tilesPerRow = Math.floor(tileTextureSize / tileSizeWithMargin);

export default class Style implements IStyle {
    constructor(data: DataView) {
        const reader = new BinaryReader(data);
        const magic = reader.readString(4);
        const version = reader.readUint16();
        if ((magic !== "GBST") || (version !== 700)) {
            throw new Error("Invalid style file");
        }

        let tileData: Uint8ClampedArray | null = null;
        let paletteBase = {
            tile: 0,
            sprite: 0,
            carRemap: 0,
            pedRemap: 0,
            codeObjRemap: 0,
            mapObjRemap: 0,
            userRemap: 0,
            fontRemap: 0,
        };
        let physicalPalette: Uint8ClampedArray | null = null;
        let virtualPalette = [];

        while (reader.position < reader.length) {
            const blockType = reader.readString(4);
            const blockSize = reader.readUint32();
            switch (blockType) {
                case "TILE":
                    tileData = reader.readByteArray(blockSize);
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
                    let counter = 0;
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
                    continue;
                default:
                    console.log(`${blockType}: ${blockSize}`);
                    reader.position += blockSize;
                    break;
            }
        }

        if (!tileData) {
            throw new Error("Failed to find tile data.");
        }

        if (!physicalPalette) {
            throw new Error("Physical palette is null");
        }

        this.tileImageData = this.generateTiles(tileData, virtualPalette, paletteBase.tile, physicalPalette);
        this.spriteImageData = document.createElement("canvas");
    }

    public readonly tileImageData: HTMLCanvasElement;

    public readonly spriteImageData: HTMLCanvasElement;

    public getSpritePosition(spriteIndex: number): ISpriteLocation | null {
        return { tX: 0, tY: 0, tW: 1, tH: 1, width: 20, height: 20 };
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

    private generateTiles(tileData: Uint8ClampedArray, virtualPalette: readonly number[], paletteBase: number, physicalPalette: Uint8ClampedArray) {
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
}