import { IGameMap, IArea, ILight, Collision, IBlock } from "../Interfaces";

export default class GameMap implements IGameMap {
    private mapData: IReferenceMapData;

    constructor(data: DataView) {
        const string = new TextDecoder().decode(data.buffer);
        this.mapData = JSON.parse(string);

        this.width = Number.NaN;
        this.height = Number.NaN;
        this.maxAltitude = this.mapData.data.length;
        for (let h = 0; h < this.maxAltitude; h++) {
            const length = this.mapData.data[h].length;
            if (h === 0) {
                this.height = length;
            } else if (this.height !== length) {
                throw new Error("Not uniform length map data");
            }

            for (let i = 0; i < this.height; i++) {
                const length2 = this.mapData.data[h][i].length;
                if ((h === 0) && (i === 0)) {
                    this.width = length2;
                } else if (this.width !== length2) {
                    throw new Error("Not uniform length map data");
                }
            }
        }
    }

    public readonly width: number;
    public readonly height: number;
    public readonly maxAltitude: number;
    public readonly areas: readonly IArea[] = [];
    public readonly lights: readonly ILight[] = [];

    public getBlock(x: number, y: number, z: number): IBlock | null {
        const letter = this.mapData.data[clamp(z, 0, this.maxAltitude - 1)][clamp(y, 0, this.height - 1)][clamp(x, 0, this.width - 1)];
        let data = this.mapData.blocks[letter] ?? {};
        while (data.inherit) {
            data = { ...data, inherit: "", ...this.mapData.blocks[data.inherit] };
        }

        return {
            lid: data.lid ? { tileIndex: data.lid.tileIndex, collision: Collision.Solid } : null,
            top: data.top ? { tileIndex: data.top.tileIndex, collision: Collision.Solid } : null,
            left: data.left ? { tileIndex: data.left.tileIndex, collision: Collision.Solid } : null,
            right: data.right ? { tileIndex: data.right.tileIndex, collision: Collision.Solid } : null,
            bottom: data.bottom ? { tileIndex: data.bottom.tileIndex, collision: Collision.Solid } : null,
        };
    }
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

interface IReferenceMapData {
    blocks: Record<string, IBlockInfo>;
    data: readonly string[][];
}

interface IBlockInfo {
    inherit?: string;
    lid?: IBlockTile;
    top?: IBlockTile;
    left?: IBlockTile;
    right?: IBlockTile;
    bottom?: IBlockTile;
}

interface IBlockTile {
    tileIndex: number;
}