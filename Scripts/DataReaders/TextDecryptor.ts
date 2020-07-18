export default function decryptTexts(data: DataView): Map<string, string> {
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