import WebGlBaseRenderer from "../Rendering/WebGlBaseRenderer";
import { mat4 } from "gl-matrix";
import Model, { IModelData } from "../Rendering/Model";
import TextBuffer, { ITextBuffer } from "../Rendering/TextBuffer";

export default class WebGlMainMenuRenderer extends WebGlBaseRenderer {
    constructor(canvas: HTMLCanvasElement) {
        super(canvas);

        const world = mat4.lookAt(mat4.create(), [0, 0, 10], [0, 0, 0], [0, 1, 0]);
        const view = mat4.identity(mat4.create());

        this.gl.uniformMatrix4fv(this.worldMatrixLocation, false, world);
        this.gl.uniformMatrix4fv(this.viewMatrixLocation, false, view);
        this.gl.clearColor(0, 0, 0, 1);
    }

    public createModelFromImageData(modelTexture: ImageData, offsetX: number = 0, offsetY: number = 0): Model {
        let texture = this.textureMap.get(modelTexture);
        if (!texture) {
            texture = this.loadTexture(modelTexture);
            this.textureMap.set(modelTexture, texture);
        }

        const w = modelTexture.width;
        const h = modelTexture.height;
        const modelData: IModelData = {
            positions: [offsetX + 0, offsetY + 0, 0, offsetX + w, offsetY + 0, 0, offsetX + 0, offsetY + h, 0, offsetX + w, offsetY + h, 0],
            texture: modelTexture,
            center: { x: 0, y: 0 },
            indices: [0, 1, 2, 2, 1, 3],
            textureCoords: [0, 0, 1, 0, 0, 1, 1, 1],
            transparent: false,
        };

        const result = new Model(this.gl, modelData, texture);
        return result;
    }

    public resized() {
        super.resized();

        let width = this.width;
        let height = this.height;
        let fullWidth = this.width;
        let fullHeight = this.height;
        const ratio = width / height;
        const targetRatio = 640 / 480;
        if (ratio < targetRatio) {
            width = 640;
            fullWidth = this.width;
            height = 640 / targetRatio;
            fullHeight = this.width / targetRatio;
        } else {
            width = 480 * targetRatio;
            fullWidth = this.height * targetRatio;
            height = 480;
            fullHeight = this.height;
        }

        const projection = mat4.ortho(mat4.create(), 0, width, height, 0, 0.1, 100);
        this.gl.uniformMatrix4fv(this.projectionMatrixLocation, false, projection);
        this.gl.viewport((this.width - fullWidth) / 2, (this.height - fullHeight) / 2, fullWidth, fullHeight);
    }

    public initRender() {
        this.gl.clear(WebGL2RenderingContext.COLOR_BUFFER_BIT);
    }

    public render(model: Model): void;
    public render(model: ITextBuffer): void;
    public render(model: unknown): void {
        if (model instanceof TextBuffer) {
            model = model.model;
        }

        if (model instanceof Model) {
            const view = mat4.fromTranslation(mat4.identity(mat4.create()), [model.center.x, model.center.y, 0]);
            this.gl.uniformMatrix4fv(this.viewMatrixLocation, false, view);

            model.draw(this.gl, this.vertexPositionLocation, this.textureCoordLocation, this.useAlphaLocation);
        }

    }
}