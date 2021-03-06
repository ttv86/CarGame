import { mat4 } from "gl-matrix";
import { IGameMap, IFont, IStyle, ISpriteLocation } from "../DataReaders/Interfaces";
import Entity from "../Entity";
import Model, { IModelData, IDrawable } from "./Model";
import TextBuffer, { ITextBuffer } from "./TextBuffer";
import { HorizontalAlign, VerticalAlign, Point } from "../Types";
import Sprite from "../Sprite";
import CityBlock from "./CityBlock";
import WebGlBaseRenderer, { IBaseRenderer } from "./WebGlBaseRenderer";
import WireframeModel from "./WireframeModel";
import { PhysicsObject } from "../PhysicsSystem";
import GuiWidget from "../GuiWidgets/GuiWidget";

const blockSize = 16;
export default class WebGlRenderer extends WebGlBaseRenderer implements IRenderer {
    private models: Model[] = [];
    private blocks: CityBlock[] = [];
    private tileTexture: WebGLTexture | null = null;
    private spriteTexture: WebGLTexture | null = null;
    private spriteModels = new Map<number, Model>();
    private readonly style: IStyle;

    public x: number = 0;
    public y: number = 0;
    public altitude: number = 20;
    public readonly debugModels: WireframeModel[] = [];
    public readonly worldEntities: Entity[] = [];
    //public readonly guiEntities: Entity[] = [];
    public guiWidgets: GuiWidget[] = [];

    //private wireframe: WireframeModel;
    //private obj: PhysicsObject;
    //private objR: number = 0;

    constructor(canvas: HTMLCanvasElement, style: IStyle) {
        super(canvas);
        this.style = style;
        ////const po = new PhysicsObject([105 * 64, 119 * 64, 4 * 64], [2, 2, 2]);
        //this.wireframe = new WireframeModel(this.gl);
        ////wireframe.setData([105 * 64, 119 * 64, 0 * 64, 106 * 64, 120 * 64, 5 * 64], [0, 1]);
        //const numbers1: number[] = [
        //    0, 0, 0,
        //    0, 0, -256,

        //    0, 64, 0,
        //    0, 64, -256,
        //    -192, 64, -256,
        //    -192, 64, 0,
        //];
        //const numbers2: number[] = [0, 1, 2, 3, 3, 4, 4, 5];

        //this.obj = new PhysicsObject([0, 0, 0], [32, 32, 32], true);
        
        //this.wireframe.center = { x: 106.5 * 64, y: 119.5 * 64, z: 2 * 64 };
        //this.wireframe.setData(numbers1, numbers2);
        //this.debugModels.push(this.wireframe);
    }

    public renderScene() {

        //this.objR += 0.01;
        //this.obj.rotation = mat4.fromRotation(mat4.create(), this.objR, [0, 0, 1]);

        //const bb = this.obj.getBoundingBox();
        //const vv = this.obj.getVertices();
        //this.wireframe.setData([
        //    ...vv[0],
        //    ...vv[1],
        //    ...vv[2],
        //    ...vv[3],
        //    ...vv[4],
        //    ...vv[5],
        //    ...vv[6],
        //    ...vv[7],
        //    bb.minX, bb.minY, bb.minZ,
        //    bb.maxX, bb.minY, bb.minZ,
        //    bb.minX, bb.maxY, bb.minZ,
        //    bb.maxX, bb.maxY, bb.minZ,
        //    bb.minX, bb.minY, bb.maxZ,
        //    bb.maxX, bb.minY, bb.maxZ,
        //    bb.minX, bb.maxY, bb.maxZ,
        //    bb.maxX, bb.maxY, bb.maxZ,
        //], [
        //        0, 1, 1, 3, 3, 2, 2, 0,
        //        4, 5, 5, 7, 7, 6, 6, 4,
        //        0, 4, 1, 5, 2, 6, 3, 7,

        //         8,  9,  9, 11, 11, 10, 10,  8,
        //        12, 13, 13, 15, 15, 14, 14, 12,
        //         8, 12,  9, 13, 10, 14, 11, 15
        //]);

        const [, , cameraZ] = this.coordinateToWorldPoint(0, 0, this.altitude);
        const projection = mat4.perspective(mat4.create(), 0.84, this.width / this.height, 0.1, 6400);
        const world = mat4.lookAt(mat4.create(), [0, 0, cameraZ], [0, 0, -cameraZ], [0, -1, 0]);
        this.program.projectionMatrix = projection;
        this.program.worldMatrix = world;

        this.gl.enable(WebGLRenderingContext.DEPTH_TEST);

        const view = mat4.create();
        for (const model of this.models) {
            //const dist = Math.sqrt(Math.pow(model.center.x - this.x, 2) + Math.pow(model.center.y - this.y, 2));
            const dist = Math.abs(model.center.x - this.x) + Math.abs(model.center.y - this.y);
            if (dist < 2000) {
                mat4.identity(view);
                mat4.translate(view, view, [-this.x, this.y, 0]);
                this.program.viewMatrix = view;
                model.draw(this.gl, this.program);
            }
        }

        for (const entity of this.worldEntities) {
            //if (entity.visible) {
            mat4.identity(view);
            const worldPoint = this.coordinateToWorldPoint(entity.x, entity.y, entity.z + entity.depth);
            mat4.translate(view, view, [worldPoint[0] - this.x, this.y - worldPoint[1], -worldPoint[2]]);
                mat4.rotateZ(view, view, entity.rotation);
                //mat4.translate(view, view, [-entity.width / 2, entity.height / 2, 0]);

            this.program.viewMatrix = view;
            this.renderEntity(entity);
                //entity.render();
            //}
        }

        //// vvvvvv DEBUG vvvvvv
        //mat4.identity(view);
        //this.program.viewMatrix = view;
        ////this.gl.disable(WebGLRenderingContext.DEPTH_TEST);
        //for (const model of this.debugModels) {
        //    mat4.identity(view);
        //    mat4.translate(view, view, [model.center.x - this.x, this.y - model.center.y, -model.center.z]);
        //    this.program.viewMatrix = view;

        //    this.render(model);
        //}

        //// ^^^^^^ DEBUG ^^^^^^

        mat4.identity(view);
        this.program.viewMatrix = view;

        mat4.ortho(projection, 0, this.width, this.height, 0, 0.1, 100);
        mat4.lookAt(world, [0, 0, 10], [0, 0, 0], [0, 1, 0]);
        this.program.projectionMatrix = projection;
        this.program.worldMatrix = world;

        this.gl.disable(WebGLRenderingContext.DEPTH_TEST);

        for (const guiWidget of this.guiWidgets) {
            guiWidget.renderIfVisible();
        }

        //for (const entity of this.guiEntities) {
        //    //if (entity.visible) {
        //        mat4.lookAt(world, [-entity.x, -entity.y, 10], [-entity.x, -entity.y, 0], [0, 1, 0]);
        //        this.program.worldMatrix = world;
        //        entity.render();
        //    //}
        //}
    }

    public buildCityModel(map: IGameMap, style: IStyle) {
        this.tileTexture = this.loadTexture(style.tileImageData);
        this.spriteTexture = this.loadTexture(style.spriteImageData);

        const tileSize = (1 / 32);

        const min = -(blockSize / 2);
        const maxX = map.width + (blockSize / 2);
        const maxY = map.height + (blockSize / 2);
        for (let yy = min; yy < maxY; yy += blockSize) {
            for (let xx = min; xx < maxX; xx += blockSize) {
                this.blocks.push(new CityBlock(this, map, style, blockSize, 0, 10, xx, yy, tileSize, 1, style.tileImageData, new Map<string, number>()));
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

    public createModelFromSprite(spriteInfo: ISpriteLocation, modelTexture: HTMLImageElement | HTMLCanvasElement | ImageData, centered: boolean = false, ratio: number = 1): Model {
        let texture = this.textureMap.get(modelTexture);
        if (!texture) {
            texture = this.loadTexture(modelTexture);
            this.textureMap.set(modelTexture, texture);
        }

        const w = spriteInfo.width;
        const h = spriteInfo.height;
        const offsetX = centered ? (-w / 2) : 0;
        const offsetY = centered ? (-h / 2) : 0;
        const modelData: IModelData = {
            positions: [
                (offsetX + 0) * ratio, (offsetY + 0) * ratio, 0,
                (offsetX + w) * ratio, (offsetY + 0) * ratio, 0,
                (offsetX + 0) * ratio, (offsetY + h) * ratio, 0,
                (offsetX + w) * ratio, (offsetY + h) * ratio, 0],
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
        let model: IDrawable | null = null;
        if (item instanceof Model) {
            model = item;
        } else if (item instanceof WireframeModel) {
            model = item;
        } else if (item instanceof TextBuffer) {
            model = item.model;
        } else if (item instanceof Sprite) {
            model = item.model;
        }

        if (model) {
            model.draw(this.gl, this.program);
        }
    }

    public renderSprite(model: Model, x: number, y: number): void;
    public renderSprite(model: Model, x: number, y: number, width: number, height: number): void;
    public renderSprite(model: Model, x: number, y: number, width?: number, height?: number): void {
        const world = mat4.lookAt(mat4.create(), [-x, -y, 10], [-x, -y, 0], [0, 1, 0]);
        this.program.worldMatrix = world;
        this.render(model);
    }

    public resetWorldMatrix(): void {
        const world = mat4.lookAt(mat4.create(), [0, 0, 10], [0, 0, 0], [0, 1, 0]);
        this.program.worldMatrix = world;
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

    public coordinateToWorldPoint(x: number, y: number, z: number): Point {
        return [x, y, 0 - z];
    }

    private renderEntity(entity: Entity) {
        const spriteIndex = entity.getSpriteIndex()
        if (typeof spriteIndex === "number") {
            const model = this.getSpriteModel(spriteIndex);
            model.draw(this.gl, this.program);
        }
    }

    private getSpriteModel(spriteIndex: number): Model {
        let result = this.spriteModels.get(spriteIndex);
        if (!result) {
            const pos = this.style.getSpritePosition(spriteIndex);
            if (!pos) {
                throw new Error("Can't find sprite");
            }

            result = this.createModelFromSprite(pos, this.style.spriteImageData, true, 1 / 64);
            this.spriteModels.set(spriteIndex, result);
        }

        return result;
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
    //readonly guiEntities: Entity[];
    guiWidgets: readonly GuiWidget[];

    buildCityModel(map: IGameMap, style: IStyle): void;
    update(time: number): void;
    setCamera(position: [number, number, number]): void;
    renderScene(): void;
    render(model: Model): void;
    render(sprite: Sprite): void;
    render(textBuffer: ITextBuffer): void;
    resetWorldMatrix(): void;
    renderSprite(model: Model, x: number, y: number): void;
    renderSprite(model: Model, x: number, y: number, width: number, height: number): void;
    clip(area: [number, number, number, number] | null): void;
    createModel(modelData: IModelData): Model;
    createModelFromSprite(spriteInfo: ISpriteLocation, modelTexture: HTMLImageElement | HTMLCanvasElement | ImageData, centered?: boolean, ratio?: number): Model;
    
}

export interface ITextBufferOptions {
    horizontalAlign?: HorizontalAlign;
    verticalAlign?: VerticalAlign;
    wordWrap?: boolean;
}