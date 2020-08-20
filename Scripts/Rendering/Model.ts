export default class Model {
    private gl: WebGLRenderingContext;
    private vertexPositionBuffer: WebGLBuffer;
    private vertexTextureBuffer: WebGLBuffer;
    private indexBuffer: WebGLBuffer;
    private texture: WebGLTexture = null!;
    private elementCount: number = 0;
    private transparent: boolean = false;

    constructor(gl: WebGLRenderingContext);
    constructor(gl: WebGLRenderingContext, modelData: IModelData, texture: WebGLTexture);
    constructor(gl: WebGLRenderingContext, modelData?: IModelData, texture?: WebGLTexture) {
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

        this.vertexTextureBuffer = buffer;
        buffer = gl.createBuffer();
        if (!buffer) {
            throw new Error("Failed to create buffer");
        }

        this.indexBuffer = buffer;
        if (modelData && texture) {
            this.center = modelData.center;
            this.updateModel(modelData, texture);
        }
    }

    public updateModel(modelData: Partial<IModelData>, texture?: WebGLTexture) {
        if (modelData.positions) {
            this.gl.bindBuffer(WebGLRenderingContext.ARRAY_BUFFER, this.vertexPositionBuffer);
            this.gl.bufferData(WebGLRenderingContext.ARRAY_BUFFER, new Float32Array(modelData.positions), WebGLRenderingContext.STATIC_DRAW);
        }


        if (modelData.textureCoords) {
            this.gl.bindBuffer(WebGLRenderingContext.ARRAY_BUFFER, this.vertexTextureBuffer);
            this.gl.bufferData(WebGLRenderingContext.ARRAY_BUFFER, new Float32Array(modelData.textureCoords), WebGLRenderingContext.STATIC_DRAW);
        }

        if (modelData.indices) {
            this.gl.bindBuffer(WebGLRenderingContext.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
            this.gl.bufferData(WebGLRenderingContext.ELEMENT_ARRAY_BUFFER, new Uint16Array(modelData.indices), WebGLRenderingContext.STATIC_DRAW);
            this.elementCount = modelData.indices.length;
        }

        if (typeof modelData.transparent === "boolean") {
            this.transparent = !!modelData.transparent;
        }

        if (texture) {
            this.texture = texture;
        }
    }

    public center: { x: number, y: number } = { x: 0, y: 0 };

    public draw(gl: WebGLRenderingContext, vertexPositionAttribute: number, vertexTextureAttribute: number, transparentUniformLocation: WebGLUniformLocation | null): void {
        if (transparentUniformLocation) {
            gl.uniform1i(transparentUniformLocation, this.transparent ? 1 : 0);
        }

        gl.bindTexture(WebGLRenderingContext.TEXTURE_2D, this.texture);

        gl.bindBuffer(WebGLRenderingContext.ARRAY_BUFFER, this.vertexPositionBuffer);
        gl.vertexAttribPointer(vertexPositionAttribute, 3, WebGLRenderingContext.FLOAT, false, 0, 0);

        gl.bindBuffer(WebGLRenderingContext.ARRAY_BUFFER, this.vertexTextureBuffer);
        gl.vertexAttribPointer(vertexTextureAttribute, 2, WebGLRenderingContext.FLOAT, false, 0, 0);

        gl.bindBuffer(WebGLRenderingContext.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.drawElements(WebGLRenderingContext.TRIANGLES, this.elementCount, WebGLRenderingContext.UNSIGNED_SHORT, 0);
    }
}

export interface IModelData {
    center: { readonly x: number, readonly y: number };
    positions: readonly number[];
    textureCoords: readonly number[];
    indices: readonly number[];
    transparent?: boolean;
    texture: HTMLCanvasElement | HTMLImageElement | ImageData;
}
