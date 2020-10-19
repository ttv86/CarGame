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
import Character, { ICharacterAnimation } from "../../WorldEntities/Character";

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

    public addPlayer(x: number, y: number, z: number, angle: number): Character {
        this.player = new Character(this, characterAnimation, x, y, z, angle);
        this.renderer.worldEntities.push(this.player);
        return this.player;
    }
}

export async function loadAndCreate(missionId: number, renderer: WebGlCityRenderer, loadFile: (file: string) => Promise<DataView>): Promise<Game> {
    const missions = readMissions(await loadFile("G1/MISSION.INI"));

    const mission = missions.get(missionId);
    if (!mission) {
        throw new Error(`Can't find mission ${missionId}.`);
    }

    // Load needed data files
    const texts = await loadFile("G1/ENGLISH.FXT").then(x => new TextContainer(x));
    const mapPromise = loadFile(`G1/${mission.map.toUpperCase()}`).then(x => new GameMap(x, texts));

    // Meanwhile map is loading, start loading other data files.
    const font1Promise = loadFile("G1/SUB2.FON").then(x => new Font(x)); // Brief
    const font2Promise = loadFile("G1/SCORE2.FON").then(x => new Font(x)); // Scores
    const font3Promise = loadFile("G1/STREET2.FON").then(x => new Font(x)); // Locations
    const font4Promise = loadFile("G1/MISSMUL2.FON").then(x => new Font(x)); // Lives & multipliers
    const font5Promise = loadFile("G1/PAGER2.FON").then(x => new Font(x)); // Pager
    const audio1Promise = Promise.all([loadFile("G1/AUDIO/VOCALCOM.SDT"), loadFile("G1/AUDIO/VOCALCOM.RAW")]).then(([index, data]) => new Audio(index, data, false));

    // Wait here until map is loaded, we need information from it to load correct style and city-audio files.
    const map = await mapPromise;
    const levelNumber = map.style.toString().padStart(3, "0");
    const stylePromise = loadFile(`G1/style${levelNumber}.g24`).then(x => new Style(x));
    const audio2Promise = Promise.all([loadFile(`G1/AUDIO/LEVEL${levelNumber}.SDT`), loadFile(`G1/AUDIO/LEVEL${levelNumber}.RAW`)]).then(([index, data]) => new Audio(index, data, false));

    // Wait here global data files.
    const [font1, font2, font3, font4, font5, audio1] = await Promise.all([font1Promise, font2Promise, font3Promise, font4Promise, font5Promise, audio1Promise]);

    // Wait here city-specific data files.
    const [style, audio2] = await Promise.all([stylePromise, audio2Promise]);


    texts.mapIndex = map.style;

    return new G1Game(map, style, new Mission(mission), texts, renderer, font1, font2, font3, font4, font5, audio1, audio2);
}

const characterAnimation: ICharacterAnimation = {
    stand: [743],
    run: [654,655,656,657,658,659,660],
    walk: [645,646,647,648,649,650,651,652],
}