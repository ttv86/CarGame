import Game from "../../Game";
import WebGlCityRenderer, { IRenderer } from "../../Rendering/WebGlCityRenderer";

//import Style from "./Style";
//import GameMap from "./GameMap";
//import readMissions from "./MissionReader";
//import TextContainer from "./TextContainer";
//import Font from "./Font";
//import Audio from "./Audio";
//import Mission from "./Mission";
import { IGameMap, IStyle, IGameScript, ITextContainer, IFont, IAudio, IArea } from "../Interfaces";
import Style from "./Style";
import GameScript from "./GameScript";
import GameMap from "./GameMap";
import TextContainer from "./TextContainer";
import GuiWidget, { WidgetContainer, TextPanelWidget } from "../../GuiWidgets/GuiWidget";
import GangAffiliationWidget from "./GangAffiliationWidget";
import HeadWidget from "../G_Shared/HeadWidget";
import Character, { ICharacterAnimation } from "../../WorldEntities/Character";

export default class G2Game extends Game {
    private readonly location: TextPanelWidget;
    private readonly vehicle: TextPanelWidget;
    private readonly gangWidgetContainer: WidgetContainer;

    constructor(
        map: GameMap,
        style: Style,
        gameScript: IGameScript,
        texts: TextContainer,
        renderer: IRenderer,
        subtitleFont: IFont,
        pointFont: IFont,
        locationFont: IFont,
        vehicleFont: IFont,
        lifeFont: IFont,
        pagerFont: IFont,
        globalAudio: IAudio | null,
        localAudio: IAudio | null) {
        super(map, style, gameScript, texts, renderer, subtitleFont, pointFont, locationFont, lifeFont, pagerFont, globalAudio, localAudio);

        const container = new WidgetContainer("top", Number.NaN);

        const heads = new HeadWidget(style, renderer, gui.policeHead.map(x => x + style.spriteBase.user));
        this.location = new TextPanelWidget(style, locationFont, gui.locationPlate.map(x => x + style.spriteBase.user), renderer);
        const subtitle = new GuiWidget("bottom", 200);
        this.vehicle = new TextPanelWidget(style, vehicleFont, gui.vehiclePlate.map(x => x + style.spriteBase.user), renderer);

        this.gangWidgetContainer = new WidgetContainer("left", 200);
        const rightWidget = new WidgetContainer("right", 200);
        container.addWidget(subtitle);
        container.addWidget(this.gangWidgetContainer);
        container.addWidget(rightWidget);
        container.addWidget(heads);
        container.addWidget(this.location);
        container.addWidget(this.vehicle);

        this.guiWidgets.push(container);
    }

    public addGang(type: number) {
        if (type > 0) {
            const missionTicks = [gui.easyProgressMark, gui.mediumProgressMark, gui.hardProgressMark] as const;
            const gangWidget = new GangAffiliationWidget(this.style, gui.gangData[type - 1], missionTicks, (<Style>this.style).spriteBase.user, this.renderer);
            this.gangWidgetContainer.addWidget(gangWidget);
        }
    }

    public addPlayer(x: number, y: number, z: number, angle: number): Character {
        this.player = this.addCharacter(x, y, z, angle);
        return this.player;
    }

    public addCharacter(x: number, y: number, z: number, angle: number): Character {
        const characterType = 1;
        const addBase = (x: number) => (<Style>this.style).spriteBase.pedestrian + (characterType * 158) + x;
        const frames: ICharacterAnimation = {
            stand: characterAnimation.stand.map(addBase),
            walk: characterAnimation.walk.map(addBase),
            run: characterAnimation.run.map(addBase),
        };
        const character = new Character(this, frames, x, y, z - 1, angle); // Subtract 1 from height, since objects should be at the bottom of the block.
        this.renderer.worldEntities.push(character);
        return character;
    }

    public setCurrentArea(location: IArea) {
        this.location.showText(location.name.toUpperCase());
    }
}

export async function loadAndCreate(missionName: string, rendererFactory: (style: IStyle) => WebGlCityRenderer, loadFile: (file: string) => Promise<DataView>): Promise<Game> {

    const [styleDataView, mapDataView, scriptDataView, textDataView] = await Promise.all(
        [loadFile(`G2/${missionName}.sty`), loadFile(`G2/${missionName}.gmp`), loadFile(`G2/${missionName}.scr`), loadFile(`G2/e.gxt`)]
    );

    const gameScript = GameScript.readScript(scriptDataView, (subMission) => loadFile(`G2/${missionName}/${subMission}.scr`));
    const style = new Style(styleDataView);
    const texts = new TextContainer(textDataView);
    const map = new GameMap(mapDataView, texts);
    const bigFont = style.fonts[0];
    const subtitleFont = style.fonts[1];
    const carInfoFont = style.fonts[2];
    const locationFont = style.fonts[5];
    const font5 = style.fonts[6];
    const audio1 = null;
    const audio2 = null;

    return new G2Game(map, style, await gameScript, texts, rendererFactory(style), subtitleFont, subtitleFont, locationFont, carInfoFont, subtitleFont, subtitleFont, audio1, audio2);
}

// GUI elements:
const gui = {
    directionArrow: 0,
    gangData: [
        { arrow: 1, minus: 50, plus: 51, icon: 64, progressTick: 71, progressBar: 78 },
        { arrow: 2, minus: 52, plus: 53, icon: 65, progressTick: 72, progressBar: 79 },
        { arrow: 3, minus: 54, plus: 55, icon: 66, progressTick: 73, progressBar: 80 },
        { arrow: 4, minus: 56, plus: 57, icon: 67, progressTick: 74, progressBar: 81 },
        { arrow: 5, minus: 58, plus: 59, icon: 68, progressTick: 75, progressBar: 82 },
        { arrow: 6, minus: 60, plus: 61, icon: 69, progressTick: 76, progressBar: 83 },
        { arrow: 7, minus: 62, plus: 63, icon: 70, progressTick: 77, progressBar: 84 },
    ],
    easyMissionArrow: 8,
    mediumMissionArrow: 9,
    hardMissionArrow: 10,
    vehiclePlate: [11, 12, 13],
    policeHead: [14, 15],
    moneySign: 16,
    livesSymbol: 17,
    multiplierSymbol: 18,
    easyProgressMark: 46,
    mediumProgressMark: 47,
    hardProgressMark: 48,
    handWeapons: [85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95],
    carWeapons: [100, 101, 102, 103, 104, 105, 106, 107, 108],
    bigHeart: 113,
    smallHeart: 114,
    livesNumbers: 115,
    multiplierNumbers: 116,
    pager: { top: 117, middle: 119, bottom: 118, colon: 121, emptyColon: 120, emptyNumber: 122, numbers: [123, 124, 125, 126, 127, 128, 129, 130, 131, 132], blink: 133 },
    armor: 144,
    jailFree: 145,
    invisibility: 152,
    moneyNumbers: 158,
    locationPlate: [159, 160, 161, 162],
};

const characterAnimation: ICharacterAnimation = {
    walk: [0,1,2,3,4,5,6,7],
    run: [8,9,10,11,12,13,14,15],
    stand: [53,54,55,56],
}