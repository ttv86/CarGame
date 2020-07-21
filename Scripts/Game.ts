import Character from "./WorldEntities/Character";
import { IRenderer } from "./Rendering/WebGlRenderer";
import Style, { ICarInfo } from "./DataReaders/Style";
import Entity from "./Entity";
import GameMap from "./DataReaders/GameMap";
import Vehicle from "./WorldEntities/Vehicle";
import Pager from "./GuiWidgets/Pager";
import LocationInfo from "./GuiWidgets/LocationInfo";
import Font from "./DataReaders/Font";

// TODO: Key binding:
const forward = [38, 87];
const backward = [40, 83];
const turnRight = [39, 68];
const turnLeft = [37, 65];

export default class Game {
    private map: GameMap;
    private style: Style;
    private texts: Map<string, string>;
    private renderer: IRenderer;
    private pager: Pager;
    private locationInfo: LocationInfo;
    private lastLocation: ISubArea | null = null;
    private areas: ISubArea[] = [];

    constructor(map: GameMap, style: Style, texts: Map<string, string>, renderer: IRenderer, subtitleFont: Font, pointFont: Font, locationFont: Font, lifeFont: Font, pagerFont: Font) {
        document.title = texts.get(`city${map.style - 1}`) ?? document.title;
        this.map = map;
        this.style = style;
        this.renderer = renderer;
        this.texts = texts;
        this.player = new Character(renderer, style, 105.5, 119.5, 9, 0);
        this.renderer.worldEntities.push(this.player);
        //for (let i = 0; i < style.carInfos.length; i++) {
        //    this.addToWorld(this.createVehicle(i, 120 + (i * 2), 128, 10));
        //}

        this.pager = new Pager(renderer, style, pagerFont);
        this.renderer.guiEntities.push(this.pager);

        this.locationInfo = new LocationInfo(renderer, style, locationFont);
        this.renderer.guiEntities.push(this.locationInfo);

        // Make sure areas are sorted by size.
        map.areas.sort((a1, a2) => (a1.height * a1.width) - (a2.height * a2.width));

        // Calculate area boundaries, so we don't need to do this in render loop.
        for (const area of map.areas) {
            const w = area.width / 3;
            const h = area.height / 3;
            this.areas.push(
                { x1: (area.x + (0 * w)) * 64, y1: (area.y + (0 * h)) * 64, x2: (area.x + (1 * w)) * 64, y2: (area.y + (1 * h)) * 64, name: `${texts.get(`nw`)} ${texts.get(`001area${area.voiceId.toString().padStart(3, "0")}`)}`, voice1: null, voice2: area.voiceId },
                { x1: (area.x + (1 * w)) * 64, y1: (area.y + (0 * h)) * 64, x2: (area.x + (2 * w)) * 64, y2: (area.y + (1 * h)) * 64, name: `${texts.get(`n`)} ${texts.get(`001area${area.voiceId.toString().padStart(3, "0")}`)}`, voice1: null, voice2: area.voiceId },
                { x1: (area.x + (2 * w)) * 64, y1: (area.y + (0 * h)) * 64, x2: (area.x + (3 * w)) * 64, y2: (area.y + (1 * h)) * 64, name: `${texts.get(`ne`)} ${texts.get(`001area${area.voiceId.toString().padStart(3, "0")}`)}`, voice1: null, voice2: area.voiceId },

                { x1: (area.x + (0 * w)) * 64, y1: (area.y + (1 * h)) * 64, x2: (area.x + (1 * w)) * 64, y2: (area.y + (2 * h)) * 64, name: `${texts.get(`w`)} ${texts.get(`001area${area.voiceId.toString().padStart(3, "0")}`)}`, voice1: null, voice2: area.voiceId },
                { x1: (area.x + (1 * w)) * 64, y1: (area.y + (1 * h)) * 64, x2: (area.x + (2 * w)) * 64, y2: (area.y + (2 * h)) * 64, name: `${texts.get(`001area${area.voiceId.toString().padStart(3, "0")}`)}`, voice1: null, voice2: area.voiceId },
                { x1: (area.x + (2 * w)) * 64, y1: (area.y + (1 * h)) * 64, x2: (area.x + (3 * w)) * 64, y2: (area.y + (2 * h)) * 64, name: `${texts.get(`e`)} ${texts.get(`001area${area.voiceId.toString().padStart(3, "0")}`)}`, voice1: null, voice2: area.voiceId },

                { x1: (area.x + (0 * w)) * 64, y1: (area.y + (2 * h)) * 64, x2: (area.x + (1 * w)) * 64, y2: (area.y + (3 * h)) * 64, name: `${texts.get(`sw`)} ${texts.get(`001area${area.voiceId.toString().padStart(3, "0")}`)}`, voice1: null, voice2: area.voiceId },
                { x1: (area.x + (1 * w)) * 64, y1: (area.y + (2 * h)) * 64, x2: (area.x + (2 * w)) * 64, y2: (area.y + (3 * h)) * 64, name: `${texts.get(`s`)} ${texts.get(`001area${area.voiceId.toString().padStart(3, "0")}`)}`, voice1: null, voice2: area.voiceId },
                { x1: (area.x + (2 * w)) * 64, y1: (area.y + (2 * h)) * 64, x2: (area.x + (3 * w)) * 64, y2: (area.y + (3 * h)) * 64, name: `${texts.get(`se`)} ${texts.get(`001area${area.voiceId.toString().padStart(3, "0")}`)}`, voice1: null, voice2: area.voiceId },
                //{ x1: (area.x + (0 * w)) * 64, y1: (area.y + (0 * h)) * 64, x2: (area.x + (3 * w)) * 64, y2: (area.y + (3 * h)) * 64, name: `${texts.get(`001area${area.voiceId.toString().padStart(3, "0")}`)}`, voice1: null, voice2: area.voiceId },
            );
        }

        // Call resize event, so gui components are moved to right places.
        this.resized();
    }

    public player: Character | null = null;
    public camera: [number, number, number] = [105.5 * 64, 119.5 * 64, 1 * 64];
    public targetScore: number = 0;
    public secretMissions: number = 0;

    /**
     * Update game logic.
     * @param time Number of seconds since last update.
     */
    public update(time: number, downKeys: ReadonlySet<number>) {
        if (this.player) {

            if (forward.some(x => downKeys.has(x))) {
                this.camera[1] -= time * this.camera[2] * 5;
                //this.player.do("walk", time);
            } else if (backward.some(x => downKeys.has(x))) {
                this.camera[1] += time * this.camera[2] * 5;
                //this.player.do("retreat", time);
            }

            if (turnLeft.some(x => downKeys.has(x))) {
                this.camera[0] -= time * this.camera[2] * 5;
                //this.player.do("turnLeft", time);
            } else if (turnRight.some(x => downKeys.has(x))) {
                this.camera[0] += time * this.camera[2] * 5;
                //this.player.do("turnRight", time);
            }

            //this.camera = [this.player.x, this.player.y + 20, this.player.z];
        }

        let possibleLocations: ISubArea[] = [];
        let location: ISubArea | null = null;
        for (const area of this.areas) {
            if ((this.camera[0] >= area.x1) && (this.camera[0] < area.x2) && (this.camera[1] >= area.y1) && (this.camera[1] < area.y2)) {
                //location = area;
                possibleLocations.push(area);
                //break;
            }
        }

        location = possibleLocations[0] ?? null;
        if (location && (location !== this.lastLocation)) {
            this.lastLocation = location;
            this.locationInfo.showText(location.name);
        }

        for (const entity of this.renderer.guiEntities) {
            entity.update(time);
        }

        this.renderer.update(time);
        this.renderer.setCamera(this.camera);
    }

    public createVehicle(vehicleType: number, x: number, y: number, z: number): Vehicle {
        const info = this.style.carInfos[vehicleType] ?? null;
        let offset;
        switch (info.vtype) {
            case 0:
                offset = this.style.spriteOffsets.Bus;
                break;
            case 3:
                offset = this.style.spriteOffsets.Bike;
                break;
            default:
            case 4:
                offset = this.style.spriteOffsets.Car;
                break;
            case 8:
                offset = this.style.spriteOffsets.Train;
                break;
        }

        const sprite = info.sprNum + offset;
        const position = this.style.spritePosition(sprite);
        if (!position) {
            throw new Error();
        }

        const h = (info.height / 128);
        const w = (info.width / 128);

        this.renderer.createModel({
            texture: this.style.spriteCanvas,
            transparent: true,
            positions: [x - w, z, y - h, x + w, z, y - h, x - w, z, y + h, x + w, z, y + h],
            textureCoords: [position.tX, position.tY, position.tX + position.tW, position.tY, position.tX, position.tY + position.tH, position.tX + position.tW, position.tY + position.tH],
            indices: [0, 1, 2, 0, 2, 1, 1, 2, 3, 1, 3, 2],
            center: { x, y },
        });

        return null!;
    }

    public getText(key: string): string {
        return this.texts.get(key) ?? "";
    }

    public addToWorld(item: Entity): void {
    }

    public resized(): void {
        const [ width, height ] = this.renderer.getViewSize();
        this.locationInfo.x = (width / 2) - this.locationInfo.width;
    }
}

interface ISubArea {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    name: string;
    voice1: number | null;
    voice2: number;
}