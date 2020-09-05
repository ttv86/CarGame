import { IStyle, ISpriteLocation, IFont } from "../DataReaders/Interfaces";
import { ITextBuffer } from "../Rendering/TextBuffer";
import { IRenderer } from "../Rendering/WebGlCityRenderer";
import Model, { IModelData } from "../Rendering/Model";

type WidgetDock = "left" | "right" | "top" | "bottom";
export default class GuiWidget {
    private isVisible: boolean;
    private currentArea: IDrawArea;
    public readonly debugElement: HTMLDivElement;

    constructor(dock: WidgetDock, size: number) {
        this.dock = dock;
        this.size = size;
        this.isVisible = true;
        this.currentArea = { x: 0, y: 0, width: 0, height: 0 };
        this.debugElement = document.createElement("div");
        this.debugElement.style.outline = "1px inset silver";
        this.debugElement.style.position = "fixed";
        this.debugElement.style.backgroundColor = "rgba(255,255,255,0.2)";
    }

    public readonly dock: WidgetDock;
    public readonly size: number;
    public parent: WidgetContainer | null = null;

    public get visible(): boolean {
        return this.isVisible;
    }

    public set visible(newValue: boolean) {
        this.isVisible = newValue;
        if (this.parent) {
            this.parent.childrenChanged();
        }
    }

    public get area(): IDrawArea {
        return this.currentArea;
    }

    public update(time: number) {
    }

    public render() {
    }

    public renderIfVisible() {
        if (this.visible) {
            this.render();
        }
    }

    public areaChanged(area: IDrawArea) {
        this.currentArea = area;
        this.debugElement.style.top = `${area.y}px`;
        this.debugElement.style.left = `${area.x}px`;
        this.debugElement.style.width = `${area.width}px`;
        this.debugElement.style.height = `${area.height}px`;
    }
}

export class WidgetContainer extends GuiWidget {
    private widgetList: GuiWidget[] = [];

    public get widgets(): readonly GuiWidget[] {
        return this.widgetList;
    }

    public addWidget(widget: GuiWidget) {
        widget.parent = this;
        this.widgetList.push(widget);
        this.debugElement.appendChild(widget.debugElement);
        this.childrenChanged();
    }

    public update(time: number) {
        for (const widget of this.widgetList) {
            widget.update(time);
        }
    }

    public render() {
        for (const widget of this.widgetList) {
            widget.renderIfVisible();
        }
    }

    public areaChanged(area: IDrawArea) {
        super.areaChanged(area);
        const areaLeft = { ...area };
        for (const child of this.widgetList) {
            if (!child.visible) {
                continue;
            }

            switch (child.dock) {
                case "top":
                    child.areaChanged({ x: areaLeft.x, y: areaLeft.y, width: areaLeft.width, height: child.size });
                    areaLeft.y += child.size;
                    areaLeft.height -= child.size;
                    break;
                case "left":
                    child.areaChanged({ x: areaLeft.x, y: areaLeft.y, width: child.size, height: areaLeft.height });
                    areaLeft.x += child.size;
                    areaLeft.width -= child.size;
                    break;
                case "right":
                    child.areaChanged({ x: areaLeft.x + areaLeft.width - child.size, y: areaLeft.y, width: child.size, height: areaLeft.height });
                    areaLeft.width -= child.size;
                    break;
                case "bottom":
                    child.areaChanged({ x: areaLeft.x, y: areaLeft.y + areaLeft.height - child.size, width: areaLeft.width, height: child.size });
                    areaLeft.height -= child.size;
                    break;
            }
        }
    }

    public childrenChanged() {
        this.areaChanged(this.area);
    }
}

const margin = 5;
export class TextPanelWidget extends GuiWidget {
    private readonly sprites: { model: Model, spriteLocation: ISpriteLocation, position: number, width: number }[];
    private readonly width: number;
    private time: number;
    private textBuffer: ITextBuffer;
    private renderer: IRenderer;

    constructor(style: IStyle, font: IFont, sections: readonly number[], renderer: IRenderer) {
        let height = 0;
        const sprites: { model: Model, spriteLocation: ISpriteLocation, position: number, width: number }[] = [];
        let x = 0;
        for (const section of sections) {
            const spriteLocation = style.getSpritePosition(section);
            if (spriteLocation) {
                const model = renderer.createModelFromSprite(spriteLocation, style.spriteImageData);
                sprites.push({ model, spriteLocation, position: x, width: spriteLocation.width - 0.5 });
                x += spriteLocation.width - 0.5;
                height = Math.max(height, spriteLocation.height);
            }
        }

        super("top", height + margin + margin);
        this.sprites = sprites;
        this.time = 0;
        this.width = x;
        this.textBuffer = renderer.createTextBuffer(0, 0, x, height + margin + margin, font, { horizontalAlign: "middle", verticalAlign: "middle" });
        this.visible = false;
        this.renderer = renderer;
    }

    public update(time: number) {
        if (this.time > 0) {
            this.time -= time;
        } else {
            this.time = 0;
            this.visible = false;
        }
    }

    public render() {
        for (const spr of this.sprites) {
            this.renderer.renderSprite(spr.model, spr.position, this.area.y + margin);
        }

        this.renderer.resetWorldMatrix();
        this.renderer.render(this.textBuffer);
    }

    public showText(text: string) {
        if (text) {
            this.textBuffer.setText(text);
            this.time = 5;
            this.visible = true;
        } else {
            this.time = 0;
            this.visible = false;
        }
    }

    public areaChanged(area: IDrawArea) {
        super.areaChanged(area);
        this.textBuffer.setLocation(area.x, area.y, area.width, area.height);
        let start = area.x + (area.width / 2) - (this.width / 2);
        for (const spr of this.sprites) {
            spr.position = start;
            start += spr.width;
        }
    }
}

interface IDrawArea {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
}