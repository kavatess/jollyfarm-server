import { getDate } from "../../server-constants";

export interface createTrussRequest {
    _id: string;
    plantId: number;
    startDate: string;
    plantNumber: number;
}

export interface updateMaxHoleRequest {
    _id: string;
    maxHole: number;
}

export interface simpleRequest {
    _id: string;
}

export interface revertTrussRequest {
    _id: string;
    statusIndex: number;
}

export class newStatusRequest {
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