import GameScriptBase from "../../GameScriptBase"
import { BinaryReader } from "../BinaryReader";
import G2Game from "./G2Game";
import Character from "../../WorldEntities/Character";

export default class GameScript extends GameScriptBase {
    private initCommands: { name: string, params: readonly unknown[] }[] = [];
    constructor() {
        super();
    }

    private setPlayerPosition(unk1: unknown, unk2: unknown, position: unknown, heading: unknown, remap: unknown) {
        console.log(`setPlayerPosition(pos: ${position}, heading: ${heading}, remap: ${remap})`);
        this.initCommands.push({ name: "setPlayerPosition", params: [position, heading, remap] });
    }

    private setGangInfo(name: unknown, remap: unknown, weapon1: unknown, weapon2: unknown, weapon3: unknown, arrow: unknown, kill: unknown, pos: unknown, car: unknown, carRemap: unknown): void {
        console.log(`setGangInfo(name: ${name}, remap: ${remap}, weapon1:${weapon1}, weapon2:${weapon2}, weapon3:${weapon3}, arrow:${arrow}, kill:${kill}, pos:${pos}, car:${car}, carRemap:${carRemap})`);
        this.initCommands.push({ name: "setGangInfo", params: [name, remap, weapon1, weapon2, weapon3, arrow, kill, pos, car, carRemap] });
    }

    public initialize(game: G2Game): void {
        super.initialize(game);
        for (const { name, params } of this.initCommands) {
            switch (name) {
                case "setPlayerPosition":
                    const coordinates = <[number, number, number]>params[0];
                    const angle = <number>params[1];
                    this.game.player = new Character(this.game, this.game.renderer, this.game.style, coordinates[0], coordinates[1], coordinates[2], angle * (Math.PI / 180));
                    this.game.renderer.worldEntities.push(this.game.player);
                    break;
                case "setGangInfo":
                    game.addGang(<number>params[5]);
                    break;
            };
        }
    }

    public static async readScript(baseScriptData: DataView, loader: (subMission: string) => Promise<DataView>): Promise<GameScript> {
        const reader = new BinaryReader(baseScriptData);
        const header = reader.readUint16();
        if (header !== 0) {
            throw new Error("Invalid base script");
        }

        const result = new GameScript();
        reader.position = 0x2ee8; // Base script always has main code starting at this point.
        const end = 0x12ee0; // Base script always has main this code length.
        GameScript.readCode(reader, end, result);

        return result;
    }

    private static readCode(reader: BinaryReader, end: number, gameScript: GameScript) {
        while (reader.position < end) {
            const startPos = reader.position;
            const line = reader.readUint16();
            if (line === 0) {
                continue;
            }

            const type = reader.readUint16();
            const nextLine = reader.readUint16();
            const immediate = reader.readUint16();
            if ((immediate !== 0) && (immediate !== 1)) {
                throw new Error(`Unexpected value: ${immediate}`);
            }

            //console.log(`${startPos.toString(16).padStart(8, "0")} ${type.toString(16).padStart(4, "0")}`);
            const parameters = funcInfo.get(type);
            if (parameters) {
                const funcParams = readParameters(reader, parameters[0])
                const funcName = parameters[1];
                if (funcName) {
                    const func = (gameScript as unknown as Record<string, () => void>)[funcName];
                    if (func) {
                        func.apply(gameScript, funcParams as []);
                    }
                }
            } else {
                throw new Error(`Unexpected value: ${type}`);
            }
        }
    }
}

function readParameters(reader: BinaryReader, parameters: string): readonly unknown[] {
    const result: unknown[] = [];
    for (const char of parameters) {
        switch (char) {
            case "u": // unsigned 16 bit
            case "0": // Unknown parameter (unsigned 16 bit)
            case "V": // Variable reference
            case "L": // Line reference
            case "T": // Text reference
            case "S": // String reference
            case "M": // Message reference
                result.push(reader.readUint16());
                break;
            case "b": // unsigned 8 bit
                result.push(reader.readUint8());
                break;
            case "s": // signed 16 bit
                result.push(reader.readInt16());
                break;
            case "f": // floating point
                result.push(reader.readUint32() / 16384);
                break;
            case "c": // 3 floating points (coordinates)
                result.push([reader.readUint32() / 16384, reader.readUint32() / 16384, reader.readUint32() / 16384]);
                break;
            case "i": // signed 32 bit
                result.push(reader.readUint32());
                break;
            default:
                throw new Error("Unknown parameter type");
        }
    }

    return result;
}

const funcInfo = new Map<number, [string, (string | null)]>([
    [0x0005, ["00cuu", "setPlayerPosition"]],
    [0x0006, ["00000000", null]],
    [0x0007, ["V0cuuu0", null]],
    [0x0008, ["V0cuuu0", null]],
    [0x0009, ["Vucuuuu", null]],
    [0x000a, ["Vucuuuu", null]],
    [0x000b, ["Vucuuuu", null]],
    [0x000c, ["Vucuuuu", null]],
    [0x000d, ["Vucuuuu", null]],
    [0x000e, ["V0cuu", null]],
    [0x000f, ["V0cuu", null]],
    [0x0010, ["V0cuu", null]],
    [0x0011, ["V0cuuu0", null]],
    [0x0012, ["V0cuuu0", null]],
    [0x0013, ["V0cuuu0", null]],
    [0x0014, ["V0cuuu0", null]],
    [0x0015, ["u0", null]],
    // [0x0016, ["?", null]],
    [0x0017, ["00", null]],
    [0x0018, ["00", null]],
    [0x0019, ["00cffbb0", null]],
    [0x001A, ["00cffbb0", null]],
    [0x001B, ["00cffbb0", null]],
    [0x001C, ["00cuuuuu0", null]],
    [0x001D, ["00cuuuuu0", null]],
    [0x001E, ["00cuuuuu0", null]],
    [0x001F, ["00cuuuuu0", null]],
    [0x0020, ["00cuuuuu0", null]],
    [0x0021, ["00cff", null]],
    [0x0022, ["00cff", null]],
    [0x0023, ["00cff", null]],
    [0x0024, ["0000000000", null]],
    [0x0025, ["00u0ffuuffuuff", null]],
    [0x0026, ["00u0ffuuffu0", null]],
    [0x0027, ["00u0ffuu", null]],
    [0x0028, ["00ff", null]],
    [0x0029, ["V0cuuu0", null]],
    [0x002A, ["V0cuuu0", null]],
    [0x002B, ["Vucuuuu", null]],
    [0x002C, ["Vucuuuu", null]],
    [0x002D, ["Vucuuuu", null]],
    [0x002E, ["Vucuuuu", null]],
    [0x002F, ["V0cuuu0", null]],
    [0x0030, ["V0cuuu0", null]],
    [0x0031, ["V0cuu", null]],
    [0x0032, ["V0cuuu0", null]],
    [0x0033, ["V0cuuu0", null]],
    [0x0034, ["V0cuu", null]],
    // [0x0035, ["?", null]],
    // [0x0036, ["?", null]],
    // [0x0037, ["?", null]],
    // [0x0038, ["?", null]],
    // [0x0039, ["?", null]],
    // [0x003A, ["?", null]],
    [0x003B, ["", null]],
    [0x003C, ["", null]],
    [0x003D, ["00", null]],
    [0x003E, ["00", null]],
    [0x003F, ["", null]],
    [0x0040, ["", null]],
    // [0x0041, ["?", null]],
    // [0x0042, ["?", null]],
    [0x0043, ["", null]],
    [0x0044, ["", null]],
    // [0x0045, ["?", null]],
    // [0x0046, ["?", null]],
    [0x0047, ["", null]],
    // [0x0048, ["?", null]],
    // [0x0049, ["?", null]],
    // [0x004A, ["?", null]],
    // [0x004B, ["?", null]],
    // [0x004C, ["?", null]],
    [0x004D, ["L0", null]],
    [0x004E, ["L0", null]],
    [0x004F, ["Vu", null]],
    [0x0050, ["uV", null]],
    [0x0051, ["VV", null]],
    [0x0052, ["Vu", null]],
    [0x0053, ["uV", null]],
    [0x0054, ["Vu", null]],
    // [0x0055, ["?", null]],
    [0x0056, ["Vu", null]],
    [0x0057, ["VV", null]],
    [0x0058, ["Vu", null]],
    [0x0059, ["VV", null]],
    [0x005A, ["Vu", null]],
    [0x005B, ["VV", null]],
    [0x005C, ["Vu", null]],
    [0x005D, ["VV", null]],
    [0x005E, ["Vu", null]],
    [0x005F, ["VV", null]],
    [0x0060, ["V0", null]],
    [0x0061, ["V0", null]],
    [0x0062, ["uL", null]],
    // [0x0063, ["?", null]],
    [0x0064, ["00", null]],
    // [0x0065, ["?", null]],
    [0x0066, ["uuuuuuuuuuu0", null]],
    [0x0067, ["V0u0", null]],
    [0x0068, ["V0u0", null]],
    [0x0069, ["V0u0", null]],
    [0x006A, ["V0u0", null]],
    [0x006B, ["V0u0", null]],
    [0x006C, ["V0u0", null]],
    [0x006D, ["V0u0", null]],
    [0x006E, ["V0u0", null]],
    [0x006F, ["V0u0", null]],
    [0x0070, ["V0u0", null]],
    [0x0071, ["V0V0", null]],
    [0x0072, ["cV0", null]],
    [0x0073, ["00", null]],
    [0x0074, ["V0", null]],
    [0x0075, ["T0", null]],
    [0x0076, ["T0", null]],
    [0x0077, ["Vu", null]],
    [0x0078, ["V0", null]],
    [0x0079, ["VV", null]],
    [0x007A, ["Vu", null]],
    [0x007B, ["V0", null]],
    [0x007C, ["V0", null]],
    [0x007D, ["V0", null]],
    [0x007E, ["Vu", null]],
    [0x007F, ["V0", null]],
    [0x0080, ["VV", null]],
    [0x0081, ["00", null]],
    [0x0082, ["00", null]],
    [0x0083, ["00", null]],
    [0x0084, ["Vuuu", null]],
    [0x0085, ["Vuc", null]],
    [0x0086, ["V0", null]],
    [0x0087, ["00", null]],
    [0x0088, ["V0c", null]],
    [0x0089, ["V0c", null]],
    [0x008A, ["Vu", null]],
    [0x008B, ["V0c", null]],
    [0x008C, ["V0", null]],
    [0x008D, ["V0i", null]],
    [0x008E, ["c", null]],
    [0x008F, ["cuo", null]],
    [0x0090, ["V0", null]],
    [0x0091, ["V0cff", null]],
    [0x0092, ["V0cff", null]],
    [0x0093, ["V0cff", null]],
    [0x0094, ["V0cff", null]],
    [0x0095, ["V0cff", null]],
    [0x0096, ["V0cff", null]],
    [0x0097, ["Vu", null]],
    [0x0098, ["Vu", null]],
    [0x0099, ["Vu", null]],
    [0x009A, ["V0", null]],
    [0x009B, ["00", null]],
    [0x009C, ["00", null]],
    [0x009D, ["00", null]],
    [0x009E, ["00", null]],
    [0x009F, ["uuuu", null]],
    [0x00A0, ["V0", null]],
    [0x00A1, ["0u", null]],
    [0x00A2, ["0u", null]],
    [0x00A3, ["V0", null]],
    [0x00A4, ["Vu", null]],
    [0x00A5, ["00", null]],
    [0x00A6, ["00", null]],
    [0x00A7, ["00", null]],
    [0x00A8, ["u0u0u0", null]],
    // [0x00A9, ["?", null]],
    [0x00AA, ["00", null]],
    [0x00AB, ["VV", null]],
    // [0x00AC, ["?", null]],
    [0x00AD, ["V0", null]],
    [0x00AE, ["00", null]],
    [0x00AF, ["00", null]],
    [0x00B0, ["V0cff", null]],
    [0x00B1, ["V0", null]],
    [0x00B2, ["V0", null]],
    [0x00B3, ["V0", null]],
    [0x00B4, ["V0", null]],
    // [0x00B5, ["?", null]],
    [0x00B6, ["bbbb00", null]],
    [0x00B7, ["bbbb", null]],
    [0x00B8, ["bbbb", null]],
    [0x00B9, ["bbbbu0", null]],
    [0x00BA, ["bbbbu0", null]],
    [0x00BB, ["bbbbu0", null]],
    [0x00BC, ["00", null]],
    [0x00BD, ["u0cff", null]],
    [0x00BE, ["00", null]],
    [0x00BF, ["00", null]],
    [0x00C0, ["00", null]],
    [0x00C1, ["00", null]],
    [0x00C2, ["V0i", null]],
    [0x00C3, ["00", null]],
    [0x00C4, ["00", null]],
    [0x00C5, ["00", null]],
    [0x00C6, ["uuuu", null]],
    [0x00C7, ["uuuu", null]],
    [0x00C8, ["00", null]],
    [0x00C9, ["00", null]],
    [0x00CA, ["00", null]],
    [0x00CB, ["00", null]],
    // [0x00CC, ["?", null]],
    [0x00CD, ["V0c", null]],
    [0x00CE, ["00", null]],
    [0x00CF, ["00", null]],
    [0x00D0, ["uuuu", null]],
    [0x00D1, ["00", null]],
    [0x00D2, ["0000", null]],
    [0x00D3, ["000LVV", null]],
    [0x00D4, ["000LVbbbb0", null]],
    [0x00D5, ["000LVV", null]],
    [0x00D6, ["000LcffV0", null]],
    [0x00D7, ["00", null]],
    [0x00D8, ["V0", null]],
    [0x00D9, ["V0cbbbbfbbbb", null]],
    [0x00DA, ["00", null]],
    [0x00DB, ["V0cbbbbfbbbb", null]],
    [0x00DC, ["00", null]],
    [0x00DD, ["V0bbbb", null]],
    [0x00DE, ["V0f", null]],
    [0x00DF, ["Sbbbbbbcuu", "setGangInfo"]],
    [0x00E0, ["VuV0", null]],
    // [0x00E1, ["?", null]],
    [0x00E2, ["fu0", null]],
    [0x00E3, ["00", null]],
    [0x00E4, ["00", null]],
    [0x00E5, ["00", null]],
    [0x00E6, ["uuuu", null]],
    [0x00E7, ["uuuu", null]],
    [0x00E8, ["VV", null]],
    [0x00E9, ["00", null]],
    [0x00EA, ["00", null]],
    [0x00EB, ["00", null]],
    [0x00EC, ["00", null]],
    [0x00ED, ["00", null]],
    [0x00EE, ["00", null]],
    [0x00EF, ["00", null]],
    [0x00F0, ["00", null]],
    [0x00F1, ["00", null]],
    [0x00F2, ["VV", null]],
    [0x00F3, ["00", null]],
    [0x00F4, ["00", null]],
    [0x00F5, ["V0", null]],
    [0x00F6, ["VV", null]],
    [0x00F7, ["VV", null]],
    [0x00F8, ["V0", null]],
    [0x00F9, ["V0", null]],
    [0x00FA, ["V0", null]],
    [0x00FB, ["V0", null]],
    [0x00FC, ["00", null]],
    [0x00FD, ["V0", null]],
    [0x00FE, ["V0", null]],
    [0x00FF, ["00", null]],
    [0x0100, ["00", null]],
    [0x0101, ["", null]],
    [0x0102, ["VV", null]],
    [0x0103, ["V0", null]],
    [0x0104, ["VV", null]],
    [0x0105, ["", null]],
    [0x0106, ["VuV0", null]],
    [0x0107, ["TVVMVVVVVuM0", null]],
    [0x0108, ["00", null]],
    [0x0109, ["VV", null]],
    [0x010A, ["uuuu", null]],
    [0x010B, ["00", null]],
    [0x010C, ["Vu", null]],
    [0x010D, ["Vu", null]],
    [0x010E, ["V0cff", null]],
    [0x010F, ["VV", null]],
    [0x0110, ["", null]],
    [0x0111, ["", null]],
    [0x0112, ["M0", null]],
    [0x0113, ["u0", null]],
    [0x0114, ["u0", null]],
    [0x0115, ["", null]],
    [0x0116, ["V0", null]],
    [0x0117, ["T0", null]],
    [0x0118, ["00", null]],
    [0x0119, ["00", null]],
    [0x011A, ["Vu", null]],
    [0x011B, ["ff00", null]],
    [0x011C, ["uuuuuu", null]],
    [0x011D, ["Sbbbbu", null]],
    [0x011E, ["Sbbbbu", null]],
    [0x011F, ["ffu0", null]],
    [0x0120, ["ubbbbuuuiuu", null]],
    [0x0121, ["ubbbbuuuiuu", null]],
    [0x0122, ["ubbbbuuuiuu", null]],
    [0x0123, ["ubbbbuuuiuu", null]],
    [0x0124, ["V0", null]],
    [0x0125, ["V0", null]],
    [0x0126, ["V0", null]],
    // [0x0127, ["?", null]],
    // [0x0128, ["?", null]],
    // [0x0129, ["?", null]],
    // [0x012A, ["?", null]],
    [0x012B, ["00", null]],
    [0x012C, ["", null]],
    [0x012D, ["V0cbbbbfbbbb", null]],
    [0x012E, ["V0cbbbbfbbbb", null]],
    [0x012F, ["V0u0", null]],
    [0x0130, ["00", null]],
    [0x0131, ["V0", null]],
    [0x0132, ["Vu", null]],
    [0x0133, ["Vuuu", null]],
    [0x0134, ["VVV0", null]],
    [0x0135, ["VVV0", null]],
    [0x0136, ["V0", null]],
    [0x0137, ["V0", null]],
    [0x0138, ["V0", null]],
    [0x0139, ["V0", null]],
    // [0x013A, ["?", null]],
    [0x013B, ["uuuuf", null]],
    [0x013C, ["VV", null]],
    [0x013D, ["", null]],
    [0x013E, ["00", null]],
    [0x013F, ["00", null]],
    [0x0140, ["uuuu", null]],
    [0x0141, ["00", null]],
    // [0x0142, ["?", null]],
    // [0x0143, ["?", null]],
    [0x0144, ["00", null]],
    [0x0145, ["", null]],
    [0x0146, ["Vucbb0", null]],
    [0x0147, ["Vucbb0", null]],
    [0x0148, ["Vucbb0", null]],
    [0x0149, ["TVVMVVVVVuM0", null]],
    [0x014A, ["u0uuu0", null]],
    [0x014B, ["00", null]],
    [0x014C, ["uuuu", null]],
    [0x014D, ["uuuu", null]],
    [0x014E, ["uuuu", null]],
    [0x014F, ["uuuu", null]],
    [0x0150, ["uuuu", null]],
    [0x0151, ["uuuu", null]],
    [0x0152, ["uuuu", null]],
    [0x0153, ["uuuu", null]],
    [0x0154, ["Vu", null]],
    [0x0155, ["00", null]],
    [0x0156, ["V0i", null]],
    [0x0157, ["00", null]],
    [0x0158, ["0u", null]],
    [0x0159, ["0u", null]],
    [0x015A, ["Vu", null]],
    [0x015B, ["Vu", null]],
    [0x015C, ["Vu", null]],
    [0x015D, ["Vu", null]],
    [0x015E, ["00", null]],
    // [0x015F, ["?", null]],
    // [0x0160, ["?", null]],
    [0x0161, ["bbbbbbbbbbbbbbbbbbbb", null]],
    [0x0162, ["00", null]],
    [0x0163, ["00", null]],
    [0x0164, ["V0", null]],
    [0x0165, ["uuc", null]],
    [0x0166, ["uuuu", null]],
    [0x0167, ["Vuuu", null]],
    [0x0168, ["V0", null]],
    [0x0169, ["00", null]],
    [0x016A, ["V0V0", null]],
    [0x016B, ["Vu", null]],
    [0x016C, ["Vuu0", null]],
    [0x016D, ["00", null]],
    [0x016E, ["00", null]],
    [0x016F, ["uuuuuu", null]],
    [0x0170, ["00", null]],
    [0x0171, ["00", null]],
    [0x0172, ["00", null]],
    [0x0173, ["00", null]],
    [0x0174, ["uuuu", null]],
    [0x0175, ["0u", null]],
    [0x0176, ["00", null]],
    [0x0177, ["uubbbbbbbbcffbbu", null]],
    [0x0178, ["uubbbbbbbbcffbbu", null]],
    [0x0179, ["uubbbbbbbbcffbbu", null]],
    [0x017A, ["uubbbbbbbbcffbbu", null]],
    [0x017B, ["uubbbbbbbbcffbbu", null]],
    [0x017C, ["uubbbbbbbbcffbbu", null]],
    [0x017D, ["VVuuuu", null]],
    [0x017E, ["VVuuuu", null]],
    [0x017F, ["uuuu", null]],
    [0x0180, ["00", null]],
    [0x0181, ["00", null]],
    [0x0182, ["0u", null]],
    [0x0183, ["0u", null]],
    [0x0184, ["0u", null]],
    [0x0185, ["V0", null]],
    [0x0186, ["V0", null]],
    [0x0187, ["", null]],
    [0x0188, ["uuuu", null]],
    [0x0189, ["Vuu0", null]],
    [0x018A, ["Vucuuuu", null]],
    [0x018B, ["Vucuuuu", null]],
    [0x018C, ["Vucuuuu", null]],
    [0x018D, ["Vucuuuu", null]],
    [0x018E, ["00", null]],
    [0x018F, ["c", null]],
    [0x0190, ["00", null]],
    [0x0191, ["00", null]],
    [0x0192, ["VV", null]],
    [0x0193, ["00", null]],
    [0x0194, ["c", null]],
    [0x0195, ["00", null]],
    [0x0196, ["c", null]],
    [0x0197, ["00", null]],
    [0x0198, ["uuuu", null]],
    [0x0199, ["V0cff", null]],
    [0x019A, ["uuuu", null]],
    [0x019B, ["uuuu", null]],
    [0x019C, ["00", null]],
    [0x019D, ["00", null]],
    [0x019E, ["00", null]],
    [0x019F, ["V0", null]],
    [0x01A0, ["00", null]],
    [0x01A1, ["00", null]],
    [0x01A2, ["00", null]],
    [0x01A3, ["V0", null]],
    [0x01A4, ["uuuu", null]],
    [0x01A5, ["00", null]],
    [0x01A6, ["VTuVu0", null]],
    [0x01A7, ["VVu0VVuTVui", null]],
    [0x01A8, ["00", null]],
    [0x01A9, ["V0cuuuu", null]],
    [0x01AA, ["V0cuuuu", null]],
    [0x01AB, ["V0cuuuu", null]],
    [0x01AC, ["V0cuuuu", null]],
    [0x01AD, ["VV", null]],
    [0x01AE, ["VV", null]],
    [0x01AF, ["VV", null]],
    [0x01B0, ["Vu", null]],
    [0x01B1, ["uuuu", null]],
    [0x01B2, ["000ucffu0", null]],
    [0x01B3, ["V0T0", null]],
    [0x01B4, ["uuuu", null]],
    [0x01B5, ["uuuu", null]],
    [0x01B6, ["V0cff", null]],
    [0x01B7, ["VVbbbb", null]],
    [0x01B8, ["uuuu", null]],
    [0x01B9, ["cV0", null]],
    [0x01BA, ["00", null]],
    [0x01BB, ["", null]],
    [0x01BC, ["V0", null]],
    // [0x01BD, ["?", null]],
    // [0x01BE, ["?", null]],
]);