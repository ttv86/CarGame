import { BinaryReader } from "../BinaryReader";
import { ITextContainer } from "../Interfaces";

export const TextChars = [33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 32, 192, 193, 194, 196, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 210, 211, 212, 214, 217, 218, 219, 220, 223, 224, 225, 226, 228, 230, 231, 232, 233, 234, 235, 236, 237, 238, 239, 242, 243, 244, 246, 249, 250, 251, 252, 209, 241, 191, 161];

export default class TextContainer implements ITextContainer {
    private texts = new Map<string, string>();
    constructor(data: DataView) {
        const reader = new BinaryReader(data);
        const magic = reader.readString(3);
        reader.readUint8(); // language specifier. We don't really care about it.
        const version = reader.readUint16();
        if ((magic !== "GBL") || (version !== 100)) {
            throw new Error("Invalid text file");
        }

        let textData: Uint8ClampedArray | null = null;
        const offsets: [number, string][] = [];
        while (reader.position < reader.length) {
            const blockType = reader.readString(4);
            const blockSize = reader.readUint32();
            const end = reader.position + blockSize;
            switch (blockType) {
                case "TKEY":
                    while (reader.position < end) {
                        const offset = reader.readUint32();
                        const key = reader.readString(8).replace(/\0/g, "");
                        offsets.push([offset, key]);
                    }

                    break;
                case "TDAT":
                    textData = reader.readByteArray(blockSize);
                    break;
                default:
                    console.log(`Unknown text block ${blockType}: ${blockSize}`);
                    reader.position += blockSize;
                    break;
            }
        }

        if (!(textData && offsets.length)) {
            throw new Error("Invalid text file");
        }

        for (const [offset, key] of offsets) {
            let pointer = offset;
            let text = "";
            if (textData[pointer + 1] === 0x21) {
                // TODO:
                ////switch (textData[pointer]) {
                ////    case 110: // n
                ////        text += "\uE000face0\uE000"
                ////        break;
                ////    case 122: // z
                ////        text += "\uE000face1\uE000"
                ////        break;
                ////    case 121: // y
                ////        text += "\uE000face2\uE000"
                ////        break;
                ////    case 108: // l
                ////        text += "\uE000face3\uE000"
                ////        break;
                ////    case 114: // r
                ////        text += "\uE000face4\uE000"
                ////        break;
                ////    case 115: // s
                ////        text += "\uE000face5\uE000"
                ////        break;
                ////    case 109: // m
                ////        text += "\uE000face6\uE000"
                ////        break;
                ////    case 107: // k
                ////        text += "\uE000face7\uE000"
                ////        break;
                ////}

                pointer += 2;
            }

            do {
                const value = textData[pointer];
                pointer += 2;
                if (value === 0) {
                    break;
                } else if (value >= 0x21) {
                    const valueMinus21 = value - 0x21;
                    if (valueMinus21 < TextChars.length) {
                        text += String.fromCharCode(TextChars[valueMinus21]);
                        continue;
                    }
                }

                text += String.fromCharCode(value);
            } while (textData[pointer] !== 0);

            // Remove #-characters from end.
            text = text.replace(/#+$/, "");
            let isBlue = false;
            text = text.replace(/#/g, () => {
                isBlue = !isBlue;
                // TODO:
                ////const result = isBlue ? "\uE000blue\uE000" : "\uE000white\uE000";
                const result = "";
                return result;
            });

            this.texts.set(key, text);
        }

        //console.log(this.texts);
    }

    //public getAreaName(area: IArea): string {
    //    const result = this.get(area.name, false).toUpperCase();
    //    return result ? result : area.name;
    //}
    public get(code: string, allowFormating: boolean): string {
        const result = this.texts.get(code) ?? "";
        return result;
    }
    //public getSpecial(code: SpecialTextCode): string {
    //    return "";
    //}
}