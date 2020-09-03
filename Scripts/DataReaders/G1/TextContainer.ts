import { ITextContainer, IArea } from "../Interfaces";
import { IMapArea } from "./GameMap";

export default class TextContainer implements ITextContainer {
    private readonly texts: ReadonlyMap<string, string>;

    constructor(data: DataView) {
        this.texts = decryptTexts(data);
    }

    public mapIndex: number = 0;

    public getAreaName(area: IArea | IMapArea): string {
        if ("voiceId" in area) {
            const areaNameKey = `${this.mapIndex.toString().padStart(3, '0')}area${area.voiceId.toString().padStart(3, "0")}`;
            const result = this.texts.get(areaNameKey);
            if (typeof result === "string") {
                return result;
            }
        }

        return "";
    }

    //public getSpecial(code: SpecialTextCode): string {
    //    let stringCode: string;
    //    switch (code) {
    //        case "north-east":
    //            stringCode = "ne";
    //            break;
    //        case "north":
    //            stringCode = "n";
    //            break;
    //        case "north-west":
    //            stringCode = "nw";
    //            break;
    //        case "east":
    //            stringCode = "e";
    //            break;
    //        case "west":
    //            stringCode = "w";
    //            break;
    //        case "south-east":
    //            stringCode = "se";
    //            break;
    //        case "south":
    //            stringCode = "s";
    //            break;
    //        case "south-west":
    //            stringCode = "sw";
    //            break;
    //        default:
    //            stringCode = code;
    //    }

    //    return this.get(stringCode);
    //}

    public get(code: string): string {
        return this.texts.get(code) ?? code;
    }
}


function decryptTexts(data: DataView): Map<string, string> {
    function add() {
        if (builder) {
            const index = builder.indexOf("]");
            const code = builder.substr(1, index - 1);
            const text = builder.substr(index + 1);
            result.set(code, text);
        }
    }

    const result = new Map<string, string>();
    let secret = 0x63;
    const length = data.byteLength;
    let builder = "";
    let offset = 0;
    for (let i = 0; i < length; i++) {
        let byte = data.getUint8(i);
        if (secret > 0) {
            byte -= secret;
            secret = (secret << 1) & 0xff;
            if (byte < 0) {
                byte += 256;
            }
        }

        byte--;
        if ((byte === 0) || (byte === 0)) {
            add();
            builder = "";
        } else if (byte === 195) {
            offset = 64;
        } else {
            builder += String.fromCharCode(byte + offset);
            offset = 0;
        }
    }

    add();
    return result;
}