export interface trussModel {
    _id: string;
    block: string;
    index: number;
    maxHole: number;
    plantId: number;
    startDate: string;
    statusReal: statusModel[];
    statusPredict: statusModel[];
    history: historyModel[];
    createdSeedId: string;
}

export interface statusModel {
    date: string;
    plantNumber: number;
    plantGrowth: number;
}

export interface historyModel {
    plantId: number;
    startDate: string;
    statusReal: statusModel[];
    statusPredict: statusModel[];
}

export interface newStatusRequestModel {
    _id: string;
    block: string;
    statusReal: statusModel[];
}

export interface newMaxHoleRequestModel {
    _id: string;
    block: string;
    maxHole: number;
}