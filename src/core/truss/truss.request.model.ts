import { getDate } from "../../server-constants";

export interface CreateTrussRequest {
    _id: string;
    seedId: string;
    startDate: string;
}

export interface UpdateMaxHoleRequest {
    _id: string;
    maxHole: number;
}

export interface SimpleRequest {
    _id: string;
}

export interface RevertTrussRequest {
    _id: string;
    statusIndex: number;
}

export class NewStatusRequest {
    _id: string;
    date: string;
    plantNumber: number;
    plantGrowth: number;
    constructor(id: string, date: string, plantNumber: number, plantGrowth: number) {
        this._id = id;
        this.date = getDate(date);
        this.plantNumber = plantNumber;
        this.plantGrowth = plantGrowth;
    }
}