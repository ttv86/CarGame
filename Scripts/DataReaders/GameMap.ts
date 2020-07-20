import { BinaryReader } from "./BinaryReader";

export default class GameMap {
    constructor(data: DataView) {
        const reader = new BinaryReader(data);
        const version = reader.readInt32();
        if (version !== 331) {
            // Only support version that comes with free download from Rockstar.
            throw new Error("Invalid file version.");
        }

        const style = reader.readUint8();
        const sample = reader.readUint8();
        reader.position += 2;
        const routeSize = reader.readInt32();
        const objectPosSize = reader.readInt32();
        const columnSize = reader.readInt32();
        const blockSize = reader.readInt32();
        const navDataSize = reader.readInt32();

        this.style = style;
        this.sample = sample;
        this.blocks = [];
        this.readGrid(reader, columnSize, blockSize);
        this.readObjects(reader, objectPosSize);
        this.readRoutes(reader, routeSize);
        this.readLocationData(reader);
        this.readNavData(reader, navDataSize);
    }

    private readGrid(reader: BinaryReader, columnSize: number, blockSize: number): void {
        const stackPointers: number[][] = [];
        for (let y = 0; y < 256; y++) {
            stackPointers.push([]);
            const row: (MapBlock | null)[][] = [];
            for (let x = 0; x < 256; x++) {
                stackPointers[y][x] = reader.readUint32();
                row.push([null, null, null, null, null, null]);
            }

            this.blocks.push(row);
        }

        const stackMap = new Map<number, [number, number, number, number, number, number]>();
        let end = reader.position + columnSize;
        let pos = 0;
        while (reader.position < end) {
            const startPos = pos;
            const cubes: [number, number, number, number, number, number] = [0, 0, 0, 0, 0, 0];
            let index = reader.readUint16();
            pos += 2;
            for (; index < 6; index++) {
                cubes[index] = reader.readUint16();
                pos += 2;
            }

            stackMap.set(startPos, cubes);
        }

        const blocks: MapBlock[] = [];
        end = reader.position + blockSize;
        while (reader.position < end) {
            const typeMap = reader.readUint16();
            const typeMapExt = reader.readUint8();
            const left = reader.readUint8();
            const right = reader.readUint8();
            const top = reader.readUint8();
            const bottom = reader.readUint8();
            const lid = reader.readUint8();
            blocks.push(new MapBlock(blocks.length, typeMap, typeMapExt, left, right, top, bottom, lid));
        }

        for (let y = 0; y < 256; y++) {
            for (let x = 0; x < 256; x++) {
                const index = stackPointers[y][x];
                if (!stackMap.has(index)) {
                    throw new Error("Invalid block stack pointer.");
                }

                const cubes = stackMap.get(index)!;
                for (let i = 0; i < 6; i++) {
                    const blockIndex = cubes[i];
                    this.blocks[x][y][i] = blockIndex > 0 ? blocks[blockIndex] : null;
                }
            }
        }
    }
    
    private readObjects(reader: BinaryReader, objectPosSize: number) {
        const end = reader.position + objectPosSize;
        while (reader.position < end) {
            const x = reader.readUint16();
            const y = reader.readUint16();
            const z = reader.readUint16();
            const type = reader.readUint8();
            const remap = reader.readUint8();
            const rotation = reader.readUint16();
            const pitch = reader.readUint16();
            const roll = reader.readUint16();
            this.objects.push({ x, y, z, type, remap, rotation, pitch, roll });
        }
    }

    private readRoutes(reader: BinaryReader, routeSize: number) {
        const end = reader.position + routeSize;
        while (reader.position < end) {
            const num = reader.readUint8();
            const type = reader.readUint8();
            const points: IMapPoint[] = [];
            for (let i = 0; i < num; i++) {
                const x = reader.readUint8();
                const y = reader.readUint8();
                const z = reader.readUint8();
                if ((x != 0) || (y != 0) || (z != 0)) {
                    points.push({ x, y, z });
                }
            }

            this.routes.push({ type, points });
        }
    }

    private readLocationData(reader: BinaryReader) {
        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 6; j++) {
                const x = reader.readUint8();
                const y = reader.readUint8();
                const z = reader.readUint8();
                if ((x != 0) || (y != 0) || (z != 0)) {
                    switch (i) {
                        case 0:
                            this.policeStations.push({ x, y, z });
                            break;
                        case 1:
                            this.hospitals.push({ x, y, z });
                            break;
                        case 4:
                            this.fireStations.push({ x, y, z });
                            break;
                    }
                }
            }
        }
    }

    private readNavData(reader: BinaryReader, navDataSize: number) {
        const end = reader.position + navDataSize;
        while (reader.position < end) {
            const x = reader.readUint8();
            const y = reader.readUint8();
            const width = reader.readUint8();
            const height = reader.readUint8();
            const voiceId = reader.readUint8();
            const nameBytes = reader.readBytes(30);
            if ((width == 0) || (height == 0)) {
                continue;
            }

            let name = "";
            for (let i = 0; i < nameBytes.length && nameBytes[i] > 0; i++) {
                name += String.fromCharCode(nameBytes[i]);
            }

            this.areas.push({ x, y, width, height, voiceId, name });
        }
    }

    public readonly style: number;

    public readonly sample: number;

    public readonly blocks: (MapBlock | null)[][][];

    public readonly objects: IMapObject[] = [];

    public readonly routes: IMapRoute[] = [];

    public readonly areas: IMapArea[] = [];

    public readonly policeStations: IMapPoint[] = [];

    public readonly hospitals: IMapPoint[] = [];

    public readonly fireStations: IMapPoint[] = [];
}

class MapBlock {
    constructor(index: number, typeMap: number, typeMapExt: number, left: number, right: number, top: number, bottom: number, lid: number) {
        this.index = index;
        this.direction = (typeMap >> 0) & 15;
        this.type = (typeMap >> 4) & 7;
        this.flat = ((typeMap >> 7) & 1) !== 0;
        this.slope = (typeMap >> 8) & 63;
        this.lidRotation = (typeMap >> 14) & 3;

        this.trafficLight = (typeMapExt >> 0) & 7;
        this.remap = (typeMapExt >> 3) & 3;
        this.flipTopBottom = ((typeMapExt >> 5) & 1) !== 0;
        this.flipLeftRight = ((typeMapExt >> 6) & 1) !== 0;
        this.railway = ((typeMapExt >> 7) & 1) !== 0;

        this.left = left;
        this.right = right;
        this.top = top;
        this.bottom = bottom;
        this.lid = lid;
    }

    public readonly index: number;
    public readonly direction: number;
    public readonly type: number;
    public readonly flat: boolean;
    public readonly slope: number;
    public readonly lidRotation: number;

    public readonly trafficLight: number;
    public readonly remap: number;
    public readonly flipTopBottom: boolean;
    public readonly flipLeftRight: boolean;
    public readonly railway: boolean;

    public readonly left: number;
    public readonly right: number;
    public readonly top: number;
    public readonly bottom: number;
    public readonly lid: number;
}

interface IMapArea {
    name: string;
    x: number;
    y: number;
    width: number;
    height: number;
    voiceId: number;
}

interface IMapObject {
    x: number;
    y: number;
    z: number;
    type: number;
    remap: number;
    rotation: number;
    pitch: number;
    roll: number;
}

interface IMapRoute {
    type: number;
    points: IMapPoint[];
}

interface IMapPoint {
    x: number;
    y: number;
    z: number;
}