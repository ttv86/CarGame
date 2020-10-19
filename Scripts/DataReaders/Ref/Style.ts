import { IStyle, IVehicleInfo, ITileInfo, ITextureLocation, ISpriteLocation, VehicleType } from "../Interfaces";

export default class Style implements IStyle {
    constructor(tilePng: DataView) {
        const image = document.createElement("img");
        const blob = new Blob([tilePng.buffer], { type: "image/png" });
        image.src = URL.createObjectURL(blob);
        this.tileImageData = image;
        this.spriteImageData = image;
    }

    public tileImageData: HTMLImageElement | HTMLCanvasElement | ImageData;
    public spriteImageData: HTMLImageElement | HTMLCanvasElement | ImageData;

    public getSpritePosition(spriteIndex: number): ISpriteLocation | null {
        return { tX: 0, tY: 0, tW: 1, tH: 1, width: 100, height: 100 };
    }

    public getVehicleInfo(model: number): IVehicleInfo {
        throw new Error("Method not implemented.");
    }

    public getVehicleModelByType(type: VehicleType): number | null {
        return null;
    }

    public getLidTileTexCoords(lid: ITileInfo): ITextureLocation {
        const x = lid.tileIndex % 4;
        const y = lid.tileIndex >> 2;
        return { tX: x * 1 / 4, tY: y * 1 / 4, tW: 1 / 4, tH: 1 / 4 };
    }

    public getSideTileTexCoords(wall: ITileInfo): ITextureLocation {
        return this.getLidTileTexCoords(wall);
    }
}