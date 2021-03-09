export interface growth {
    ThoiGianTruongThanhTB: number;
    ThoiGianCayTrungTB: number;
    ThoiGianLenCayTB: number;
}

export interface sauBenh {
    TyLeCayChet: number;
    SauBenh: string;
    ThangSauBenh: string;
}

export interface plantModel {
    _id: string;
    plantId: number;
    plantName: string;
    imgSrc: string;
    plantColor: string;
    suPhatTrien: growth;
    SoCay1Kg: number;
    SauBenh: sauBenh;
}