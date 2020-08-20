import GameMap from "./DataReaders/GameMap";
import Style from "./DataReaders/Style";
import Vehicle from "./WorldEntities/Vehicle";
import Game from "./Game";

type TileReference = [number, number, number, number];

export default class TrainSystem {
    private gameMap: GameMap;
    private readonly routeBlocks: readonly TileReference[];
    public isWrecked = false;

    constructor(game: Game, gameMap: GameMap, style: Style) {
        this.gameMap = gameMap;
        const trainInfo = style.carInfos.find(x => x.vtype === 8);
        if (!trainInfo) {
            console.error("Can't find train model");
            this.routeBlocks = [];
            return;
        }

        this.routeBlocks = findRoute(gameMap);
        const stations: TileReference[] = [];
        const trains: Vehicle[] = [];
        for (const routeBlock of this.routeBlocks) {
            if (routeBlock[3] === 6) {
                // Station
                stations.push(routeBlock);
            } else if (routeBlock[3] === 7) {
                // Station + train
                stations.push(routeBlock);
                trains.push(game.createVehicle(trainInfo.model, routeBlock[0], routeBlock[1], routeBlock[2]));
            }
        }
    }
}

function findRoute(gameMap: GameMap): TileReference[] {
    const routeBlocks: TileReference[] = [];
    for (let x = 0; x < 256; x++) {
        for (let y = 0; y < 256; y++) {
            for (let z = 0; z < 256; z++) {
                const block = gameMap.blocks[x][y][z];
                if (block?.railway) {
                    routeBlocks.push([x, y, z, block.trafficLight]); // Traffic light information is used to give more information on rail block.
                }
            }
        }
    }

    const used: TileReference = [Number.NaN, Number.NaN, Number.NaN, Number.NaN];
    const result: TileReference[] = [];
    if (routeBlocks.length > 0) {
        let point: number | null = 0;
        while (point !== null) {
            const found: TileReference = routeBlocks[point];
            routeBlocks[point] = used; // Don't use this block again.
            result.push(found);
            point =
                find(routeBlocks, found[0] + 1, found[1]) ??
                find(routeBlocks, found[0], found[1] + 1) ??
                find(routeBlocks, found[0] - 1, found[1]) ??
                find(routeBlocks, found[0], found[1] - 1);
        }
    }

    return result;
}

function find(routeBlocks: TileReference[], x: number, y: number): number | null {
    for (let i = 0; i < routeBlocks.length; i++) {
        if ((routeBlocks[i][0] === x) && (routeBlocks[i][1] === y)) {
            return i;
        }
    }

    return null;
}
