import GuiWidget from "../../GuiWidgets/GuiWidget";
import { IStyle } from "../Interfaces";
import { IRenderer } from "../../Rendering/WebGlCityRenderer";
import Model from "../../Rendering/Model";

const margin = 5;
const iconWidth = 26;
export default class GangAffiliationWidget extends GuiWidget {
    private readonly renderer: IRenderer;
    private readonly iconSprite: Model;
    private readonly plusSprite: Model;
    private readonly minusSprite: Model;
    private readonly progressBarTickSprite: Model;
    private readonly progressBarSprite: Model;
    private readonly easyMissionSprite: Model;
    private readonly mediumMissionSprite: Model;
    private readonly hardMissionSprite: Model;
    private reputation: number;

    constructor(style: IStyle, elements: IGangGuiElements, missionTicks: readonly [number, number, number], spriteBase: number, renderer: IRenderer) {
        const icon = style.getSpritePosition(spriteBase + elements.icon);
        const plus = style.getSpritePosition(spriteBase + elements.plus);
        const minus = style.getSpritePosition(spriteBase + elements.minus);
        const progressTick = style.getSpritePosition(spriteBase + elements.progressTick);
        const progressBar = style.getSpritePosition(spriteBase + elements.progressBar);

        const easyMissions = style.getSpritePosition(spriteBase + missionTicks[0]);
        const mediumMissions = style.getSpritePosition(spriteBase + missionTicks[1]);
        const hardMissions = style.getSpritePosition(spriteBase + missionTicks[2]);

        if (!(icon && plus && minus && progressTick && progressBar && easyMissions && mediumMissions && hardMissions)) {
            throw new Error("Couldn't find all element sprites.");
        }

        super("top", Math.max(icon?.height ?? 0, progressBar?.height ?? 0) + margin);
        this.renderer = renderer;
        this.iconSprite = renderer.createModelFromSprite(icon, style.spriteImageData);
        this.plusSprite = renderer.createModelFromSprite(plus, style.spriteImageData);
        this.minusSprite = renderer.createModelFromSprite(minus, style.spriteImageData);
        this.progressBarTickSprite = renderer.createModelFromSprite(progressTick, style.spriteImageData);
        this.progressBarSprite = renderer.createModelFromSprite(progressBar, style.spriteImageData);
        this.easyMissionSprite = renderer.createModelFromSprite(easyMissions, style.spriteImageData);
        this.mediumMissionSprite = renderer.createModelFromSprite(mediumMissions, style.spriteImageData);
        this.hardMissionSprite = renderer.createModelFromSprite(hardMissions, style.spriteImageData);
        this.reputation = 0;
    }

    public render() {
        this.renderer.renderSprite(this.iconSprite, this.area.x + margin, this.area.y + margin);
        this.renderer.renderSprite(this.progressBarSprite, this.area.x + iconWidth + margin, this.area.y + margin + 3);
        if (this.reputation < -10) {
            this.renderer.renderSprite(this.minusSprite, this.area.x + iconWidth + margin + 2, this.area.y + margin + 5);
            const count = Math.round(-this.reputation / 25);
            for (let i = 0; i <= count; i++) {
                this.renderer.renderSprite(this.progressBarTickSprite, this.area.x + iconWidth + margin + 34 - (i * 5), this.area.y + margin + 5);
            }
        } else {
            this.renderer.renderSprite(this.plusSprite, this.area.x + iconWidth + margin + 59, this.area.y + margin + 5);
            const count = Math.round(this.reputation / 25);
            for (let i = 0; i <= count; i++) {
                this.renderer.renderSprite(this.progressBarTickSprite, this.area.x + iconWidth + margin + 34 + (i * 5), this.area.y + margin + 5);
            }

            if (this.reputation > -10) {
                this.renderer.renderSprite(this.easyMissionSprite, this.area.x + iconWidth + margin + 33, this.area.y + margin + 16);
            }

            if (this.reputation > 30) {
                this.renderer.renderSprite(this.mediumMissionSprite, this.area.x + iconWidth + margin + 43, this.area.y + margin + 16);
            }

            if (this.reputation > 60) {
                this.renderer.renderSprite(this.hardMissionSprite, this.area.x + iconWidth + margin + 53, this.area.y + margin + 16);
            }
        }
    }

    public setReputation(reputation: number) {
        this.reputation = reputation;
    }
}

interface IGangGuiElements {
    readonly arrow: number;
    readonly minus: number;
    readonly plus: number;
    readonly icon: number;
    readonly progressTick: number;
    readonly progressBar: number;
}