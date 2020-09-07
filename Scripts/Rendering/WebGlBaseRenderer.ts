import * as Shaders from "./Shaders";
import TextBuffer, { ITextBuffer } from "./TextBuffer";
import { IFont } from "../DataReaders/Interfaces";
import { ITextBufferOptions } from "./WebGlCityRenderer";
import Model, { IModelData } from "./Model";
import { mat4, vec3 } from "gl-matrix";

export default class WebGlBaseRenderer implements IBaseRenderer {
    protected canvas: HTMLCanvasElement;
    protected gl: WebGL2RenderingContext;
    protected program: Program;
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
        this.program = new Program(this.gl, this.createProgram());

        this.resized();

        // View is identity for now. Possibly will be removed later if not needed.

        this.gl.enable(WebGLRenderingContext.CULL_FACE);
        this.gl.cullFace(WebGLRenderingContext.FRONT);

        this.gl.depthFunc(WebGLRenderingContext.LESS);

        this.gl.activeTexture(WebGLRenderingContext.TEXTURE0);
        this.program.sampler = 0;

        this.gl.enable(WebGLRenderingContext.BLEND);
        this.gl.blendFunc(WebGLRenderingContext.SRC_ALPHA, WebGLRenderingContext.ONE_MINUS_SRC_ALPHA);
    }

    public resized(): [number, number] {
        this.width = this.canvas.offsetWidth;
        this.height = this.canvas.offsetHeight;
        this.canvas.width = this.width * window.devicePixelRatio;
        this.canvas.height = this.height * window.devicePixelRatio;
        this.gl.viewport(0, 0, this.width * window.devicePixelRatio, this.height * window.devicePixelRatio);
        return [this.width, this.height];
    }

    public getViewSize(): [number, number] {
        return [this.width, this.height];
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

    public createTextBuffer(x: number, y: number, width: number, height: number, font: IFont, options?: ITextBufferOptions): TextBuffer {
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

export class Program {
    private readonly gl: WebGL2RenderingContext;
    private readonly program: WebGLProgram;
    private readonly samplerLocation: WebGLUniformLocation | null;
    private readonly projectionMatrixLocation: WebGLUniformLocation | null;
    private readonly worldMatrixLocation: WebGLUniformLocation | null;
    private readonly viewMatrixLocation: WebGLUniformLocation | null;
    private readonly solidColorLocation: WebGLUniformLocation | null;
    private readonly useAlphaLocation: WebGLUniformLocation | null;
    private readonly useSolidColorLocation: WebGLUniformLocation | null;
    private readonly vertexPositionLocation: number;
    private readonly textureCoordLocation: number;

    constructor(gl: WebGL2RenderingContext, program: WebGLProgram) {
        this.gl = gl;
        this.program = program;

        this.samplerLocation = this.gl.getUniformLocation(this.program, "sampler");
        this.projectionMatrixLocation = this.gl.getUniformLocation(this.program, "projectionMatrix");
        this.worldMatrixLocation = this.gl.getUniformLocation(this.program, "worldMatrix");
        this.viewMatrixLocation = this.gl.getUniformLocation(this.program, "viewMatrix");
        this.solidColorLocation = this.gl.getUniformLocation(this.program, "solidColor");
        this.useAlphaLocation = this.gl.getUniformLocation(this.program, "useAlpha");
        this.useSolidColorLocation = this.gl.getUniformLocation(this.program, "useSolidColor");

        this.vertexPositionLocation = this.gl.getAttribLocation(this.program, "vertexPosition");
        this.textureCoordLocation = this.gl.getAttribLocation(this.program, "textureCoord");

        this.gl.enableVertexAttribArray(this.vertexPositionLocation);
        this.gl.enableVertexAttribArray(this.textureCoordLocation);
    }

    public set sampler(value: number) {
        this.gl.uniform1i(this.samplerLocation, value);
    }

    public set projectionMatrix(value: mat4) {
        this.gl.uniformMatrix4fv(this.projectionMatrixLocation, false, value);
    }

    public set worldMatrix(value: mat4) {
        this.gl.uniformMatrix4fv(this.worldMatrixLocation, false, value);
    }

    public set viewMatrix(value: mat4) {
        this.gl.uniformMatrix4fv(this.viewMatrixLocation, false, value);
    }

    public set solidColor(value: vec3) {
        this.gl.uniform3fv(this.solidColorLocation, value);
    }

    public set useSolidColor(value: boolean) {
        if (this.useSolidColorLocation) {
            this.gl.uniform1i(this.useSolidColorLocation, value ? 1 : 0);
        }
    }

    public set transparent(value: boolean) {
        if (this.useAlphaLocation) {
            this.gl.uniform1i(this.useAlphaLocation, value ? 1 : 0);
        }
    }

    public bindLocationBuffer(buffer: WebGLBuffer): void {
        this.gl.bindBuffer(WebGLRenderingContext.ARRAY_BUFFER, buffer);
        this.gl.vertexAttribPointer(this.vertexPositionLocation, 3, WebGLRenderingContext.FLOAT, false, 0, 0);
    }

    public bindTextureBuffer(buffer: WebGLBuffer): void {
        this.gl.bindBuffer(WebGLRenderingContext.ARRAY_BUFFER, buffer);
        this.gl.vertexAttribPointer(this.textureCoordLocation, 2, WebGLRenderingContext.FLOAT, false, 0, 0);
    }
}

export interface IBaseRenderer {
    getViewSize(): [number, number];
    resized(): [number, number];
    createTextModel(modelData: IModelData): Model;
    createTextBuffer(x: number, y: number, width: number, height: number, font: IFont, options?: ITextBufferOptions): ITextBuffer;
}