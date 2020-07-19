import { mat4 } from "gl-matrix";
import Style, { ISpriteLocation } from "../DataReaders/Style";
import GameMap from "../DataReaders/GameMap";
import Font from "../DataReaders/Font";
import Entity from "../Entity";
import Model, { IModelData } from "./Model";
import TextBuffer, { ITextBuffer } from "./TextBuffer";
import { HorizontalAlign, VerticalAlign, Point } from "../Types";
import * as Shaders from "./Shaders";
import Sprite from "../Sprite";

const blockSize = 16;
export default class WebGlRenderer implements IRenderer {
    private canvas: HTMLCanvasElement;
    private gl: WebGLRenderingContext;
    private program: WebGLProgram;
    private models: Model[] = [];
    private samplerLocation: WebGLUniformLocation | null;
    private projectionMatrixLocation: WebGLUniformLocation | null;
    private worldMatrixLocation: WebGLUniformLocation | null;
    private viewMatrixLocation: WebGLUniformLocation | null;
    private useAlphaLocation: WebGLUniformLocation | null;
    private vertexPositionLocation: number;
    private textureCoordLocation: number;
    private textureMap = new Map<HTMLCanvasElement | HTMLImageElement, WebGLTexture>();
    private width = 1;
    private height = 1;

    public x: number = 0;
    public y: number = 0;
    public altitude: number = 20;
    public readonly worldEntities: Entity[] = [];
    public readonly guiEntities: Entity[] = [];

    constructor(canvas: HTMLCanvasElement) {
        const gl = canvas.getContext("webgl");
        if (!gl) {
            throw new Error("Failed to get context");
        }

        this.gl = gl;
        this.canvas = canvas;
        this.program = this.createProgram();

        this.samplerLocation = this.gl.getUniformLocation(this.program, "sampler");
        this.projectionMatrixLocation = this.gl.getUniformLocation(this.program, "projectionMatrix");
        this.worldMatrixLocation = this.gl.getUniformLocation(this.program, "worldMatrix");
        this.viewMatrixLocation = this.gl.getUniformLocation(this.program, "viewMatrix");
        this.useAlphaLocation = this.gl.getUniformLocation(this.program, "useAlpha");

        this.vertexPositionLocation = this.gl.getAttribLocation(this.program, "vertexPosition");
        this.textureCoordLocation = this.gl.getAttribLocation(this.program, "textureCoord");

        this.gl.enableVertexAttribArray(this.vertexPositionLocation);
        this.gl.enableVertexAttribArray(this.textureCoordLocation);
        this.resized();

        // View is identity for now. Possibly will be removed later if not needed.

        this.gl.enable(WebGLRenderingContext.CULL_FACE);
        this.gl.cullFace(WebGLRenderingContext.FRONT);

        this.gl.depthFunc(WebGLRenderingContext.LESS);

        this.gl.activeTexture(WebGLRenderingContext.TEXTURE0);
        this.gl.uniform1i(this.samplerLocation, 0);
        
        this.gl.enable(WebGLRenderingContext.BLEND);
        this.gl.blendFunc(WebGLRenderingContext.SRC_ALPHA, WebGLRenderingContext.ONE_MINUS_SRC_ALPHA);
    }

    public renderScene() {
        const projection = mat4.perspective(mat4.create(), 0.84, this.width / this.height, 0.1, 6400);
        const world = mat4.lookAt(mat4.create(), [0, 0, -this.altitude], [0, 0, 0], [0, -1, 0]);
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
                mat4.translate(view, view, [entity.x * 64 - this.x, this.y - entity.y * 64, -255]);
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

    public resized() {
        this.width = this.canvas.offsetWidth;
        this.height = this.canvas.offsetHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.gl.viewport(0, 0, this.width, this.height);
        //if (this.subtitleBuffer) {
        //    this.subtitleBuffer.setLocation(40, this.height - 45, this.width - 50, 45);
        //    this.locationBuffer.setLocation(0, 0, this.width, 100);
        //    this.pointBuffer.setLocation(0, 0, this.width, 100);
        //}
    }

    public buildCityModel(map: GameMap, style: Style) {
        const bigTexture = document.createElement("canvas");
        bigTexture.width = 2048;
        bigTexture.height = 2048;
        const bigContext = bigTexture.getContext("2d");
        if (!bigContext) {
            throw new Error(":(");
        }

        const pager = style.spritePosition(29);
        const pagerLight = style.spritePosition(30);

        bigContext.fillStyle = "rgb(0,0,0,0.0)";
        bigContext.fillRect(0, 0, 2048, 2048);

        const tileCount = style.sideTiles + style.lidTiles + style.auxTiles;
        const tilesPerRow = 24;
        const multiplier = 2048 / 24; // = 85,333333333333333333333333333333
        const margin = (multiplier - 64) / 2
        for (let i = 0; i < tileCount; i++) {
            const x = margin + Math.floor(i % tilesPerRow) * multiplier;
            const y = margin + Math.floor(i / tilesPerRow) * multiplier;
            bigContext.drawImage(style.tiles[i], 0,  0,  1, 1, x - margin, y - margin, margin, margin);
            bigContext.drawImage(style.tiles[i], 63, 0,  1, 1, x + 64, y - margin, margin, margin);
            bigContext.drawImage(style.tiles[i], 0,  63, 1, 1, x - margin, y + 64, margin, margin);
            bigContext.drawImage(style.tiles[i], 63, 63, 1, 1, x + 64, y + 64, margin, margin);

            bigContext.drawImage(style.tiles[i], 0, 0, 64, 1, x, y - margin, 64, margin);
            bigContext.drawImage(style.tiles[i], 0, 0, 1, 64, x - margin, y, margin, 64);
            bigContext.drawImage(style.tiles[i], 0, 63, 64, 1, x, y + 64, 64, margin);
            bigContext.drawImage(style.tiles[i], 63, 0, 1, 64, x + 64, y, margin, 64);

            bigContext.drawImage(style.tiles[i], x, y);
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

        const models: Model[] = [];
        const min = -(blockSize / 2);
        const max = 256 + (blockSize / 2);
        for (let f = 0; f < 2; f++) {
            for (let yy = min; yy < max; yy += blockSize) {
                for (let xx = min; xx < max; xx += blockSize) {
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
                                    const start = modelData.positions.length / 3;
                                    modelData.positions.push(
                                        ...topNorthWest,
                                        ...topNorthEast,
                                        ...topSouthWest,
                                        ...topSouthEast);
                                    const tileIndex = style.sideTiles + block.lid;
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

                                    const tileIndex = block.bottom;
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
                                    const tileIndex = block.right;
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
                                    const start = modelData.positions.length / 3;
                                    modelData.positions.push(
                                        ...topNorthWest,
                                        ...topSouthWest,
                                        ...bottomNorthWest,
                                        ...bottomSouthWest);
                                    const tileIndex = block.left;
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
                                    const start = modelData.positions.length / 3;
                                    modelData.positions.push(
                                        ...topNorthEast,
                                        ...topNorthWest,
                                        ...bottomNorthEast,
                                        ...bottomNorthWest);
                                    const tileIndex = block.top;
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

                    this.createModel(modelData);
                }
            }
        }
    }

    public setCamera(position: [number, number, number]): void {
        this.x = position[0];
        this.y = position[1];
        this.altitude = position[2];
    }

    private createProgram() {
        var vertShader = this.gl.createShader(WebGLRenderingContext.VERTEX_SHADER);
        if (!vertShader) {
            throw new Error("Failed to create GL vertex shader");
        }

        this.gl.shaderSource(vertShader, Shaders.vertexData);
        this.gl.compileShader(vertShader);

        if (!this.gl.getShaderParameter(vertShader, WebGLRenderingContext.COMPILE_STATUS)) {
            throw new Error(this.gl.getShaderInfoLog(vertShader) ?? "Generic error while compiling GL vertex shader.");
        }

        var fragShader = this.gl.createShader(WebGLRenderingContext.FRAGMENT_SHADER);
        if (!fragShader) {
            throw new Error("Failed to create GL fragment shader");
        }

        this.gl.shaderSource(fragShader, Shaders.fragmentData);
        this.gl.compileShader(fragShader);

        if (!this.gl.getShaderParameter(fragShader, WebGLRenderingContext.COMPILE_STATUS)) {
            throw new Error(this.gl.getShaderInfoLog(fragShader) ?? "Generic error while compiling GL fragment shader.");
        }

        var program = this.gl.createProgram();
        if (!program) {
            throw new Error("Failed to create GL program.");
        }
        this.gl.attachShader(program, vertShader);
        this.gl.attachShader(program, fragShader);
        this.gl.linkProgram(program);

        if (!this.gl.getProgramParameter(program, WebGLRenderingContext.LINK_STATUS)) {
            throw new Error(this.gl.getProgramInfoLog(program) ?? "Generic error while compiling GL program.");
        }

        this.gl.useProgram(program);
        return program;
    }

    public loadTexture(textureData: HTMLCanvasElement | HTMLImageElement): WebGLTexture {
        let texture = this.textureMap.get(textureData);
        if (!texture) {
            const newTexture = this.gl.createTexture();
            if (!newTexture) {
                throw new Error("Can't create texture");
            }

            this.gl.bindTexture(WebGLRenderingContext.TEXTURE_2D, newTexture);
            this.gl.texImage2D(WebGLRenderingContext.TEXTURE_2D, 0, WebGLRenderingContext.RGBA, WebGLRenderingContext.RGBA, WebGLRenderingContext.UNSIGNED_BYTE, textureData);
            this.gl.texParameteri(WebGLRenderingContext.TEXTURE_2D, WebGLRenderingContext.TEXTURE_MAG_FILTER, WebGLRenderingContext.NEAREST);
            this.gl.texParameteri(WebGLRenderingContext.TEXTURE_2D, WebGLRenderingContext.TEXTURE_MIN_FILTER, WebGLRenderingContext.NEAREST);
            this.gl.texParameteri(WebGLRenderingContext.TEXTURE_2D, WebGLRenderingContext.TEXTURE_WRAP_S, WebGLRenderingContext.CLAMP_TO_EDGE);
            this.gl.texParameteri(WebGLRenderingContext.TEXTURE_2D, WebGLRenderingContext.TEXTURE_WRAP_T, WebGLRenderingContext.CLAMP_TO_EDGE);
            texture = newTexture;
            this.textureMap.set(textureData, newTexture);
        }

        return texture;
    }

    public createModel(modelData: IModelData) {
        let texture = this.textureMap.get(modelData.texture);
        if (!texture) {
            texture = this.loadTexture(modelData.texture);
            this.textureMap.set(modelData.texture, texture);
        }

        this.models.push(new Model(this.gl, modelData, texture));
    }

    public createTextModel(modelData: IModelData): Model {
        let texture = this.textureMap.get(modelData.texture);
        if (!texture) {
            texture = this.loadTexture(modelData.texture);
            this.textureMap.set(modelData.texture, texture);
        }

        const result = new Model(this.gl, modelData, texture);
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

    public createTextBuffer(x: number, y: number, width: number, height: number, font: Font, options?: ITextBufferOptions): TextBuffer {
        return new TextBuffer(this, font, x, y, width, height, options);
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

export interface IRenderer {
    readonly worldEntities: Entity[];
    readonly guiEntities: Entity[];

    setCamera(position: [number, number, number]): void;
    getViewSize(): [number, number];
    render(model: Model): void;
    render(sprite: Sprite): void;
    render(textBuffer: ITextBuffer): void;
    clip(area: [number, number, number, number] | null): void;
    createModel(modelData: IModelData): void;
    createModelFromSprite(spriteInfo: ISpriteLocation, modelTexture: HTMLImageElement | HTMLCanvasElement, offsetX?: number, offsetY?: number): Model;
    createTextBuffer(x: number, y: number, width: number, height: number, font: Font, options?: ITextBufferOptions): ITextBuffer;
}

export interface ITextBufferOptions {
    horizontalAlign?: HorizontalAlign;
    verticalAlign?: VerticalAlign;
    wordWrap?: boolean;
}