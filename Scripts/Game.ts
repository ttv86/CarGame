import Character from "./WorldEntities/Character";
import { IRenderer } from "./Rendering/WebGlCityRenderer";
import { IGameMap, IStyle, IVehicleInfo, IFont, IGameScript, IAudio, ITextContainer, IArea } from "./DataReaders/Interfaces";
import Entity from "./Entity";
import Vehicle from "./WorldEntities/Vehicle";
import Pager from "./GuiWidgets/Pager";
import LocationInfo from "./GuiWidgets/LocationInfo";
import KeyboardHandler from "./KeyboardHandler";
import Trigger from "./WorldEntities/Trigger";
import SubtitleBox from "./GuiWidgets/SubtitleBox";
import TrainSystem from "./TrainSystem";

export default class Game {
    private readonly subtitles: SubtitleBox | null = null;
    private readonly globalAudio: IAudio;
    private readonly localAudio: IAudio;
    private readonly areas: ISubArea[] = [];
    private lastLocation: ISubArea | null = null;
    public readonly map: IGameMap;
    public readonly style: IStyle;
    public readonly gameScript: IGameScript;
    public readonly texts: ITextContainer;
    public readonly renderer: IRenderer;
    public readonly keyboard: KeyboardHandler;
    public readonly pager: Pager | null = null;
    public readonly locationInfo: LocationInfo | null = null;
    public readonly triggers: Trigger[] = [];
    public player: Character | null = null;
    public vehicles: Vehicle[] = [];
    //public camera: [number, number, number] = [128 * 64, 128 * 64, 10 * 64];
    public camera: [number, number, number] = [150 * 64, 123 * 64, 10 * 64];
    public targetScore: number = 0;
    public secretMissions: number = 0;
    public score: number = 0;
    public trainSystem: TrainSystem;

    constructor(
        map: IGameMap,
        style: IStyle,
        gameScript: IGameScript,
        texts: ITextContainer,
        renderer: IRenderer,
        subtitleFont: IFont,
        pointFont: IFont,
        locationFont: IFont,
        lifeFont: IFont,
        pagerFont: IFont,
        globalAudio: IAudio,
        localAudio: IAudio) {

        this.map = map;
        this.style = style;
        this.renderer = renderer;
        this.texts = texts;
        this.gameScript = gameScript; // new Mission(this, mission);
        this.keyboard = new KeyboardHandler();
        this.globalAudio = globalAudio;
        this.localAudio = localAudio;

        // Run world initialization logic.
        this.gameScript.initialize(this);

        if (pagerFont) {
            this.pager = new Pager(this, renderer, style, pagerFont);
            this.renderer.guiEntities.push(this.pager);
        }


        if (locationFont) {
            this.locationInfo = new LocationInfo(this, renderer, style, locationFont);
            this.renderer.guiEntities.push(this.locationInfo);
        }

        if (subtitleFont) {
            this.subtitles = new SubtitleBox(this, this.renderer, style, subtitleFont);
            this.renderer.guiEntities.push(this.subtitles);
        }

        this.trainSystem = new TrainSystem(this, map, style);

        // Make sure areas are sorted by size.
        const areas = [...map.areas];
        areas.sort((a1, a2) => (a1.height * a1.width) - (a2.height * a2.width));

        // Calculate area boundaries, so we don't need to do this in render loop.
        for (const area of areas) {
            const w = area.width / 3;
            const h = area.height / 3;
            const name = this.texts.getAreaName(area);
            this.areas.push(
                { x1: (area.x + (0 * w)) * 64, y1: (area.y + (0 * h)) * 64, x2: (area.x + (1 * w)) * 64, y2: (area.y + (1 * h)) * 64, name: `${texts.getSpecial("north-west")} ${name}`, parentArea: area, subSection: "north-west" },
                { x1: (area.x + (1 * w)) * 64, y1: (area.y + (0 * h)) * 64, x2: (area.x + (2 * w)) * 64, y2: (area.y + (1 * h)) * 64, name: `${texts.getSpecial("north")} ${name}`, parentArea: area, subSection: "north" },
                { x1: (area.x + (2 * w)) * 64, y1: (area.y + (0 * h)) * 64, x2: (area.x + (3 * w)) * 64, y2: (area.y + (1 * h)) * 64, name: `${texts.getSpecial("north-east")} ${name}`, parentArea: area, subSection: "north-east" },

                { x1: (area.x + (0 * w)) * 64, y1: (area.y + (1 * h)) * 64, x2: (area.x + (1 * w)) * 64, y2: (area.y + (2 * h)) * 64, name: `${texts.getSpecial("west")} ${name}`, parentArea: area, subSection: "west" },
                { x1: (area.x + (1 * w)) * 64, y1: (area.y + (1 * h)) * 64, x2: (area.x + (2 * w)) * 64, y2: (area.y + (2 * h)) * 64, name: `${name}`, parentArea: area, subSection: null },
                { x1: (area.x + (2 * w)) * 64, y1: (area.y + (1 * h)) * 64, x2: (area.x + (3 * w)) * 64, y2: (area.y + (2 * h)) * 64, name: `${texts.getSpecial("east")} ${name}`, parentArea: area, subSection: "east" },

                { x1: (area.x + (0 * w)) * 64, y1: (area.y + (2 * h)) * 64, x2: (area.x + (1 * w)) * 64, y2: (area.y + (3 * h)) * 64, name: `${texts.getSpecial("south-west")} ${name}`, parentArea: area, subSection: "south-west" },
                { x1: (area.x + (1 * w)) * 64, y1: (area.y + (2 * h)) * 64, x2: (area.x + (2 * w)) * 64, y2: (area.y + (3 * h)) * 64, name: `${texts.getSpecial("south")} ${name}`, parentArea: area, subSection: "south" },
                { x1: (area.x + (2 * w)) * 64, y1: (area.y + (2 * h)) * 64, x2: (area.x + (3 * w)) * 64, y2: (area.y + (3 * h)) * 64, name: `${texts.getSpecial("south-east")} ${name}`, parentArea: area, subSection: "south-east" },
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
        // TODO:this.gameScript.update(time);
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
        } else {
            const speed = time * 500;
            if (this.keyboard.isDown("up")) {
                this.camera = [this.camera[0], this.camera[1] - speed, this.camera[2]];
            } else if (this.keyboard.isDown("down")) {
                this.camera = [this.camera[0], this.camera[1] + speed, this.camera[2]];
            }

            if (this.keyboard.isDown("left")) {
                this.camera = [this.camera[0] - speed, this.camera[1], this.camera[2]];
            } else if (this.keyboard.isDown("right")) {
                this.camera = [this.camera[0] + speed, this.camera[1], this.camera[2]];
            }

            document.title = this.camera.map(x => (x / 64).toFixed(1)).join(",");
        }

        let location: ISubArea | null = null;
        for (const area of this.areas) {
            if ((this.camera[0] >= area.x1) && (this.camera[0] < area.x2) && (this.camera[1] >= area.y1) && (this.camera[1] < area.y2)) {
                location = area;
                break;
            }
        }

        if (location && this.locationInfo && (location !== this.lastLocation)) {
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
        const info = this.style.getVehicleInfo(vehicleType);
        //let offset;
        //switch (info.type) {
        //    case "bus":
        //        offset = this.style.spriteOffsets.Bus;
        //        break;
        //    case "bike":
        //        offset = this.style.spriteOffsets.Bike;
        //        break;
        //    default:
        //    case "car":
        //        offset = this.style.spriteOffsets.Car;
        //        break;
        //    case "train":
        //        offset = this.style.spriteOffsets.Train;
        //        break;
        //}

        //const sprite = info.sprNum + offset;
        //const position = this.style.spritePosition(sprite);
        //if (!position) {
        //    throw new Error();
        //}

        //const h = (info.height / 128);
        //const w = (info.width / 128);

        //this.renderer.createModel({
        //    texture: this.style.spriteCanvas,
        //    transparent: true,
        //    positions: [x - w, z, y - h, x + w, z, y - h, x - w, z, y + h, x + w, z, y + h],
        //    textureCoords: [position.tX, position.tY, position.tX + position.tW, position.tY, position.tX, position.tY + position.tH, position.tX + position.tW, position.tY + position.tH],
        //    indices: [0, 1, 2, 0, 2, 1, 1, 2, 3, 1, 3, 2],
        //    center: { x, y },
        //});

        return null!;
    }

    public getText(key: string): string {
        return this.texts.get(key) ?? "";
    }

    public addToWorld(item: Entity): void {
    }

    public resized(): void {
        const [width, height] = this.renderer.getViewSize();
        if (this.locationInfo) {
            this.locationInfo.x = (width / 2) - this.locationInfo.width;
        }

        if (this.subtitles) {
            this.subtitles.setLocation(width, height);
        }
    }

    public keyDown(code: number) {
        this.keyboard.setKeyStatus(code, true);
    }

    public keyUp(code: number) {
        this.keyboard.setKeyStatus(code, false);
    }

    public playSound(name: string): void {
        ////// NOTE: Audio might not play until user has interacted with content. This should be resolved after main menu is implemented.
        ////switch (name) {
        ////    case "intro":
        ////        this.globalAudio.play(0);
        ////        break;
        ////    case "missionComplete":
        ////        this.globalAudio.play(1);
        ////        break;
        ////    case "missionFailed":
        ////        this.globalAudio.play(2);
        ////        break;
        ////    case "killFrenzy":
        ////        this.globalAudio.play(3);
        ////        break;
        ////    case "excellent":
        ////        this.globalAudio.play(4);
        ////        break;
        ////    case "betterLuck":
        ////        this.globalAudio.play(5);
        ////        break;
        ////    case "loser":
        ////        this.globalAudio.play(6);
        ////        break;
        ////    case "wow":
        ////        this.globalAudio.play(7);
        ////        break;
        ////    case "laugh1":
        ////        this.globalAudio.play(8);
        ////        break;
        ////    case "laugh2":
        ////        this.globalAudio.play(9);
        ////        break;
        ////    case "laugh3":
        ////        this.globalAudio.play(10);
        ////        break;
        ////    case "extraLife":
        ////        this.globalAudio.play(11);
        ////        break;
        ////    case "sad":
        ////        this.globalAudio.play(12);
        ////        break;
        ////    case "go":
        ////        this.globalAudio.play(14);
        ////        break;
        ////    case "gogogo":
        ////        this.globalAudio.play(15);
        ////        break;
        ////    case "moveIt":
        ////        this.globalAudio.play(16);
        ////        break;
        ////    case "applause":
        ////        this.globalAudio.play(17);
        ////        break;
        ////}
    }

    public showText(textReference: number, type: "mouth" | "phone" | "mobile"): void {
        // TODO: Not implemented.
        if (this.subtitles) {
            this.subtitles.setText(this.texts.get(textReference.toString()) ?? "N/A");
        }
    }
}

interface ISubArea {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    name: string;
    parentArea: IArea;
    subSection: "west" | "north" | "south" | "east" | "north-west" | "north-east" | "south-west" | "south-east" | null;
}