import { IDrawable } from "./Model";
import { Program } from "./WebGlBaseRenderer";

export default class WireframeModel implements IDrawable {
    private gl: WebGLRenderingContext;
    private vertexPositionBuffer: WebGLBuffer;
    private indexBuffer: WebGLBuffer;
    private elementCount: number = 0;

    constructor(gl: WebGLRenderingContext) {
        this.gl = gl;
        let buffer = gl.createBuffer();
        if (!buffer) {
            throw new Error("Failed to create buffer");
        }

        this.vertexPositionBuffer = buffer;
        buffer = gl.createBuffer();
        if (!buffer) {
            throw new Error("Failed to create buffer");
        }

        this.indexBuffer = buffer;
    }

    public center: { x: number, y: number, z: number } = { x: 0, y: 0, z: 0 };

    public setData(positions: number[], indices: number[]) {
        this.gl.bindBuffer(WebGLRenderingContext.ARRAY_BUFFER, this.vertexPositionBuffer);
        this.gl.bufferData(WebGLRenderingContext.ARRAY_BUFFER, new Float32Array(positions), WebGLRenderingContext.STATIC_DRAW);

        this.gl.bindBuffer(WebGLRenderingContext.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        this.gl.bufferData(WebGLRenderingContext.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), WebGLRenderingContext.STATIC_DRAW);
        this.elementCount = indices.length;
    }

    public draw(gl: WebGLRenderingContext, program: Program): void {
        program.useSolidColor = true;
        program.solidColor = [1, 0, 0];

        program.bindLocationBuffer(this.vertexPositionBuffer);

        gl.bindBuffer(WebGLRenderingContext.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.drawElements(WebGLRenderingContext.LINES, this.elementCount, WebGLRenderingContext.UNSIGNED_SHORT, 0);
    }
}