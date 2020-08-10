export default function readMissions(data: DataView): ReadonlyMap<number, IMission> {
    const result = new Map<number, IMission>();
    const lines: string[] = [];
    let lineBuilder = ""
    let inComment = false;
    let initMode = true;

    let missionBuilder: IMissionBuilder | null = null;
    for (let i = 0; i < data.byteLength; i++) {
        let c = String.fromCharCode(data.getUint8(i));
        if (inComment) {
            if (c === "}") {
                inComment = false;
            }

            continue;
        } else if (c === "{") {
            inComment = true;
        } else if (c === '[') {
            lineBuilder = "";
        } else if (c === ']') {
            missionBuilder = {
                id: parseInt(lineBuilder),
                name: "",
                map: "",
                unknown1: 0,
                unknown2: 0,
                unknown3: 0,
                unknown4: 0,
                unknown5: 0,
                unknown6: 0,
                unknown7: 0,
                unknown8: 0,
                initLines: [],
                commandLines: [],
            };
            result.set(missionBuilder.id, missionBuilder);
            initMode = true;
            lineBuilder = "";
        } else if ((c === "\n") || (c === "\r")) {
            if (lineBuilder) {
                if (/^\s*-1\s*$/.test(lineBuilder)) {
                    initMode = false;
                    lineBuilder = "";
                    continue;
                }

                if (missionBuilder) {
                    if (initMode) {
                        let match = /^\s*([0-9]+)\s*(1)?\s*\(([0-9]+)\s*[,\.]\s*([0-9]+)\s*[,\.]\s*([0-9]+)\)\s*([A-Z_]+)\s*(-?[0-9]+)?\s*(-?[0-9]+)?\s*(-?[0-9]+)?\s*(-?[0-9]+)?\s*(-?[0-9]+)?\s*$/.exec(lineBuilder);
                        if (match) {
                            missionBuilder.initLines.push({
                                lineNumber: parseInt(match[1]),
                                reset: !!match[2],
                                coordinateX: parseInt(match[3]),
                                coordinateY: parseInt(match[4]),
                                coordinateZ: parseInt(match[5]),
                                commandName: match[6],
                                param1: match[7] ? parseInt(match[7]) : void 0,
                                param2: match[8] ? parseInt(match[8]) : void 0,
                                param3: match[9] ? parseInt(match[9]) : void 0,
                                param4: match[10] ? parseInt(match[10]) : void 0,
                                param5: match[11] ? parseInt(match[11]) : void 0,
                            });
                            lineBuilder = "";
                        } else if (match = /^\s*(.+),\s*([0-9]+)\s*,\s*(.+),\s*([0-9]+)\s*,\s*$/.exec(lineBuilder)) {
                            missionBuilder.name = match[1];
                            missionBuilder.unknown1 = parseInt(match[2]);
                            missionBuilder.map = match[3];
                            missionBuilder.unknown2 = parseInt(match[4]);
                            lineBuilder = "";
                        } else if (match = /^\s*([0-9]+)\s+([0-9]+)\s+([0-9]+)\s+([0-9]+)\s+([0-9]+)\s+([0-9]+)\s*$/.exec(lineBuilder)) {
                            missionBuilder.unknown3 = parseInt(match[1]);
                            missionBuilder.unknown4 = parseInt(match[2]);
                            missionBuilder.unknown5 = parseInt(match[3]);
                            missionBuilder.unknown6 = parseInt(match[4]);
                            missionBuilder.unknown7 = parseInt(match[5]);
                            missionBuilder.unknown8 = parseInt(match[6]);
                            lineBuilder = "";
                        } else if (/\S/.test(lineBuilder)) {
                            console.warn("Invalid mission statement: ", lineBuilder);
                        }
                    } else {
                        const match = /^\s*([0-9]+)\s*([A-Z_]+)\s*(-?[0-9]+)?\s*(-?[0-9]+)?\s*(-?[0-9]+)?\s*(-?[0-9]+)?\s*(-?[0-9]+)?\s*$/.exec(lineBuilder);
                        if (match) {
                            missionBuilder.commandLines.push({
                                lineNumber: parseInt(match[1]),
                                commandName: match[2],
                                param1: match[3] ? parseInt(match[3]) : 0,
                                param2: match[4] ? parseInt(match[4]) : 0,
                                param3: match[5] ? parseInt(match[5]) : 0,
                                param4: match[6] ? parseInt(match[6]) : 0,
                                param5: match[7] ? parseInt(match[7]) : 0,
                            });
                        } else if (/\S/.test(lineBuilder)) {
                            console.warn("Invalid mission statement: ", lineBuilder);
                        }
                    }

                    lines.push(lineBuilder);
                }
            }

            lineBuilder = "";
        } else {
            lineBuilder += c;
        }
    }

    return result;
}

interface IMissionBuilder {
    id: number;
    name: string;
    unknown1: number;
    map: string;
    unknown2: number;
    unknown3: number;
    unknown4: number;
    unknown5: number;
    unknown6: number;
    unknown7: number;
    unknown8: number;

    initLines: IInitLine[];
    commandLines: ICommandLine[];
}

export interface IMission {
    readonly id: number;
    readonly name: string;
    readonly unknown1: number;
    readonly map: string;
    readonly unknown2: number;
    readonly unknown3: number;
    readonly unknown4: number;
    readonly unknown5: number;
    readonly unknown6: number;
    readonly unknown7: number;
    readonly unknown8: number;

    readonly initLines: readonly IInitLine[];
    readonly commandLines: readonly ICommandLine[];
}

export interface IInitLine {
    readonly lineNumber: number;
    readonly reset: boolean;
    readonly coordinateX: number;
    readonly coordinateY: number;
    readonly coordinateZ: number;
    readonly commandName: string;
    readonly param1?: number;
    readonly param2?: number;
    readonly param3?: number;
    readonly param4?: number;
    readonly param5?: number;
}

export interface ICommandLine {
    readonly lineNumber?: number;
    readonly commandName: string;
    readonly param1: number;
    readonly param2: number;
    readonly param3: number;
    readonly param4: number;
    readonly param5: number;
}