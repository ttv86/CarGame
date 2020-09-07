import { IGameMap, ILight, IArea, IBlock, ILid, IWall, Collision, TextureTransform } from "../Interfaces";
import { BinaryReader } from "../BinaryReader";
import TextContainer from "./TextContainer";

export default class GameMap implements IGameMap {
    private specialAreas: ISpecialArea[] = [];
    private readonly blocks: (IBlock | null)[][][] = [];

    constructor(data: DataView, texts: TextContainer) {
        const areas: IArea[] = [];
        const lights: ILight[] = [];
        this.areas = areas;
        this.lights = lights;

        const reader = new BinaryReader(data);
        const magic = reader.readString(4);
        const version = reader.readUint16();
        if ((magic !== "GBMP") || (version !== 500)) {
            throw new Error("Invalid map file");
        }

        while (reader.position < reader.length) {
            const blockType = reader.readString(4);
            const blockSize = reader.readUint32();
            const end = reader.position + blockSize;
            switch (blockType) {
                case "DMAP":
                    this.blocks = this.readBlocks(reader);
                    break;
                case "UMAP": // Rarely exists
                case "CMAP": // Not currently needed
                case "PSXM": // Not currently needed
                    break;

                case "ZONE":
                    while (reader.position < end) {
                        const zoneType = reader.readUint8();
                        const x = reader.readUint8();
                        const y = reader.readUint8();
                        const width = reader.readUint8();
                        const height = reader.readUint8();
                        const nameLength = reader.readUint8();
                        const name = reader.readString(nameLength);
                        this.specialAreas.push({ zoneType, x, y, width, height, name });
                        if ((zoneType === ZoneType.Navigation) || (zoneType === ZoneType.LocalNavigation)) {
                            let shownName = texts?.get(name, false) ?? "";
                            if (!shownName) {
                                shownName = name;
                            }

                            areas.push({ x, y, width, height, name: shownName });
                        }
                    }

                    break;

                case "LGHT":
                    while (reader.position < end) {
                        const r = reader.readUint8() / 255;
                        const g = reader.readUint8() / 255;
                        const b = reader.readUint8() / 255;
                        reader.readUint8(); // Alpha - not used.
                        const x = reader.readUint16() / 128;
                        const y = reader.readUint16() / 128;
                        const z = reader.readUint16() / 128;
                        const radius = reader.readUint16() / 128;
                        const intensity = reader.readUint8() / 255;
                        const shape = reader.readUint8();
                        const onTime = reader.readUint8();
                        const offTime = reader.readUint8();
                        lights.push({
                            color: { r, g, b },
                            radius,
                            position: { x, y, z },
                        });
                    }

                    break;

                default:
                    console.log(`Unknown map block ${blockType}: ${blockSize}`);
                    break;
            }

            // Make sure we are at end of the block.
            reader.position = end;
        }

        //console.table(this.specialAreas);
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
                    column[offset] = createBlock(block);
                }
            }
        }

        return result;
    }
}

function createBlock(info: { left: number, right: number, top: number, bottom: number, lid: number, arrows: number, slope: number }): IBlock {
    const lid = decodeLid(info.lid);
    let slope = (info.slope >> 2) & 63;
    if ((slope >= 49) && (slope <= 52) && (lid?.tileIndex === 1023)) {
        slope += 15;
    }

    return {
        lid,
        top: decodeWall(info.top, info.bottom),
        left: decodeWall(info.left, info.right),
        right: decodeWall(info.right, info.left),
        bottom: decodeWall(info.bottom, info.top),
        slope,
    };
}

function decodeLid(value: number): ILid | null {
    if (value > 0) {
        const transform: TextureTransform = ((value >> 11) & 4) | ((value >> 14) & 3);
        const tileIndex = value & 1023;
        return {
            tileIndex: tileIndex || -1,
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

        const tileIndex = value & 1023;
        return {
            tileIndex: tileIndex || -1,
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

interface ISpecialArea extends IArea {
    zoneType: ZoneType;
}

enum ZoneType {
    GeneralPurpose = 0,
    Navigation = 1,
    TrafficLight = 2,
    ArrowBlocker = 5,
    RailwayPlatform = 6,
    BusStop = 7,
    Trigger = 8,
    Information = 10,
    RailwayEntry = 11,
    RailwayExit = 12,
    RailwayStop = 13,
    Gang = 14,
    LocalNavigation = 15,
    Restart = 16,
    ArrestRestart = 20,
}