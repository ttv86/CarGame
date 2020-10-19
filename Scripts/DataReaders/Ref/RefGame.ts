import Game from "../../Game";
import GameMap from "./GameMap";
import Style from "./Style";
import { ITextContainer, IStyle, IGameScript } from "../Interfaces";
import { IRenderer } from "../../Rendering/WebGlCityRenderer";

export default class RefGame extends Game {
    constructor(game: GameMap, style: IStyle, gameScript: IGameScript, texts: ITextContainer, renderer: IRenderer) {
        super(game, style, gameScript, texts, renderer, null!, null!, null!, null!, null!, null!, null!);
    }
}

export async function loadAndCreate(rendererFactory: (style: IStyle) => IRenderer, loadFile: (file: string) => Promise<DataView>): Promise<Game> {
    const [mapDataView, tilePng] = await Promise.all(
        [loadFile(`RefLevel/TestLevel1.json`), loadFile("RefLevel/TestLevel1.png")]
    );

    const map = new GameMap(mapDataView);
    const style = new Style(tilePng);
    const gameScript: IGameScript = { initialize: () => { }, update: () => { } };
    const texts: ITextContainer = { get: () => "?" };
    return new RefGame(map, style, gameScript, texts, rendererFactory(style));
}