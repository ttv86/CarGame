import { BinaryReader } from "./BinaryReader";

const letters = [33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 32, 192, 193, 194, 196, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 210, 211, 212, 214, 217, 218, 219, 220, 223, 224, 225, 226, 228, 230, 231, 232, 233, 234, 235, 236, 237, 238, 239, 242, 243, 244, 246, 249, 250, 251, 252];
const numbers = [48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 120];

export default class Font {
    private coords = new Map<string, ICoords>();

    constructor(data: DataView) {
        const reader = new BinaryReader(data);
        const charCount = reader.readUint8();
        const charHeight = reader.readUint8();

        const charData: {width: number, data: number[]}[] = [];
        for (let i = 0; i < charCount; i++) {
            const width = reader.readUint8();
            const data = reader.readBytes(width * charHeight);
            charData.push({ width, data });
        }

        const palette: [number, number, number][] = [];
        for (let i = 0; i < 256; i++) {
            var r = reader.readUint8();
            var g = reader.readUint8();
            var b = reader.readUint8();
            palette.push([r, g, b]);
        }

        const size = findSize(charHeight + 1, charData.map(x => x.width + 1));
        const imageData = new Uint8ClampedArray(size * size * 4);

        const chars = charCount <= 11 ? numbers : letters;
        let x2 = 0;
        let y2 = 0;
        let charIndex = 0;
        for (const { width, data } of charData)
        {
            if (x2 >= (size - width)) {
                x2 = 0;
                y2 += charHeight + 1;
            }

            this.coords.set(String.fromCharCode(chars[charIndex]), { x: x2 / size, y: y2 / size, w: width / size, h: charHeight / size, width });
            charIndex++;
            for (let y = 0; y < charHeight; y++) {
                for (let x = 0; x < width; x++) {
                    var index = data[(y * width) + x];
                    if (index > 0) {
                        var c = palette[index];
                        const pixelIndex = (((y2 + y) * size) + x2 + x) * 4;
                        imageData[pixelIndex + 0] = c[0];
                        imageData[pixelIndex + 1] = c[1];
                        imageData[pixelIndex + 2] = c[2];
                        imageData[pixelIndex + 3] = 255;
                    }
                }
            }

            x2 += width + 1;
        }

        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const context = canvas.getContext("2d");
        if (!context) {
            throw new Error("Failed to get context");
        }

        context.putImageData(new ImageData(imageData, size), 0, 0);
        this.fontCanvas = canvas;
        this.height = charHeight;
    }

    public readonly height: number;
    public readonly fontCanvas: HTMLCanvasElement;

    public getTextInfo(text: string): { widths: readonly number[], textureCoords: readonly number[] } {
        const textureCoords: number[] = [];
        const widths: number[] = [];
        for (let i = 0; i < text.length; i++) {
            const coords = this.coords.get(text[i]);
            if (coords) {
                textureCoords.push(coords.x, coords.y, coords.x + coords.w, coords.y, coords.x, coords.y + coords.h, coords.x + coords.w, coords.y + coords.h);
                widths.push(coords.width);
            } else {
                textureCoords.push(0, 0, 0, 0, 0, 0, 0, 0);
                widths.push(0);
            }
        }

        return { widths, textureCoords };
    }
}

function findSize(height: number, widths: number[]): number {
    let result = 1;
    while (result < 2048) {
        result *= 2;
        if (result < height) {
            continue;
        }

        let i = 0;
        let leftY = result;
        let leftX = result;
        for (; i < widths.length; i++) {
            if (leftX >= widths[i]) {
                leftX -= widths[i];
            }
            else {
                leftY -= height;
                if (leftY < height) {
                    i = widths.length * 2;
                    continue;
                }

                leftX = result - widths[i];
            }
        }

        if (i == widths.length) {
            break;
        }
    }

    return result;
}

interface ICoords {
    x: number;
    y: number;
    w: number;
    h: number;
    width: number;
}