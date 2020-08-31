import { IGameMap, ILight, IArea, IBlock, ILid, IWall, Collision, TextureTransform } from "../Interfaces";
import { BinaryReader } from "../BinaryReader";

export default class GameMap implements IGameMap {
    private readonly blocks: (IBlock | null)[][][] = [];

    constructor(data: DataView) {
        this.areas = [];
        this.lights = [];

        const reader = new BinaryReader(data);
        const magic = reader.readString(4);
        const version = reader.readUint16();
        if ((magic !== "GBMP") || (version !== 500)) {
            throw new Error("Invalid map file");
        }

        while (reader.position < reader.length) {
            const blockType = reader.readString(4);
            const blockSize = reader.readUint32();
            switch (blockType) {
                case "DMAP":
                    const end = reader.position + blockSize;
                    this.blocks = this.readBlocks(reader);
                    reader.position = end;
                    break;
                default:
                    console.log(`${blockType}: ${blockSize}`);
                    reader.position += blockSize;
                    break;
            }
        }
    }

    public readonly width: number = 256;
    public readonly height: number = 256;
    public readonly maxAltitude: number = 8;
    public readonly areas: readonly IArea[];
    public readonly lights: readonly ILight[];

    public getBlock(x: number, y: number, z: number): IBlock | null {
        if ((z >= 0) && (z < 8)) {
            return this.blocks[clamp(x, 0, 255)][clamp(y, 0, 255)][z];
        } else {
            return null;
        }
    }

    private readBlocks(reader: BinaryReader): (IBlock | null)[][][] {
        const stackPointers: number[][] = [];
        for (let y = 0; y < 256; y++) {
            const row: number[] = [];
            for (let x = 0; x < 256; x++) {
                row.push(reader.readUint32())
            }    

            stackPointers.push(row);
        }

        const columnCount = reader.readUint32();
        const columns: number[] = [];
        for (let i = 0; i < columnCount; i++) {
            columns.push(reader.readUint32());
        }

        const blockCount = reader.readUint32();
        const blocks: { left: number, right: number, top: number, bottom: number, lid: number, arrows: number, slope: number }[] = [];
        for (let i = 0; i < blockCount; i++) {
            const left = reader.readUint16();
            const right = reader.readUint16();
            const top = reader.readUint16();
            const bottom = reader.readUint16();
            const lid = reader.readUint16();
            const arrows = reader.readUint8();
            const slope = reader.readUint8();
            blocks.push({ left, right, top, bottom, lid, arrows, slope });
        }

        const result: (IBlock | null)[][][] = [];

        for (let y = 0; y < 256; y++) {
            const row: (IBlock | null)[][] = [];
            result.push(row);

            for (let x = 0; x < 256; x++) {
                const column: (IBlock | null)[] = [null, null, null, null, null, null, null, null];
                row.push(column);

                let columnPointer = stackPointers[x][y];
                const columnInfo = columns[columnPointer];
                const height = columnInfo & 0xff;
                let offset = (columnInfo >> 8) & 0xff;
                for (; offset < height; offset++) {
                    columnPointer++;
                    const block = blocks[columns[columnPointer]];
                    column[7 - offset] = createBlock(block);
                }
            }
        }

        return result;
    }
}

function createBlock(info: { left: number, right: number, top: number, bottom: number, lid: number, arrows: number, slope: number }): IBlock {
    return {
        lid: decodeLid(info.lid),
        top: decodeWall(info.top, info.bottom),
        left: decodeWall(info.left, info.right),
        right: decodeWall(info.right, info.left),
        bottom: decodeWall(info.bottom, info.top),
        slope: info.slope >> 2 & 63,
    };
}

function decodeLid(value: number): ILid | null {
    if (value > 0) {
        const transform: TextureTransform = ((value >> 11) & 4) | ((value >> 14) & 3);
        return {
            tileIndex: value & 1023,
            lightLevel: (value >> 10) & 3,
            collision: Collision.Solid,
            transparent: ((value >> 12) & 1) == 1,
            transform,
        };
    }

    return null;
}

function decodeWall(value: number, reverse: number): IWall | null {
    if (value > 0) {
        const thisTransparent = ((value >> 12) & 1) == 1;
        const reverseTransparent = ((reverse >> 12) & 1) === 1;
        if (reverseTransparent && !thisTransparent) {
            return null;
        }

        let backTileIndex: number | undefined = void 0;
        if (thisTransparent && ((reverse & 1023) !== 0)) {
            backTileIndex = reverse & 1023;
        }

        const transform: TextureTransform = ((value >> 11) & 4) | ((value >> 14) & 3);
        let collision: Collision = Collision.NoCollision;
        if ((value >> 10) & 1) {
            collision = Collision.Solid;
        } else if ((value >> 11) & 1) {
            collision = Collision.CharacterCollision;
        }

        return {
            tileIndex: value & 1023,
            backTileIndex,
            collision,
            transform,
            transparent: thisTransparent,
        };
    }

    return null;
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