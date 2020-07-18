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

    constructor(map: GameMap, style: Style, texts: Map<string, string>, renderer: IRenderer, subtitleFont: Font, pointFont: Font, locationFont: Font, lifeFont: Font) {
        document.title = texts.get(`city${map.style - 1}`) ?? document.title;
        this.map = map;
        this.style = style;
        this.renderer = renderer;
        this.texts = texts;
        this.player = new Character(renderer, style, 105, 119, 4, 0);
        //for (let i = 0; i < style.carInfos.length; i++) {
        //    this.addToWorld(this.createVehicle(i, 120 + (i * 2), 128, 10));
        //}

        this.pager = new Pager(renderer, style);
        this.renderer.guiEntities.push(this.pager);

        this.locationInfo = new LocationInfo(renderer, style, locationFont);
        this.locationInfo.showText("Southwest Park");
        this.renderer.guiEntities.push(this.locationInfo);

        // Call resize event, so gui components are moved to right places.
        this.resized();
    }

    public player: Character | null = null;
    public camera: [number, number, number] = [105.5, 119.5, 7];

    /**
     * Update game logic.
     * @param time Number of seconds since last update.
     */
    public update(time: number, downKeys: ReadonlySet<number>) {
        if (this.player) {

            if (forward.some(x => downKeys.has(x))) {
                this.camera[1] -= time * this.camera[2];
                //this.player.do("walk", time);
            } else if (backward.some(x => downKeys.has(x))) {
                this.camera[1] += time * this.camera[2];
                //this.player.do("retreat", time);
            }

            if (turnLeft.some(x => downKeys.has(x))) {
                this.camera[0] -= time * this.camera[2];
                //this.player.do("turnLeft", time);
            } else if (turnRight.some(x => downKeys.has(x))) {
                this.camera[0] += time * this.camera[2];
                //this.player.do("turnRight", time);
            }

            //this.camera = [this.player.x, this.player.y + 20, this.player.z];
        }

        //this.locationInfo.showText(new Date().toJSON());

        for (const entity of this.renderer.guiEntities) {
            entity.update(time);
        }

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