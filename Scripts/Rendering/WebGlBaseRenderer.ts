import * as Shaders from "./Shaders";
import TextBuffer, { ITextBuffer } from "./TextBuffer";
import Font from "../DataReaders/Font";
import { ITextBufferOptions } from "./WebGlCityRenderer";
import Model, { IModelData } from "./Model";

export default class WebGlBaseRenderer implements IBaseRenderer {
    protected canvas: HTMLCanvasElement;
    protected gl: WebGL2RenderingContext;
    protected program: WebGLProgram;
    protected samplerLocation: WebGLUniformLocation | null;
    protected projectionMatrixLocation: WebGLUniformLocation | null;
    protected worldMatrixLocation: WebGLUniformLocation | null;
    protected viewMatrixLocation: WebGLUniformLocation | null;
    protected useAlphaLocation: WebGLUniformLocation | null;
    protected vertexPositionLocation: number;
    protected textureCoordLocation: number;
    protected width = 320;
    protected height = 240;
    protected textureMap = new Map<HTMLCanvasElement | HTMLImageElement | ImageData, WebGLTexture>();

    constructor(canvas: HTMLCanvasElement) {
        const gl = canvas.getContext("webgl2");
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

    public resized() {
        this.width = this.canvas.offsetWidth;
        this.height = this.canvas.offsetHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.gl.viewport(0, 0, this.width, this.height);
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

    public createTextBuffer(x: number, y: number, width: number, height: number, font: Font, options?: ITextBufferOptions): TextBuffer {
        return new TextBuffer(this, font, x, y, width, height, options);
    }

    protected loadTexture(textureData: HTMLCanvasElement | HTMLImageElement | ImageData): WebGLTexture {
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
}

export interface IBaseRenderer {
    createTextModel(modelData: IModelData): Model;
    createTextBuffer(x: number, y: number, width: number, height: number, font: Font, options?: ITextBufferOptions): ITextBuffer;
}