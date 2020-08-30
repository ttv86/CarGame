import Game from "../../Game";
import WebGlCityRenderer, { IRenderer } from "../../Rendering/WebGlCityRenderer";

//import Style from "./Style";
//import GameMap from "./GameMap";
//import readMissions from "./MissionReader";
//import TextContainer from "./TextContainer";
//import Font from "./Font";
//import Audio from "./Audio";
//import Mission from "./Mission";
import { IGameMap, IStyle, IGameScript, ITextContainer, IFont, IAudio } from "../Interfaces";
import Style from "./Style";
import GameScript from "./GameScript";
import GameMap from "./GameMap";

export default class G2Game extends Game {
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
        super(map, style, gameScript, texts, renderer, subtitleFont, pointFont, locationFont, lifeFont, pagerFont, globalAudio, localAudio);
    }
}

export async function loadAndCreate(missionName: string, renderer: WebGlCityRenderer, loadFile: (file: string) => Promise<DataView>): Promise<Game> {

    const [styleDataView, mapDataView, scriptDataView] = await Promise.all([loadFile(`${missionName}.sty`), loadFile(`${missionName}.gmp`), loadFile(`${missionName}.scr`)]);

    const style = new Style(styleDataView);
    const map = new GameMap(mapDataView);
    const gameScript = new GameScript(scriptDataView);
    const texts = null!;
    const font1 = null!;
    const font2 = null!;
    const font3 = null!;
    const font4 = null!;
    const font5 = null!;
    const audio1 = null!;
    const audio2 = null!;

    renderer.buildCityModel(map, style);    
    return new G2Game(map, style, gameScript, texts, renderer, font1, font2, font3, font4, font5, audio1, audio2);
}