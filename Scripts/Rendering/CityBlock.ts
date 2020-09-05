import { Point } from "../Types";
import { IGameMap, IStyle, TextureTransform, IBlock, IWall, ILid, ITextureLocation } from "../DataReaders/Interfaces";
import WebGlRenderer from "./WebGlCityRenderer";
import Model, { IModelData } from "./Model";

const twoThirds = 2 / 3;

export default class CityBlock {
    private readonly animEnabled: boolean = false;
    private readonly flatModelData: IModelData | null = null;
    private readonly solidModelData: IModelData | null = null;
    private readonly flatModel: Model | null = null;
    private readonly solidModel: Model | null = null;
    private readonly flatTextureCoords: number[] = [];
    private readonly solidTextureCoords: number[] = [];
    private readonly style: IStyle;
    private readonly tileSize: number;
    private readonly margin: number;
    private readonly multiplier: number;
    private readonly tilesPerRow: number;

    constructor(
        renderer: WebGlRenderer,
        map: IGameMap,
        style: IStyle,
        blockSize: number,
        margin: number,
        tilesPerRow: number,
        xx: number,
        yy: number,
        tileSize_unused: number,
        multiplier: number,
        bigTexture: HTMLCanvasElement | HTMLImageElement | ImageData,
        tileIndexes_unused: Map<string, number>) {

        this.style = style;
        this.tileSize = Number.NaN;
        this.margin = margin;
        this.multiplier = multiplier;
        this.tilesPerRow = tilesPerRow;

        const animLidBlocks: number[] = []; // TODO: style.animationInfos.filter(x => x.which === 1).map(x => x.block);
        const animSideBlocks: number[] = []; // TODO: style.animationInfos.filter(x => x.which === 0).map(x => x.block);
        //const keys = [...tileIndexes.keys()];

        for (let f = 0; f < 2; f++) {
            let animTexCoords: number[] = [];
            const modelData: IModelDataBuilder = {
                center: { x: (xx + (blockSize / 2)), y: (yy + (blockSize / 2)) },
                positions: [],
                textureCoords: [],
                indices: [],
                texture: bigTexture,
                transparent: f === 1,
            }

            for (let y = yy; y < yy + blockSize; y++) {
                for (let x = xx; x < xx + blockSize; x++) {
                    for (let i = 0; i < map.maxAltitude; i++) {
                        const block = map.getBlock(x, y, i);
                        if (!block) {
                            continue;
                        }

                        const topNorthWest: Point = [x, y, i];
                        const topNorthEast: Point = [(x + 1), y, i];
                        const topSouthWest: Point = [x, (y + 1), i];
                        const topSouthEast: Point = [(x + 1), (y + 1), i];
                        const bottomNorthWest: Point = [x, y, (i + 1)];
                        const bottomNorthEast: Point = [(x + 1), y, (i + 1)];
                        const bottomSouthWest: Point = [x, (y + 1), (i + 1)];
                        const bottomSouthEast: Point = [(x + 1), (y + 1), (i + 1)];

                        adjustSlope(block.slope, topNorthWest, topNorthEast, topSouthWest, topSouthEast, bottomNorthWest, bottomNorthEast, bottomSouthWest, bottomSouthEast);

                        this.addLid(block.lid, topNorthWest, topNorthEast, topSouthWest, topSouthEast, modelData);
                        this.addSide(block.bottom, topSouthWest, topSouthEast, bottomSouthWest, bottomSouthEast, modelData);
                        this.addSide(block.right, topSouthEast, topNorthEast, bottomSouthEast, bottomNorthEast, modelData);
                        this.addSide(block.left, topNorthWest, topSouthWest, bottomNorthWest, bottomSouthWest, modelData);
                        this.addSide(block.top, topNorthEast, topNorthWest, bottomNorthEast, bottomNorthWest, modelData);
                    }
                }
            }

            if (modelData.positions.length === 0) {
                continue;
            }

            const model = renderer.createModel(modelData);
            if (f == 0) {
                this.solidModel = model;
                this.solidModelData = modelData;
            } else {
                this.flatModel = model;
                this.flatModelData = modelData;
            }

            //if (animTexCoords.length > 0) {
            //    this.animEnabled = true;
            //    if (f == 0) {
            //        this.solidTextureCoords = animTexCoords;
            //    } else {
            //        this.flatTextureCoords = animTexCoords;
            //    }
            //}
        }
    }

    private addLid(lid: ILid | null, point1: Point, point2: Point, point3: Point, point4: Point, modelData: IModelDataBuilder) {
        if (lid && (lid.transparent === modelData.transparent)) {
            // TODO:
            //if (animLidBlocks.indexOf(lid.tileIndex) > -1) {
            //    animTexCoords.push(modelData.textureCoords.length);
            //}

            const start = modelData.positions.length / 3;
            modelData.positions.push(
                ...point1,
                ...point2,
                ...point3,
                ...point4);

            this.addTextureCoords(this.style.getLidTileTexCoords(lid), modelData.textureCoords, lid.transform);

            if (point1[0] == point2[0]) {
                if (point1[0] == point3[0]) {
                    modelData.indices.push(start + 3, start + 2, start + 0);
                } else {
                    modelData.indices.push(start + 3, start + 2, start + 1);
                }
            } else if (point3[0] === point4[0]) {
                if (point2[0] == point4[0]) {
                    modelData.indices.push(start + 0, start + 1, start + 3);
                } else {
                    modelData.indices.push(start + 0, start + 1, start + 2);
                }
            } else {
                modelData.indices.push(start + 0, start + 1, start + 2, start + 3, start + 2, start + 1);
            }
        }
    }

    private addSide(side: IWall | null, point1: Point, point2: Point, point3: Point, point4: Point, modelData: IModelDataBuilder) {
        if (side && (side.tileIndex >= 0) && (side.transparent === modelData.transparent)) {
            // TODO:
            //if (animSideBlocks.indexOf(side.tileIndex) > -1) {
            //    animTexCoords.push(modelData.textureCoords.length);
            //}

            const start = modelData.positions.length / 3;
            modelData.positions.push(
                ...point1,
                ...point2,
                ...point3,
                ...point4);

            this.addTextureCoords(this.style.getSideTileTexCoords(side), modelData.textureCoords, side.transform);
            modelData.indices.push(start + 0, start + 1, start + 2, start + 3, start + 2, start + 1);
            if (side.backTileIndex !== void 0) {
                let transform = side.transform ?? TextureTransform.NoTransform;
                transform ^= 4; // Add/remove mirroring
                this.addSide({ ...side, tileIndex: side.backTileIndex, backTileIndex: void 0, transform }, point2, point1, point4, point3, modelData);
            }
        }
    }

    private addTextureCoords(textureLocation: ITextureLocation, textureCoords: number[], rotate: TextureTransform | undefined) {
        const { tX, tY, tW, tH } = textureLocation;
        switch (rotate) {
            default:
            case TextureTransform.NoTransform:
                textureCoords.push(
                    tX, tY,
                    tX + tW, tY,
                    tX, tY + tH,
                    tX + tW, tY + tH);
                break;
            case TextureTransform.Rotate90deg:
                textureCoords.push(
                    tX, tY + tH,
                    tX, tY,
                    tX + tW, tY + tH,
                    tX + tW, tY);
                break;
            case TextureTransform.Rotate180deg:
                textureCoords.push(
                    tX + tW, tY + tH,
                    tX, tY + tH,
                    tX + tW, tY,
                    tX, tY);
                break;
            case TextureTransform.Rotate270deg:
                textureCoords.push(
                    tX + tW, tY,
                    tX + tW, tY + tH,
                    tX, tY,
                    tX, tY + tH);
                break;
            case TextureTransform.Mirror:
                textureCoords.push(
                    tX + tW, tY,
                    tX, tY,
                    tX + tW, tY + tH,
                    tX, tY + tH);
                break;
            case TextureTransform.Rotate90degAndMirror:
                textureCoords.push(
                    tX, tY,
                    tX, tY + tH,
                    tX + tW, tY,
                    tX + tW, tY + tH);
                break;
            case TextureTransform.Rotate180degAndMirror:
                textureCoords.push(
                    tX, tY + tH,
                    tX + tW, tY + tH,
                    tX, tY,
                    tX + tW, tY);
                break;
            case TextureTransform.Rotate270degAndMirror:
                textureCoords.push(
                    tX + tW, tY + tH,
                    tX + tW, tY,
                    tX, tY + tH,
                    tX, tY);
                break;
        }
    }

    private counter = 0;
    private updateTime: number = 0;
    public update(time: number) {
        //if (this.animEnabled) {
        //    this.updateTime += time;
        //    while (this.updateTime > 0.28) {
        //        const auxStart = this.style.sideTiles + (this.style.lidTiles * 4);

        //        this.updateTime -= 0.28;
        //        if (this.solidModelData && (this.solidTextureCoords.length > 0)) {
        //            const clone = this.solidModelData.textureCoords.slice(0);
        //            for (const index of this.solidTextureCoords) {
        //                const tileIndex = auxStart + this.counter + 25;
        //                const tileX = (this.margin + Math.floor(tileIndex % this.tilesPerRow) * this.multiplier) / 2048;
        //                const tileY = (this.margin + Math.floor(tileIndex / this.tilesPerRow) * this.multiplier) / 2048;
        //                clone[index + 0] = tileX;
        //                clone[index + 1] = tileY;
        //                clone[index + 2] = tileX + this.tileSize;
        //                clone[index + 3] = tileY;
        //                clone[index + 4] = tileX;
        //                clone[index + 5] = tileY + this.tileSize;
        //                clone[index + 6] = tileX + this.tileSize;
        //                clone[index + 7] = tileY + this.tileSize;
        //                if (this.counter > 9) {
        //                    this.counter = 0;
        //                }
        //            }

        //            this.solidModel?.updateModel({ textureCoords: clone });
        //        }

        //        this.counter++;
        //    }
        //}
    }
}

interface IModelDataBuilder {
    center: { x: number, y: number };
    positions: number[];
    textureCoords: number[];
    indices: number[];
    texture: HTMLCanvasElement | HTMLImageElement | ImageData;
    transparent: boolean;
}

function adjustSlope(
    slope: number,
    topNorthWest: Point, topNorthEast: Point, topSouthWest: Point, topSouthEast: Point,
    bottomNorthWest: Point, bottomNorthEast: Point, bottomSouthWest: Point, bottomSouthEast: Point) {
    if (slope == 0) {
        return;
    } else if (slope < 45) {
        let up: [Point, Point];
        let down: [Point, Point];
        if (((slope >= 1) && (slope <= 2)) || ((slope >= 9) && (slope <= 16)) || (slope == 41)) {
            up = [topNorthEast, topNorthWest];
            down = [topSouthEast, topSouthWest];
        } else if (((slope >= 3) && (slope <= 4)) || ((slope >= 17) && (slope <= 24)) || (slope == 42)) {
            up = [topSouthEast, topSouthWest];
            down = [topNorthEast, topNorthWest];
        } else if (((slope >= 5) && (slope <= 6)) || ((slope >= 25) && (slope <= 32)) || (slope == 43)) {
            up = [topNorthWest, topSouthWest];
            down = [topNorthEast, topSouthEast];
        } else if (((slope >= 7) && (slope <= 8)) || ((slope >= 33) && (slope <= 40)) || (slope == 44)) {
            up = [topNorthEast, topSouthEast];
            down = [topNorthWest, topSouthWest];
        } else {
            return;
        }

        let parts
        if ((slope >= 1) && (slope <= 8)) {
            parts = 2;
        } else if ((slope >= 9) && (slope <= 40)) {
            parts = 8;
        } else if ((slope >= 41) && (slope <= 44)) {
            parts = 1;
        } else {
            return;
        }

        const level = parts - ((slope - 1) % parts);
        const upper = (level / parts);
        const lower = ((level - 1) / parts);
        up[0][2] += lower;
        up[1][2] += lower;
        down[0][2] += upper;
        down[1][2] += upper;
        return;
    } else if (slope === 45) {
        topNorthWest[0] = topNorthEast[0];
        bottomNorthWest[0] = bottomNorthEast[0];
        return;
    } else if (slope === 46) {
        topNorthEast[0] = topNorthWest[0];
        bottomNorthEast[0] = bottomNorthWest[0];
        return;
    } else if (slope === 47) {
        topSouthWest[0] = topSouthEast[0];
        bottomSouthWest[0] = bottomSouthEast[0];
        return;
    } else if (slope === 48) {
        topSouthEast[0] = topSouthWest[0];
        bottomSouthEast[0] = bottomSouthWest[0];
        return;
    } else if (slope === 49) {
        topNorthWest[2] = bottomNorthWest[2];
    } else if (slope === 50) {
        topNorthEast[2] = bottomNorthEast[2];
    } else if (slope === 51) {
        topSouthWest[2] = bottomSouthWest[2];
    } else if (slope === 52) {
        topSouthEast[2] = bottomSouthEast[2];
    } else if (slope === 64) {
        bottomNorthWest[0] = bottomNorthEast[0]
        topNorthWest[0] = bottomSouthEast[0];
        topNorthWest[2] = bottomSouthEast[2];
        topSouthWest[0] = bottomSouthEast[0];
        topNorthEast[2] = bottomSouthEast[2];
    } else if (slope === 65) {
        bottomNorthEast[0] = bottomNorthWest[0]
        topNorthEast[0] = bottomSouthWest[0];
        topNorthEast[2] = bottomSouthWest[2];
        topSouthEast[0] = bottomSouthWest[0];
        topNorthWest[2] = bottomSouthWest[2];
    } else if (slope === 66) {
        bottomSouthWest[0] = bottomSouthEast[0]
        topSouthWest[0] = bottomNorthEast[0];
        topSouthWest[2] = bottomNorthEast[2];
        topNorthWest[0] = bottomNorthEast[0];
        topSouthEast[2] = bottomNorthEast[2];
    } else if (slope === 67) {
        bottomSouthEast[0] = bottomSouthWest[0]
        topSouthEast[0] = bottomNorthWest[0];
        topSouthEast[2] = bottomNorthWest[2];
        topNorthEast[0] = bottomNorthWest[0];
        topSouthWest[2] = bottomNorthWest[2];
    }

    //if ((slope >= 49) && (slope <= 52)) {
    //    topNorthWest[0] -= 200;
    //    topNorthEast[0] += 200;
    //    topSouthWest[0] -= 200;
    //    topSouthEast[0] += 200;
    //}

    if ((slope === 53) || (slope === 57) || (slope === 60)) {
        // short left
        topNorthEast[0] -= twoThirds;
        topSouthEast[0] -= twoThirds;
        bottomNorthEast[0] -= twoThirds;
        bottomSouthEast[0] -= twoThirds;
    }

    if ((slope === 54) || (slope === 58) || (slope === 59)) {
        // short right
        topNorthWest[0] += twoThirds;
        topSouthWest[0] += twoThirds;
        bottomNorthWest[0] += twoThirds;
        bottomSouthWest[0] += twoThirds;
    }

    if ((slope === 55) || (slope === 57) || (slope === 58)) {
        // short top
        topSouthEast[1] -= twoThirds;
        topSouthWest[1] -= twoThirds;
        bottomSouthEast[1] -= twoThirds;
        bottomSouthWest[1] -= twoThirds;
    }

    if ((slope === 56) || (slope === 59) || (slope === 60)) {
        // short bottom
        topNorthEast[1] += twoThirds;
        topNorthWest[1] += twoThirds;
        bottomNorthEast[1] += twoThirds;
        bottomNorthWest[1] += twoThirds;
    }
}