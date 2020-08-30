import { Point } from "../Types";
import { IGameMap, IStyle } from "../DataReaders/Interfaces";
import WebGlRenderer from "./WebGlCityRenderer";
import Model, { IModelData } from "./Model";

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
                    if (x == 104 && y === 118) {
                        "".toString();
                    }

                    for (let i = 0; i < 6; i++) {
                        const block = map.getBlock(x, y, i);
                        if (!block) {
                            continue;
                        }

                        const transparentPass = f === 1;
                        const topNorthWest: Point = [(x) * 64, (y) * 64, (i) * 64];
                        const topNorthEast: Point = [(x + 1) * 64, (y) * 64, (i) * 64];
                        const topSouthWest: Point = [(x) * 64, (y + 1) * 64, (i) * 64];
                        const topSouthEast: Point = [(x + 1) * 64, (y + 1) * 64, (i) * 64];
                        const bottomNorthWest: Point = [(x) * 64, (y) * 64, (i + 1) * 64];
                        const bottomNorthEast: Point = [(x + 1) * 64, (y) * 64, (i + 1) * 64];
                        const bottomSouthWest: Point = [(x) * 64, (y + 1) * 64, (i + 1) * 64];
                        const bottomSouthEast: Point = [(x + 1) * 64, (y + 1) * 64, (i + 1) * 64];

                        adjustSlope(block.slope, topNorthWest, topNorthEast, topSouthWest, topSouthEast);

                        if (block.lid && (block.lid.transparent === transparentPass)) {
                            if (animLidBlocks.indexOf(block.lid.tileIndex) > -1) {
                                animTexCoords.push(modelData.textureCoords.length);
                            }

                            const start = modelData.positions.length / 3;
                            modelData.positions.push(
                                ...topNorthWest,
                                ...topNorthEast,
                                ...topSouthWest,
                                ...topSouthEast);

                            const { tX, tY, tW, tH } = style.getLidTileTexCoords(block.lid);
                            switch (block.lid.rotate) {
                                case 0:
                                default:
                                    modelData.textureCoords.push(
                                        tX, tY,
                                        tX + tW, tY,
                                        tX, tY + tH,
                                        tX + tW, tY + tH);
                                    break;
                                case 1:
                                    modelData.textureCoords.push(
                                        tX, tY + tH,
                                        tX, tY,
                                        tX + tW, tY + tH,
                                        tX + tW, tY);
                                    break;
                                case 2:
                                    modelData.textureCoords.push(
                                        tX + tW, tY + tH,
                                        tX, tY + tH,
                                        tX + tW, tY,
                                        tX, tY);
                                    break;
                                case 3:
                                    modelData.textureCoords.push(
                                        tX + tW, tY,
                                        tX + tW, tY + tH,
                                        tX, tY,
                                        tX, tY + tH);
                                    break;
                            }

                            modelData.indices.push(start + 0, start + 1, start + 2, start + 3, start + 2, start + 1);
                        }

                        if (block.bottom && (block.bottom.transparent === transparentPass)) {
                            if (animSideBlocks.indexOf(block.bottom.tileIndex) > -1) {
                                animTexCoords.push(modelData.textureCoords.length);
                            }

                            const start = modelData.positions.length / 3;
                            if (block.bottom.transparent) {
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

                            const { tX, tY, tW, tH } = style.getSideTileTexCoords(block.bottom);
                            if (block.bottom.flip) {
                                modelData.textureCoords.push(
                                    tX + tW, tY,
                                    tX, tY,
                                    tX + tW, tY + tH,
                                    tX, tY + tH);
                            } else {
                                modelData.textureCoords.push(
                                    tX, tY,
                                    tX + tW, tY,
                                    tX, tY + tH,
                                    tX + tW, tY + tH);
                            }

                            modelData.indices.push(start + 0, start + 1, start + 2, start + 3, start + 2, start + 1);
                        }

                        if (block.right && (block.right.transparent === transparentPass)) {
                            if (animSideBlocks.indexOf(block.right.tileIndex) > -1) {
                                animTexCoords.push(modelData.textureCoords.length);
                            }

                            const start = modelData.positions.length / 3;
                            if (block.right.transparent) {
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

                            const { tX, tY, tW, tH } = style.getSideTileTexCoords(block.right);
                            if (block.right.flip) {
                                modelData.textureCoords.push(
                                    tX + tW, tY,
                                    tX, tY,
                                    tX + tW, tY + tH,
                                    tX, tY + tH);
                            } else {
                                modelData.textureCoords.push(
                                    tX, tY,
                                    tX + tW, tY,
                                    tX, tY + tH,
                                    tX + tW, tY + tH);
                            }

                            modelData.indices.push(start + 0, start + 1, start + 2, start + 3, start + 2, start + 1);
                        }

                        if (block.left && (block.left.transparent === transparentPass)) {
                            if (animSideBlocks.indexOf(block.left.tileIndex) > -1) {
                                animTexCoords.push(modelData.textureCoords.length);
                            }
                            const start = modelData.positions.length / 3;
                            modelData.positions.push(
                                ...topNorthWest,
                                ...topSouthWest,
                                ...bottomNorthWest,
                                ...bottomSouthWest);

                            const { tX, tY, tW, tH } = style.getSideTileTexCoords(block.left);

                            if (block.left.flip) {
                                modelData.textureCoords.push(
                                    tX + tW, tY,
                                    tX, tY,
                                    tX + tW, tY + tH,
                                    tX, tY + tH);
                            } else {
                                modelData.textureCoords.push(
                                    tX, tY,
                                    tX + tW, tY,
                                    tX, tY + tH,
                                    tX + tW, tY + tH);
                            }

                            modelData.indices.push(start + 0, start + 1, start + 2, start + 3, start + 2, start + 1);
                        }

                        if (block.top && (block.top.transparent === transparentPass)) {
                            if (animSideBlocks.indexOf(block.top.tileIndex) > -1) {
                                animTexCoords.push(modelData.textureCoords.length);
                            }
                            const start = modelData.positions.length / 3;
                            modelData.positions.push(
                                ...topNorthEast,
                                ...topNorthWest,
                                ...bottomNorthEast,
                                ...bottomNorthWest);

                            const { tX, tY, tW, tH } = style.getSideTileTexCoords(block.top);
                            if (block.top.flip) {
                                modelData.textureCoords.push(
                                    tX + tW, tY,
                                    tX, tY,
                                    tX + tW, tY + tH,
                                    tX, tY + tH);
                            } else {
                                modelData.textureCoords.push(
                                    tX, tY,
                                    tX + tW, tY,
                                    tX, tY + tH,
                                    tX + tW, tY + tH);
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