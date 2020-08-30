import { vec3, vec4, mat4 } from "gl-matrix"

export class PhysicsObject {
    private centerValue: vec3;
    private sizeValue: vec3;
    private rotationValue: mat4;
    private boundingBox: IBoundingBox | null = null;
    private vertices: [vec3, vec3, vec3, vec3, vec3, vec3, vec3, vec3] | null = null;

    constructor(center: vec3, size: vec3, isStatic: boolean) {
        this.centerValue = center;
        this.sizeValue = size;
        this.isStatic = isStatic;
        this.rotationValue = mat4.identity(mat4.create());
        this.speed = [0, 0, 0];
    }

    public get center(): vec3 {
        return this.centerValue;
    }

    public set center(value: vec3) {
        this.centerValue = value;
        this.boundingBox = null;
    }

    public get size(): vec3 {
        return this.sizeValue;
    }

    public set size(value: vec3) {
        this.sizeValue = value;
        this.boundingBox = null;
    }

    public get rotation(): mat4 {
        return this.rotationValue;
    }

    public set rotation(value: mat4) {
        this.rotationValue = value;
        this.boundingBox = null;
    }

    public isStatic: boolean;
    public speed: vec3;

    public getVertices(): [vec3, vec3, vec3, vec3, vec3, vec3, vec3, vec3] {
        let result = this.vertices;
        if (!result) {
            const pt1 = vec4.fromValues(this.size[0], this.size[1], this.size[2], 1);
            const pt2 = vec4.fromValues(-this.size[0], this.size[1], this.size[2], 1);
            const pt3 = vec4.fromValues(this.size[0], -this.size[1], this.size[2], 1);
            const pt4 = vec4.fromValues(-this.size[0], -this.size[1], this.size[2], 1);
            const pt5 = vec4.fromValues(this.size[0], this.size[1], -this.size[2], 1);
            const pt6 = vec4.fromValues(-this.size[0], this.size[1], -this.size[2], 1);
            const pt7 = vec4.fromValues(this.size[0], -this.size[1], -this.size[2], 1);
            const pt8 = vec4.fromValues(-this.size[0], -this.size[1], -this.size[2], 1);

            const pt1Rotated = vec4.transformMat4(vec4.create(), pt1, this.rotation);
            const pt2Rotated = vec4.transformMat4(vec4.create(), pt2, this.rotation);
            const pt3Rotated = vec4.transformMat4(vec4.create(), pt3, this.rotation);
            const pt4Rotated = vec4.transformMat4(vec4.create(), pt4, this.rotation);
            const pt5Rotated = vec4.transformMat4(vec4.create(), pt5, this.rotation);
            const pt6Rotated = vec4.transformMat4(vec4.create(), pt6, this.rotation);
            const pt7Rotated = vec4.transformMat4(vec4.create(), pt7, this.rotation);
            const pt8Rotated = vec4.transformMat4(vec4.create(), pt8, this.rotation);
            return [
                [pt1Rotated[0], pt1Rotated[1], pt1Rotated[2]],
                [pt2Rotated[0], pt2Rotated[1], pt2Rotated[2]],
                [pt3Rotated[0], pt3Rotated[1], pt3Rotated[2]],
                [pt4Rotated[0], pt4Rotated[1], pt4Rotated[2]],
                [pt5Rotated[0], pt5Rotated[1], pt5Rotated[2]],
                [pt6Rotated[0], pt6Rotated[1], pt6Rotated[2]],
                [pt7Rotated[0], pt7Rotated[1], pt7Rotated[2]],
                [pt8Rotated[0], pt8Rotated[1], pt8Rotated[2]],
            ];
        }

        return result;
    }

    public getBoundingBox(): IBoundingBox {
        let result = this.boundingBox;
        if (!result) {
            const vertices = this.getVertices();

            this.boundingBox = result = {
                minX: Math.min(...vertices.map(x => x[0])),
                minY: Math.min(...vertices.map(x => x[1])),
                minZ: Math.min(...vertices.map(x => x[2])),
                maxX: Math.max(...vertices.map(x => x[0])),
                maxY: Math.max(...vertices.map(x => x[1])),
                maxZ: Math.max(...vertices.map(x => x[2])),
            };
        }

        return result;
    }
}

export interface IBoundingBox {
    readonly minX: number;
    readonly minY: number;
    readonly minZ: number;
    readonly maxX: number;
    readonly maxY: number;
    readonly maxZ: number;
}