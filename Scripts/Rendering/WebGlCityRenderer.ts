import { mat4 } from "gl-matrix";
import Style, { ISpriteLocation } from "../DataReaders/Style";
import GameMap from "../DataReaders/GameMap";
import Font from "../DataReaders/Font";
import Entity from "../Entity";
import Model, { IModelData } from "./Model";
import TextBuffer, { ITextBuffer } from "./TextBuffer";
import { HorizontalAlign, VerticalAlign, Point } from "../Types";
import Sprite from "../Sprite";
import CityBlock from "./CityBlock";
import WebGlBaseRenderer, { IBaseRenderer } from "./WebGlBaseRenderer";

const blockSize = 16;
export default class WebGlRenderer extends WebGlBaseRenderer implements IRenderer {
    private models: Model[] = [];
    private blocks: CityBlock[] = [];

    public x: number = 0;
    public y: number = 0;
    public altitude: number = 20;
    public readonly worldEntities: Entity[] = [];
    public readonly guiEntities: Entity[] = [];

    constructor(canvas: HTMLCanvasElement) {
        super(canvas);        
    }

    public renderScene() {
        const projection = mat4.perspective(mat4.create(), 0.84, this.width / this.height, 0.1, 6400);
        const world = mat4.lookAt(mat4.create(), [0, 0, -this.altitude], [0, 0, 1000], [0, -1, 0]);
        this.gl.uniformMatrix4fv(this.projectionMatrixLocation, false, projection);
        this.gl.uniformMatrix4fv(this.worldMatrixLocation, false, world);

        this.gl.enable(WebGLRenderingContext.DEPTH_TEST);

        const view = mat4.create();
        for (const model of this.models) {
            //const dist = Math.sqrt(Math.pow(model.center.x - this.x, 2) + Math.pow(model.center.y - this.y, 2));
            const dist = Math.abs(model.center.x - this.x) + Math.abs(model.center.y - this.y);
            if (dist < 2000) {
                mat4.identity(view);
                mat4.translate(view, view, [-this.x, this.y, 0]);
                this.gl.uniformMatrix4fv(this.viewMatrixLocation, false, view);
                model.draw(this.gl, this.vertexPositionLocation, this.textureCoordLocation, this.useAlphaLocation);
            }
        }

        for (const entity of this.worldEntities) {
            if (entity.visible) {
                mat4.identity(view);
                mat4.translate(view, view, [entity.x - this.x, this.y - entity.y, 1 - entity.z]);
                mat4.rotateZ(view, view, entity.rotation);
                mat4.translate(view, view, [-entity.width / 2, entity.height / 2, 0]);

                this.gl.uniformMatrix4fv(this.viewMatrixLocation, false, view);
                entity.render();
            }
        }

        mat4.identity(view);
        this.gl.uniformMatrix4fv(this.viewMatrixLocation, false, view);

        mat4.ortho(projection, 0, this.width, this.height, 0, 0.1, 100);
        mat4.lookAt(world, [0, 0, 10], [0, 0, 0], [0, 1, 0]);
        this.gl.uniformMatrix4fv(this.projectionMatrixLocation, false, projection);
        this.gl.uniformMatrix4fv(this.worldMatrixLocation, false, world);

        this.gl.disable(WebGLRenderingContext.DEPTH_TEST);

        for (const entity of this.guiEntities) {
            if (entity.visible) {
                mat4.lookAt(world, [-entity.x, -entity.y, 10], [-entity.x, -entity.y, 0], [0, 1, 0]);
                this.gl.uniformMatrix4fv(this.worldMatrixLocation, false, world);
                entity.render();
            }
        }
    }

    public buildCityModel(map: GameMap, style: Style) {
        const bigTexture = document.createElement("canvas");
        bigTexture.width = 2048;
        bigTexture.height = 2048;
        const bigContext = bigTexture.getContext("2d");
        if (!bigContext) {
            throw new Error(":(");
        }

        bigContext.fillStyle = "rgb(0,0,0,0.0)";
        bigContext.fillRect(0, 0, 2048, 2048);

        const tileIndexes = new Map<string, number>();
        for (let x = 0; x < 256; x++) {
            for (let y = 0; y < 256; y++) {
                for (let z = 0; z < 6; z++) {
                    const block = map.blocks[x][y][z];
                    if (block != null) {
                        if (block.lid > 0) {
                            const key = `L${block.lid}/${block.remap}`;
                            if (!tileIndexes.has(key)) {
                                tileIndexes.set(key, (style.sideTiles + block.lid) * 4 + block.remap);
                            }
                        }

                        if (block.bottom > 0) {
                            const key = `S${block.bottom}`;
                            if (!tileIndexes.has(key)) {
                                tileIndexes.set(key, block.bottom * 4);
                            }
                        }

                        if (block.top > 0) {
                            const key = `S${block.top}`;
                            if (!tileIndexes.has(key)) {
                                tileIndexes.set(key, block.top * 4);
                            }
                        }

                        if (block.left > 0) {
                            const key = `S${block.left}`;
                            if (!tileIndexes.has(key)) {
                                tileIndexes.set(key, block.left * 4);
                            }
                        }

                        if (block.right > 0) {
                            const key = `S${block.right}`;
                            if (!tileIndexes.has(key)) {
                                tileIndexes.set(key, block.right * 4);
                            }
                        }
                    }
                }
            }
        }

        const tilesPerRow = 20;
        const multiplier = 2048 / tilesPerRow;
        const margin = (multiplier - 64) / 2
        const helperCanvas = document.createElement("canvas");
        helperCanvas.width = 64;
        helperCanvas.height = 64;
        const helperContext = helperCanvas.getContext("2d")!;
        const values = [...tileIndexes.values()];
        for (let i = 0; i < values.length; i++) {
            const imageData = style.tiles[values[i]];
            helperContext.putImageData(imageData, 0, 0);
            const x = margin + Math.floor(i % tilesPerRow) * multiplier;
            const y = margin + Math.floor(i / tilesPerRow) * multiplier;
            if (margin > 0) {
                bigContext.drawImage(helperCanvas, 0, 0, 1, 1, x - margin, y - margin, margin, margin);
                bigContext.drawImage(helperCanvas, 63, 0, 1, 1, x + 64, y - margin, margin, margin);
                bigContext.drawImage(helperCanvas, 0, 63, 1, 1, x - margin, y + 64, margin, margin);
                bigContext.drawImage(helperCanvas, 63, 63, 1, 1, x + 64, y + 64, margin, margin);

                bigContext.drawImage(helperCanvas, 0, 0, 64, 1, x, y - margin, 64, margin);
                bigContext.drawImage(helperCanvas, 0, 0, 1, 64, x - margin, y, margin, 64);
                bigContext.drawImage(helperCanvas, 0, 63, 64, 1, x, y + 64, 64, margin + 1);
                bigContext.drawImage(helperCanvas, 63, 0, 1, 64, x + 64, y, margin + 1, 64);
            }

            bigContext.drawImage(helperCanvas, x, y);
        }

        //const image = document.createElement("img");
        //image.src = bigTexture.toDataURL();
        //image.style.position = "fixed";
        //image.style.left = "0";
        //image.style.top = "0";
        //image.style.height = "100vh";
        //document.body.appendChild(image);

        //this.tileTexture = this.loadTexture(bigTexture);
        //this.spriteTexture = this.loadTexture(style.spriteCanvas);

        const tileSize = (1 / 32);

        const min = -(blockSize / 2);
        const max = 256 + (blockSize / 2);
        for (let yy = min; yy < max; yy += blockSize) {
            for (let xx = min; xx < max; xx += blockSize) {
                this.blocks.push(new CityBlock(this, map, style, blockSize, margin, tilesPerRow, xx, yy, tileSize, multiplier, bigTexture, tileIndexes));
            }
        }
    }

    public setCamera(position: [number, number, number]): void {
        this.x = position[0];
        this.y = position[1];
        this.altitude = position[2];
    }

    public createModel(modelData: IModelData): Model {
        let texture = this.textureMap.get(modelData.texture);
        if (!texture) {
            texture = this.loadTexture(modelData.texture);
            this.textureMap.set(modelData.texture, texture);
        }

        const result = new Model(this.gl, modelData, texture);
        this.models.push(result);
        return result;
    }



    public createModelFromSprite(spriteInfo: ISpriteLocation, modelTexture: HTMLImageElement | HTMLCanvasElement, offsetX: number = 0, offsetY: number = 0): Model {
        let texture = this.textureMap.get(modelTexture);
        if (!texture) {
            texture = this.loadTexture(modelTexture);
            this.textureMap.set(modelTexture, texture);
        }

        const w = spriteInfo.width;
        const h = spriteInfo.height;
        const modelData: IModelData = {
            positions: [offsetX + 0, offsetY + 0, 0, offsetX + w, offsetY + 0, 0, offsetX + 0, offsetY + h, 0, offsetX + w, offsetY + h, 0],
            texture: modelTexture,
            center: { x: 0, y: 0 },
            indices: [0, 1, 2, 2, 1, 3],
            textureCoords: [spriteInfo.tX, spriteInfo.tY, spriteInfo.tX + spriteInfo.tW, spriteInfo.tY, spriteInfo.tX, spriteInfo.tY + spriteInfo.tH, spriteInfo.tX + spriteInfo.tW, spriteInfo.tY + spriteInfo.tH],
            transparent: true,
        };

        const result = new Model(this.gl, modelData, texture);
        return result;
    }

    public update(time: number) {
        for (const block of this.blocks) {
            block.update(time);
        }
    }

    public render(item: unknown): void {
        let model: Model | null = null;
        if (item instanceof Model) {
            model = item;
        } else if (item instanceof TextBuffer) {
            model = item.model;
        } else if (item instanceof Sprite) {
            model = item.model;
        }

        if (model) {
            model.draw(this.gl, this.vertexPositionLocation, this.textureCoordLocation, this.useAlphaLocation);
        }
    }

    public getViewSize(): [number, number] {
        return [this.width, this.height];
    }

    public clip(area: [number, number, number, number] | null): void {
        if (area) {
            const y = this.height - (area[1] + area[3]);
            this.gl.scissor(area[0], y, area[2], area[3]);
            this.gl.enable(WebGLRenderingContext.SCISSOR_TEST);
        } else {
            this.gl.disable(WebGLRenderingContext.SCISSOR_TEST);
        }
    }
}

////interface IGuiModel {
////    origin: { x: number, y: number };
////    horizontalAlign: HorizontalAlign;
////    verticalAlign: VerticalAlign;
////    spriteLocation: ISpriteLocation;
////    texture: HTMLCanvasElement | HTMLImageElement;
////}

export interface IRenderer extends IBaseRenderer {
    readonly worldEntities: Entity[];
    readonly guiEntities: Entity[];

    update(time: number): void;
    setCamera(position: [number, number, number]): void;
    getViewSize(): [number, number];
    render(model: Model): void;
    render(sprite: Sprite): void;
    render(textBuffer: ITextBuffer): void;
    clip(area: [number, number, number, number] | null): void;
    createModel(modelData: IModelData): void;
    createModelFromSprite(spriteInfo: ISpriteLocation, modelTexture: HTMLImageElement | HTMLCanvasElement, offsetX?: number, offsetY?: number): Model;
    
}

export interface ITextBufferOptions {
    horizontalAlign?: HorizontalAlign;
    verticalAlign?: VerticalAlign;
    wordWrap?: boolean;
}