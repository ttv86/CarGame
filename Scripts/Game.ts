import Character, { CharacterState } from "./WorldEntities/Character";
import { IRenderer } from "./Rendering/WebGlCityRenderer";
import Style, { ICarInfo } from "./DataReaders/Style";
import Entity from "./Entity";
import GameMap from "./DataReaders/GameMap";
import Vehicle from "./WorldEntities/Vehicle";
import Pager from "./GuiWidgets/Pager";
import LocationInfo from "./GuiWidgets/LocationInfo";
import Font from "./DataReaders/Font";
import KeyboardHandler from "./KeyboardHandler";
import { IMission } from "./DataReaders/MissionReader";
import Mission from "./Mission";
import Trigger from "./WorldEntities/Trigger";
import SubtitleBox from "./GuiWidgets/SubtitleBox";
import Audio from "./DataReaders/Audio";
import TrainSystem from "./TrainSystem";

export default class Game {
    private readonly subtitles: SubtitleBox;
    private readonly globalAudio: Audio;
    private readonly localAudio: Audio;
    private readonly areas: ISubArea[] = [];
    private lastLocation: ISubArea | null = null;
    public readonly map: GameMap;
    public readonly style: Style;
    public readonly mission: Mission;
    public readonly texts: Map<string, string>;
    public readonly renderer: IRenderer;
    public readonly keyboard: KeyboardHandler;
    public readonly pager: Pager;
    public readonly locationInfo: LocationInfo;
    public readonly triggers: Trigger[] = [];
    public player: Character | null = null;
    public vehicles: Vehicle[] = [];
    public camera: [number, number, number] = [105.5 * 64, 119.5 * 64, 1 * 64];
    public targetScore: number = 0;
    public secretMissions: number = 0;
    public score: number = 0;
    public trainSystem: TrainSystem;

    constructor(
        map: GameMap,
        style: Style,
        mission: IMission,
        texts: Map<string, string>,
        renderer: IRenderer,
        subtitleFont: Font,
        pointFont: Font,
        locationFont: Font,
        lifeFont: Font,
        pagerFont: Font,
        globalAudio: Audio,
        localAudio: Audio) {

        document.title = texts.get(`city${map.style - 1}`) ?? document.title;
        this.map = map;
        this.style = style;
        this.renderer = renderer;
        this.texts = texts;
        this.mission = new Mission(this, mission);
        this.keyboard = new KeyboardHandler();
        this.globalAudio = globalAudio;
        this.localAudio = localAudio;

        // Run world initialization logic.
        this.mission.initializeGame();

        this.pager = new Pager(this, renderer, style, pagerFont);
        this.renderer.guiEntities.push(this.pager);

        this.locationInfo = new LocationInfo(this, renderer, style, locationFont);
        this.renderer.guiEntities.push(this.locationInfo);

        this.subtitles = new SubtitleBox(this, this.renderer, style, subtitleFont);
        this.renderer.guiEntities.push(this.subtitles);

        this.trainSystem = new TrainSystem(this, map, style);

        // Make sure areas are sorted by size.
        map.areas.sort((a1, a2) => (a1.height * a1.width) - (a2.height * a2.width));

        // Calculate area boundaries, so we don't need to do this in render loop.
        const areaStart = `${map.style.toString().padStart(3, '0')}area`;
        for (const area of map.areas) {
            const w = area.width / 3;
            const h = area.height / 3;
            const areaNameKey = areaStart + area.voiceId.toString().padStart(3, "0");
            this.areas.push(
                { x1: (area.x + (0 * w)) * 64, y1: (area.y + (0 * h)) * 64, x2: (area.x + (1 * w)) * 64, y2: (area.y + (1 * h)) * 64, name: `${texts.get(`nw`)} ${texts.get(areaNameKey)}`, voice1: null, voice2: area.voiceId },
                { x1: (area.x + (1 * w)) * 64, y1: (area.y + (0 * h)) * 64, x2: (area.x + (2 * w)) * 64, y2: (area.y + (1 * h)) * 64, name: `${texts.get(`n`)} ${texts.get(areaNameKey)}`, voice1: null, voice2: area.voiceId },
                { x1: (area.x + (2 * w)) * 64, y1: (area.y + (0 * h)) * 64, x2: (area.x + (3 * w)) * 64, y2: (area.y + (1 * h)) * 64, name: `${texts.get(`ne`)} ${texts.get(areaNameKey)}`, voice1: null, voice2: area.voiceId },

                { x1: (area.x + (0 * w)) * 64, y1: (area.y + (1 * h)) * 64, x2: (area.x + (1 * w)) * 64, y2: (area.y + (2 * h)) * 64, name: `${texts.get(`w`)} ${texts.get(areaNameKey)}`, voice1: null, voice2: area.voiceId },
                { x1: (area.x + (1 * w)) * 64, y1: (area.y + (1 * h)) * 64, x2: (area.x + (2 * w)) * 64, y2: (area.y + (2 * h)) * 64, name: `${texts.get(areaNameKey)}`, voice1: null, voice2: area.voiceId },
                { x1: (area.x + (2 * w)) * 64, y1: (area.y + (1 * h)) * 64, x2: (area.x + (3 * w)) * 64, y2: (area.y + (2 * h)) * 64, name: `${texts.get(`e`)} ${texts.get(areaNameKey)}`, voice1: null, voice2: area.voiceId },

                { x1: (area.x + (0 * w)) * 64, y1: (area.y + (2 * h)) * 64, x2: (area.x + (1 * w)) * 64, y2: (area.y + (3 * h)) * 64, name: `${texts.get(`sw`)} ${texts.get(areaNameKey)}`, voice1: null, voice2: area.voiceId },
                { x1: (area.x + (1 * w)) * 64, y1: (area.y + (2 * h)) * 64, x2: (area.x + (2 * w)) * 64, y2: (area.y + (3 * h)) * 64, name: `${texts.get(`s`)} ${texts.get(areaNameKey)}`, voice1: null, voice2: area.voiceId },
                { x1: (area.x + (2 * w)) * 64, y1: (area.y + (2 * h)) * 64, x2: (area.x + (3 * w)) * 64, y2: (area.y + (3 * h)) * 64, name: `${texts.get(`se`)} ${texts.get(areaNameKey)}`, voice1: null, voice2: area.voiceId },
                //{ x1: (area.x + (0 * w)) * 64, y1: (area.y + (0 * h)) * 64, x2: (area.x + (3 * w)) * 64, y2: (area.y + (3 * h)) * 64, name: `${texts.get(areaNameKey)}`, voice1: null, voice2: area.voiceId },
            );
        }

        // Call resize event, so gui components are moved to right places.
        this.resized();
    }

    /**
     * Update game logic.
     * @param time Number of seconds since last update.
     */
    public update(time: number) {
        // First send keyboard commands to player.
        this.mission.update();
        if (this.player) {

            for (const trigger of this.triggers) {
                if (trigger.test(this.player.x, this.player.y, this.player.z)) {
                    trigger.execute();
                }
            }

            if (this.player.vehicle) {
                const vehicle = this.player.vehicle;
                if (this.keyboard.isDown("up")) {
                    vehicle.do("accelerate", time);
                } else if (this.keyboard.isDown("down")) {
                    vehicle.do("decelerate", time);
                }

                if (this.keyboard.isDown("left")) {
                    vehicle.do("turnLeft", time);
                } else if (this.keyboard.isDown("right")) {
                    vehicle.do("turnRight", time);
                }

                if (this.keyboard.isPressed("enterExit")) {
                    this.player.leaveVehicle();
                }

                // Player is supposedly center of a vehicle.
                this.player.x = vehicle.x;
                this.player.y = vehicle.y;
                this.player.z = vehicle.z;
            } else {
                if (this.keyboard.isDown("up")) {
                    //this.camera[1] -= time * this.camera[2] * 5;
                    this.player.do("walk", time);
                } else if (this.keyboard.isDown("down")) {
                    //this.camera[1] += time * this.camera[2] * 5;
                    this.player.do("retreat", time);
                }

                if (this.keyboard.isDown("left")) {
                    //this.camera[0] -= time * this.camera[2] * 5;
                    this.player.do("turnLeft", time);
                } else if (this.keyboard.isDown("right")) {
                    //this.camera[0] += time * this.camera[2] * 5;
                    this.player.do("turnRight", time);
                }

                if (this.keyboard.isPressed("enterExit")) {
                    let nearestVehicle: Vehicle | null = null;
                    let nearestDistance: number = 96; // We can jump to car from 1,5 tiles away
                    for (const vehicle of this.vehicles) {
                        const dist = Math.sqrt(Math.pow(vehicle.x - this.player.x, 2) + Math.pow(vehicle.y - this.player.y, 2) + Math.pow(vehicle.z - this.player.z, 2));
                        if (dist < nearestDistance) {
                            nearestVehicle = vehicle;
                            nearestDistance = dist;
                        }
                    }

                    if (nearestVehicle) {
                        this.player.enterVehicle(nearestVehicle);
                    }
                }
            }

            this.camera = [this.player.x, this.player.y + 20, this.player.z - 192 + Math.abs(this.player.vehicle?.currentSpeed ?? 0) * 32];
        }

        let possibleLocations: ISubArea[] = [];
        let location: ISubArea | null = null;
        for (const area of this.areas) {
            if ((this.camera[0] >= area.x1) && (this.camera[0] < area.x2) && (this.camera[1] >= area.y1) && (this.camera[1] < area.y2)) {
                location = area;
                break;
            }
        }

        if (location && (location !== this.lastLocation)) {
            this.lastLocation = location;
            this.locationInfo.showText(location.name);
        }

        for (const entity of this.renderer.worldEntities) {
            entity.update(time);
        }

        for (const entity of this.renderer.guiEntities) {
            entity.update(time);
        }

        this.renderer.update(time);
        this.renderer.setCamera(this.camera);
        this.keyboard.update(); // Mark all keypresses as handled.
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
        this.subtitles.setLocation(width, height);
    }

    public keyDown(code: number) {
        this.keyboard.setKeyStatus(code, true);
    }

    public keyUp(code: number) {
        this.keyboard.setKeyStatus(code, false);
    }

    public playSound(name: string): void {
        // NOTE: Audio might not play until user has interacted with content. This should be resolved after main menu is implemented.
        switch (name) {
            case "intro":
                this.globalAudio.play(0);
                break;
            case "missionComplete":
                this.globalAudio.play(1);
                break;
            case "missionFailed":
                this.globalAudio.play(2);
                break;
            case "killFrenzy":
                this.globalAudio.play(3);
                break;
            case "excellent":
                this.globalAudio.play(4);
                break;
            case "betterLuck":
                this.globalAudio.play(5);
                break;
            case "loser":
                this.globalAudio.play(6);
                break;
            case "wow":
                this.globalAudio.play(7);
                break;
            case "laugh1":
                this.globalAudio.play(8);
                break;
            case "laugh2":
                this.globalAudio.play(9);
                break;
            case "laugh3":
                this.globalAudio.play(10);
                break;
            case "extraLife":
                this.globalAudio.play(11);
                break;
            case "sad":
                this.globalAudio.play(12);
                break;
            case "go":
                this.globalAudio.play(14);
                break;
            case "gogogo":
                this.globalAudio.play(15);
                break;
            case "moveIt":
                this.globalAudio.play(16);
                break;
            case "applause":
                this.globalAudio.play(17);
                break;
        }
    }

    public showText(textReference: number, type: "mouth" | "phone" | "mobile"): void {
        // TODO: Not implemented.
        this.subtitles.setText(this.texts.get(textReference.toString()) ?? "N/A");
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