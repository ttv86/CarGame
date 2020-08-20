import WebGlCityRenderer, { ITextBufferOptions, IRenderer } from "./WebGlCityRenderer";
import Font from "../DataReaders/Font";
import { HorizontalAlign, VerticalAlign } from "../Types";
import Model from "./Model";
import { IBaseRenderer } from "./WebGlBaseRenderer";

export default class TextBuffer implements ITextBuffer {
    private font: Font;
    private x: number;
    private y: number;
    private width: number;
    private height: number;
    private text: string = "";
    private horizontalAlign: HorizontalAlign;
    private verticalAlign: VerticalAlign;
    private wordWrap: boolean;
    private dimensions: [number, number] = [0, 0];

    public readonly model: Model;

    constructor(renderer: IBaseRenderer, font: Font, x: number, y: number, width: number, height: number, options?: ITextBufferOptions) {
        this.font = font;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.horizontalAlign = options?.horizontalAlign ?? "start";
        this.verticalAlign = options?.verticalAlign ?? "top";
        this.wordWrap = options?.wordWrap ?? false;

        this.model = renderer.createTextModel({
            positions: [],
            texture: this.font.fontCanvas,
            center: { x: 0, y: 0 },
            indices: [],
            textureCoords: [],
            transparent: true,
        });
    }

    public setText(text: string): void {
        this.text = text;

        const { textureCoords, widths } = this.font.getTextInfo(text);
        const splits: number[] = [];
        if (this.wordWrap) {
            let previousPossibleSplit: number | null = null;
            let left = this.width;
            for (let i = 0; i < widths.length; i++) {
                if (text.charAt(i) === " ") {
                    previousPossibleSplit = i;
                }

                const w = widths[i];
                if ((left < w) || (text.charAt(i) === "\n")) {
                    const thisPos = (previousPossibleSplit ?? i) + 1;
                    splits.push(thisPos);
                    i = thisPos;
                    previousPossibleSplit = null;
                    left = this.width;
                } else {
                    left -= w;
                }
            }
        } else {
            for (let i = 0; i < widths.length; i++) {
                if (text.charAt(i) === "\n") {
                    const thisPos = i + 1;
                    splits.push(thisPos);
                    i = thisPos;
                }
            }
        }

        const h = this.font.height;

        const positions: number[] = [];
        const indices: number[] = [];
        let textHeight = (splits.length + 1) * h;
        let yy: number;
        switch (this.verticalAlign) {
            default:
            case "top":
                yy = this.y;
                break;
            case "middle":
                yy = this.y + ((this.height - textHeight) / 2);
                break;
            case "bottom":
                yy = this.y + this.height - textHeight;
                break;
        }

        let maxX = this.x;
        let row = 0;
        let rowWidth = calculateWidth(widths, 0, splits[0]);
        let xx: number;
        switch (this.horizontalAlign) {
            default:
            case "start":
                xx = this.x;
                break;
            case "middle":
                xx = this.x + ((this.width - rowWidth) / 2);
                break;
            case "end":
                xx = this.x + this.width - rowWidth;
                break;
        }

        for (let i = 0; i < widths.length; i++) {
            if (splits.indexOf(i) > -1) {
                row++;
                rowWidth = calculateWidth(widths, splits[row], splits[row + 1]);
                switch (this.horizontalAlign) {
                    default:
                    case "start":
                        xx = this.x;
                        break;
                    case "middle":
                        xx = this.x + ((this.width - rowWidth) / 2);
                        break;
                    case "end":
                        xx = this.x + this.width - rowWidth;
                        break;
                }

                xx = this.x;
                yy += h;
            }
            const w = widths[i];
            positions.push(
                xx + 0, yy + 0, 0,
                xx + w, yy + 0, 0,
                xx + 0, yy + h, 0,
                xx + w, yy + h, 0);
            const j = i * 4;
            indices.push(j + 0, j + 1, j + 2, j + 2, j + 1, j + 3);
            xx += w;
            maxX = Math.max(maxX, xx);
        }

        this.model.updateModel({
            positions,
            indices,
            textureCoords,
        });
        this.dimensions = [maxX - this.x, this.font.height * (splits.length + 1)];
    }

    public setLocation(x: number, y: number, width: number, height: number): void {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.setText(this.text);
    }

    public getDimensions(): [number, number] {
        return this.dimensions;
    }
}

function calculateWidth(widths: readonly number[], startIndex: number, endIndex?: number) {
    if (endIndex === void 0) {
        endIndex = widths.length;
    }

    let result = 0;
    for (let i = startIndex; i < endIndex; i++) {
        result += widths[i];
    }

    return result;
}

export interface ITextBuffer {
    setText(text: string): void;
    setLocation(x: number, y: number, width: number, height: number): void;
    /** Gets dimensions of currently set text. */
    getDimensions(): [number, number];
}