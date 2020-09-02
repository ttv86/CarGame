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
import TextContainer from "./TextContainer";

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
        this.showText(1600, "phone");
    }
}

export async function loadAndCreate(missionName: string, renderer: WebGlCityRenderer, loadFile: (file: string) => Promise<DataView>): Promise<Game> {

    const [styleDataView, mapDataView, scriptDataView, textDataView] = await Promise.all(
        [loadFile(`G2/${missionName}.sty`), loadFile(`G2/${missionName}.gmp`), loadFile(`G2/${missionName}.scr`), loadFile(`G2/e.gxt`)]
    );

    const style = new Style(styleDataView);
    const map = new GameMap(mapDataView);
    const gameScript = new GameScript(scriptDataView);
    const texts = new TextContainer(textDataView);
    const bigFont = style.fonts[0];
    const subtitleFont = style.fonts[1];
    const carInfoFont = style.fonts[2];
    const locationFont = style.fonts[5];
    const font5 = style.fonts[6];
    const audio1 = null!;
    const audio2 = null!;

    renderer.buildCityModel(map, style);
    return new G2Game(map, style, gameScript, texts, renderer, subtitleFont, subtitleFont, locationFont, subtitleFont, subtitleFont, audio1, audio2);
}