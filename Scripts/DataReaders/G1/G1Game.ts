import Game from "../../Game";
import WebGlCityRenderer, { IRenderer } from "../../Rendering/WebGlCityRenderer";

import Style from "./Style";
import GameMap from "./GameMap";
import readMissions from "./MissionReader";
import TextContainer from "./TextContainer";
import Font from "./Font";
import Audio from "./Audio";
import Mission from "./Mission";
import { IGameMap, IStyle, IGameScript, ITextContainer, IFont, IAudio } from "../Interfaces";

export default class G1Game extends Game {
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

export async function loadAndCreate(missionId: number, renderer: WebGlCityRenderer, loadFile: (file: string) => Promise<DataView>): Promise<Game> {
    const missions = readMissions(await loadFile("MISSION.INI"));

    const mission = missions.get(missionId);
    if (!mission) {
        throw new Error(`Can't find mission ${missionId}.`);
    }

    // Load needed data files
    const mapPromise = loadFile(mission.map.toUpperCase()).then(x => new GameMap(x));

    // Meanwhile map is loading, start loading other data files.
    const textsPromise = loadFile("ENGLISH.FXT").then(x => new TextContainer(x));
    const font1Promise = loadFile("SUB2.FON").then(x => new Font(x)); // Brief
    const font2Promise = loadFile("SCORE2.FON").then(x => new Font(x)); // Scores
    const font3Promise = loadFile("STREET2.FON").then(x => new Font(x)); // Locations
    const font4Promise = loadFile("MISSMUL2.FON").then(x => new Font(x)); // Lives & multipliers
    const font5Promise = loadFile("PAGER2.FON").then(x => new Font(x)); // Pager
    const audio1Promise = Promise.all([loadFile("AUDIO/VOCALCOM.SDT"), loadFile("AUDIO/VOCALCOM.RAW")]).then(([index, data]) => new Audio(index, data, false));

    // Wait here until map is loaded, we need information from it to load correct style and city-audio files.
    const map = await mapPromise;
    const levelNumber = map.style.toString().padStart(3, "0");
    const stylePromise = loadFile(`style${levelNumber}.g24`).then(x => new Style(x));
    const audio2Promise = Promise.all([loadFile(`AUDIO/LEVEL${levelNumber}.SDT`), loadFile(`AUDIO/LEVEL${levelNumber}.RAW`)]).then(([index, data]) => new Audio(index, data, false));

    // Wait here global data files.
    const [texts, font1, font2, font3, font4, font5, audio1] = await Promise.all([textsPromise, font1Promise, font2Promise, font3Promise, font4Promise, font5Promise, audio1Promise]);

    // Wait here city-specific data files.
    const [style, audio2] = await Promise.all([stylePromise, audio2Promise]);


    texts.mapIndex = map.style;

    renderer.buildCityModel(map, style);
    return new G1Game(map, style, new Mission(mission), texts, renderer, font1, font2, font3, font4, font5, audio1, audio2);
}