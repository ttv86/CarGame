export class BinaryReader {
    private data: DataView;

    constructor(data: DataView) {
        this.data = data;
        this.position = 0;
        this.length = data.byteLength;
    }

    public position: number;

    public readonly length: number;

    public readInt32() {
        const result = this.data.getInt32(this.position, true);
        this.position += 4;
        return result;
    }

    public readUint32() {
        const result = this.data.getUint32(this.position, true);
        this.position += 4;
        return result;
    }

    public readInt16() {
        const result = this.data.getInt16(this.position, true);
        this.position += 2;
        return result;
    }

    public readUint16() {
        const result = this.data.getUint16(this.position, true);
        this.position += 2;
        return result;
    }

    public readInt8() {
        const result = this.data.getInt8(this.position);
        this.position += 1;
        return result;
    }

    public readUint8() {
        const result = this.data.getUint8(this.position);
        this.position += 1;
        return result;
    }

    public readFixedFloat() {
        const upper = this.readInt16();
        const lower = this.readUint16();
        return upper + (lower / 0x10000);
    }

    public readBytes(count: number): number[] {
        const result: number[] = [];
        for (let i = 0; i < count; i++) {
            result.push(this.data.getUint8(this.position + i));
        }

        this.position += count;
        return result;
    }

    public readByteArray(count: number): Uint8ClampedArray {
        const result = new Uint8ClampedArray(count);
        for (let i = 0; i < count; i++) {
            result[i] = this.data.getUint8(this.position + i);
        }

        this.position += count;
        return result;
    }

    public readString(length: number): string {
        let result = "";
        if (length >= 0) {
            for (let i = 0; i < length; i++) {
                const codePoint = this.data.getUint8(this.position + i);
                result += String.fromCharCode(codePoint);
            }

            this.position += length;
        } else {
            while (this.position < this.length) {
                const codePoint = this.data.getUint8(this.position);
                this.position++;
                if (codePoint > 0) {
                    result += String.fromCharCode(codePoint);
                } else {
                    break;
                }
            }
        }

        return result;
    }
}