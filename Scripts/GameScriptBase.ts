import { IGameScript } from "./DataReaders/Interfaces";
import Game from "./Game";

export default class GameScriptBase implements IGameScript {
    protected game: Game = null!;

    constructor() {
    }

    public initialize(game: Game): void {
        this.game = game;
    }

    public update(time: number): void {
    }
}