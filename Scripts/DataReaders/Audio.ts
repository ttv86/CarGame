import { BinaryReader } from "./BinaryReader";

export default class Audio {
    private ctx: AudioContext;
    private sounds: AudioBuffer[] = [];

    constructor(index: DataView, data: DataView, is16Byte: boolean) {
        this.ctx = new AudioContext();
        const soundCount = Math.floor(index.byteLength / 12);
        const reader = new BinaryReader(index);
        for (let i = 0; i < soundCount; i++) {
            const start = reader.readInt32();
            const length = reader.readInt32() / (is16Byte ? 2 : 1);
            const herz = reader.readInt32();

            const buffer = this.ctx.createBuffer(1, length, herz);
            const channel = buffer.getChannelData(0);
            for (let i = 0; i < length; i++) {
                const value = is16Byte ? (data.getInt16(start + (i * 2), true) / 32767) : ((128 - data.getUint8(start + i)) / 128);
                channel[i] = value;
            }

            this.sounds.push(buffer);
        }
    }

    public get length(): number {
        return this.sounds.length;
    }

    public play(audioIndex: number) {
        if ((audioIndex >= 0) && (audioIndex < this.sounds.length)) {
            const source = this.ctx.createBufferSource();
            source.buffer = this.sounds[audioIndex];
            source.connect(this.ctx.destination);
            source.start();
        }
    }
}