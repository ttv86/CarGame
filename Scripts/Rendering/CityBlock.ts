import { Point } from "../Types";
import GameMap from "../DataReaders/GameMap";
import Style from "../DataReaders/Style";
import WebGlRenderer from "./WebGlCityRenderer";
import Model, { IModelData } from "./Model";
import { count } from "console";

export default class CityBlock {
    private readonly animEnabled: boolean = false;
    private readonly flatModelData: IModelData | null = null;
    private readonly solidModelData: IModelData | null = null;
    private readonly flatModel: Model | null = null;
    private readonly solidModel: Model | null = null;
    private readonly flatTextureCoords: number[] = [];
    private readonly solidTextureCoords: number[] = [];
    private readonly style: Style;
    private readonly tileSize: number;
    private readonly margin: number;
    private readonly multiplier: number;
    private readonly tilesPerRow: number;

    constructor(renderer: WebGlRenderer, map: GameMap, style: Style, blockSize: number, margin: number, tilesPerRow: number, xx: number, yy: number, tileSize: number, multiplier: number, bigTexture: HTMLCanvasElement, tileIndexes: Map<string, number>) {
        this.style = style;
        this.tileSize = tileSize;
        this.margin = margin;
        this.multiplier = multiplier;
        this.tilesPerRow = tilesPerRow;

        const animLidBlocks = style.animationInfos.filter(x => x.which === 1).map(x => x.block);
        const animSideBlocks = style.animationInfos.filter(x => x.which === 0).map(x => x.block);
        const keys = [...tileIndexes.keys()];

        for (let f = 0; f < 2; f++) {
            let animTexCoords: number[] = [];
            const modelData = {
                center: { x: (xx + (blockSize / 2)) * 64, y: (yy + (blockSize / 2)) * 64 },
                positions: [] as number[],
                textureCoords: [] as number[],
                indices: [] as number[],
                texture: bigTexture,
                transparent: f === 1,
            }

            for (let y = yy; y < yy + blockSize; y++) {
                for (let x = xx; x < xx + blockSize; x++) {
                    for (let i = 0; i < 6; i++) {
                        const block = map.blocks[clamp(x, 0, 255)][clamp(y, 0, 255)][i];
                        if (!block) {
                            continue;
                        }

                        if (block.flat !== (f === 1)) {
                            continue;
                        }

                        const topNorthWest: Point = [(x) * 64, (y) * 64, (i) * 64];
                        const topNorthEast: Point = [(x + 1) * 64, (y) * 64, (i) * 64];
                        const topSouthWest: Point = [(x) * 64, (y + 1) * 64, (i) * 64];
                        const topSouthEast: Point = [(x + 1) * 64, (y + 1) * 64, (i) * 64];
                        const bottomNorthWest: Point = [(x) * 64, (y) * 64, (i + 1) * 64];
                        const bottomNorthEast: Point = [(x + 1) * 64, (y) * 64, (i + 1) * 64];
                        const bottomSouthWest: Point = [(x) * 64, (y + 1) * 64, (i + 1) * 64];
                        const bottomSouthEast: Point = [(x + 1) * 64, (y + 1) * 64, (i + 1) * 64];

                        adjustSlope(block.slope, topNorthWest, topNorthEast, topSouthWest, topSouthEast);

                        if (block.lid) {
                            if (animLidBlocks.indexOf(block.lid) > -1) {
                                animTexCoords.push(modelData.textureCoords.length);
                            }

                            const start = modelData.positions.length / 3;
                            modelData.positions.push(
                                ...topNorthWest,
                                ...topNorthEast,
                                ...topSouthWest,
                                ...topSouthEast);
                            const tileIndex = keys.indexOf(`L${block.lid}/${block.remap}`);
                            const tileX = (margin + Math.floor(tileIndex % tilesPerRow) * multiplier) / 2048;
                            const tileY = (margin + Math.floor(tileIndex / tilesPerRow) * multiplier) / 2048;
                            switch (block.lidRotation) {
                                case 0:
                                default:
                                    modelData.textureCoords.push(
                                        tileX, tileY,
                                        tileX + tileSize, tileY,
                                        tileX, tileY + tileSize,
                                        tileX + tileSize, tileY + tileSize);
                                    break;
                                case 1:
                                    modelData.textureCoords.push(
                                        tileX, tileY + tileSize,
                                        tileX, tileY,
                                        tileX + tileSize, tileY + tileSize,
                                        tileX + tileSize, tileY);
                                    break;
                                case 2:
                                    modelData.textureCoords.push(
                                        tileX + tileSize, tileY + tileSize,
                                        tileX, tileY + tileSize,
                                        tileX + tileSize, tileY,
                                        tileX, tileY);
                                    break;
                                case 3:
                                    modelData.textureCoords.push(
                                        tileX + tileSize, tileY,
                                        tileX + tileSize, tileY + tileSize,
                                        tileX, tileY,
                                        tileX, tileY + tileSize);
                                    break;
                            }

                            modelData.indices.push(start + 0, start + 1, start + 2, start + 3, start + 2, start + 1);
                        }

                        if (block.bottom) {
                            if (animSideBlocks.indexOf(block.bottom) > -1) {
                                animTexCoords.push(modelData.textureCoords.length);
                            }

                            const start = modelData.positions.length / 3;
                            if (block.flat) {
                                modelData.positions.push(
                                    ...topNorthWest,
                                    ...topNorthEast,
                                    ...bottomNorthWest,
                                    ...bottomNorthEast);
                            } else {
                                modelData.positions.push(
                                    ...topSouthWest,
                                    ...topSouthEast,
                                    ...bottomSouthWest,
                                    ...bottomSouthEast);
                            }

                            const tileIndex = keys.indexOf(`S${block.bottom}`);
                            const tileX = (margin + Math.floor(tileIndex % tilesPerRow) * multiplier) / 2048;
                            const tileY = (margin + Math.floor(tileIndex / tilesPerRow) * multiplier) / 2048;
                            if (block.flipTopBottom) {
                                modelData.textureCoords.push(
                                    tileX + tileSize, tileY,
                                    tileX, tileY,
                                    tileX + tileSize, tileY + tileSize,
                                    tileX, tileY + tileSize);
                            } else {
                                modelData.textureCoords.push(
                                    tileX, tileY,
                                    tileX + tileSize, tileY,
                                    tileX, tileY + tileSize,
                                    tileX + tileSize, tileY + tileSize);
                            }

                            modelData.indices.push(start + 0, start + 1, start + 2, start + 3, start + 2, start + 1);
                        }

                        if (block.right) {
                            if (animSideBlocks.indexOf(block.right) > -1) {
                                animTexCoords.push(modelData.textureCoords.length);
                            }

                            const start = modelData.positions.length / 3;
                            if (block.flat) {
                                modelData.positions.push(
                                    ...topSouthWest,
                                    ...topNorthWest,
                                    ...bottomSouthWest,
                                    ...bottomNorthWest);
                            } else {
                                modelData.positions.push(
                                    ...topSouthEast,
                                    ...topNorthEast,
                                    ...bottomSouthEast,
                                    ...bottomNorthEast);
                            }
                            const tileIndex = keys.indexOf(`S${block.right}`);
                            const tileX = (margin + Math.floor(tileIndex % tilesPerRow) * multiplier) / 2048;
                            const tileY = (margin + Math.floor(tileIndex / tilesPerRow) * multiplier) / 2048;
                            if (block.flipLeftRight) {
                                modelData.textureCoords.push(
                                    tileX + tileSize, tileY,
                                    tileX, tileY,
                                    tileX + tileSize, tileY + tileSize,
                                    tileX, tileY + tileSize);
                            } else {
                                modelData.textureCoords.push(
                                    tileX, tileY,
                                    tileX + tileSize, tileY,
                                    tileX, tileY + tileSize,
                                    tileX + tileSize, tileY + tileSize);
                            }

                            modelData.indices.push(start + 0, start + 1, start + 2, start + 3, start + 2, start + 1);
                        }

                        if (block.left) {
                            if (animSideBlocks.indexOf(block.left) > -1) {
                                animTexCoords.push(modelData.textureCoords.length);
                            }
                            const start = modelData.positions.length / 3;
                            modelData.positions.push(
                                ...topNorthWest,
                                ...topSouthWest,
                                ...bottomNorthWest,
                                ...bottomSouthWest);
                            const tileIndex = keys.indexOf(`S${block.left}`);
                            const tileX = (margin + Math.floor(tileIndex % tilesPerRow) * multiplier) / 2048;
                            const tileY = (margin + Math.floor(tileIndex / tilesPerRow) * multiplier) / 2048;

                            if (block.flipLeftRight) {
                                modelData.textureCoords.push(
                                    tileX + tileSize, tileY,
                                    tileX, tileY,
                                    tileX + tileSize, tileY + tileSize,
                                    tileX, tileY + tileSize);
                            } else {
                                modelData.textureCoords.push(
                                    tileX, tileY,
                                    tileX + tileSize, tileY,
                                    tileX, tileY + tileSize,
                                    tileX + tileSize, tileY + tileSize);
                            }

                            modelData.indices.push(start + 0, start + 1, start + 2, start + 3, start + 2, start + 1);
                        }

                        if (block.top) {
                            if (animSideBlocks.indexOf(block.top) > -1) {
                                animTexCoords.push(modelData.textureCoords.length);
                            }
                            const start = modelData.positions.length / 3;
                            modelData.positions.push(
                                ...topNorthEast,
                                ...topNorthWest,
                                ...bottomNorthEast,
                                ...bottomNorthWest);
                            const tileIndex = keys.indexOf(`S${block.top}`);
                            const tileX = (margin + Math.floor(tileIndex % tilesPerRow) * multiplier) / 2048;
                            const tileY = (margin + Math.floor(tileIndex / tilesPerRow) * multiplier) / 2048;
                            if (block.flipTopBottom) {
                                modelData.textureCoords.push(
                                    tileX + tileSize, tileY,
                                    tileX, tileY,
                                    tileX + tileSize, tileY + tileSize,
                                    tileX, tileY + tileSize);
                            } else {
                                modelData.textureCoords.push(
                                    tileX, tileY,
                                    tileX + tileSize, tileY,
                                    tileX, tileY + tileSize,
                                    tileX + tileSize, tileY + tileSize);
                            }

                            modelData.indices.push(start + 0, start + 1, start + 2, start + 3, start + 2, start + 1);
                        }
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

    private counter = 0;
    private updateTime: number = 0;
    public update(time: number) {
        if (this.animEnabled) {
            this.updateTime += time;
            while (this.updateTime > 0.28) {
                const auxStart = this.style.sideTiles + (this.style.lidTiles * 4);

                this.updateTime -= 0.28;
                if (this.solidModelData && (this.solidTextureCoords.length > 0)) {
                    const clone = this.solidModelData.textureCoords.slice(0);
                    for (const index of this.solidTextureCoords) {
                        const tileIndex = auxStart + this.counter + 25;
                        const tileX = (this.margin + Math.floor(tileIndex % this.tilesPerRow) * this.multiplier) / 2048;
                        const tileY = (this.margin + Math.floor(tileIndex / this.tilesPerRow) * this.multiplier) / 2048;
                        clone[index + 0] = tileX;
                        clone[index + 1] = tileY;
                        clone[index + 2] = tileX + this.tileSize;
                        clone[index + 3] = tileY;
                        clone[index + 4] = tileX;
                        clone[index + 5] = tileY + this.tileSize;
                        clone[index + 6] = tileX + this.tileSize;
                        clone[index + 7] = tileY + this.tileSize;
                        if (this.counter > 9) {
                            this.counter = 0;
                        }
                    }

                    this.solidModel?.updateModel({ textureCoords: clone });
                }

                this.counter++;
            }
        }
    }
}

function adjustSlope(slope: number, northWest: Point, northEast: Point, southWest: Point, southEast: Point) {
    let up: [Point, Point];
    let down: [Point, Point];
    if (((slope >= 1) && (slope <= 2)) || ((slope >= 9) && (slope <= 16)) || (slope == 41)) {
        up = [northEast, northWest];
        down = [southEast, southWest];
    } else if (((slope >= 3) && (slope <= 4)) || ((slope >= 17) && (slope <= 24)) || (slope == 42)) {
        up = [southEast, southWest];
        down = [northEast, northWest];
    } else if (((slope >= 5) && (slope <= 6)) || ((slope >= 25) && (slope <= 32)) || (slope == 43)) {
        up = [northWest, southWest];
        down = [northEast, southEast];
    } else if (((slope >= 7) && (slope <= 8)) || ((slope >= 33) && (slope <= 40)) || (slope == 44)) {
        up = [northEast, southEast];
        down = [northWest, southWest];
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
    const upper = (level / parts) * 64;
    const lower = ((level - 1) / parts) * 64;
    up[0][2] += lower;
    up[1][2] += lower;
    down[0][2] += upper;
    down[1][2] += upper;
}

function clamp(value: number, min: number, max: number): number {
    if (value < min) {
        return min;
    }

    if (value > max) {
        return max;
    }

    return value;
}