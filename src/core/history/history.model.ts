import { BasicPlantModel, Plant, PlantModel } from "../plant/plant.model";
import { Status } from "../truss/truss.model";

export class BasicHistoryModel {
    trussId: string;
    plantId: string;
    startDate: string;
    realStatus: Status[];
    constructor(trussId: string, plantId: string, startDate: string, realStatus: Status[]) {
        this.trussId = trussId;
        this.plantId = plantId;
        this.startDate = startDate;
        this.realStatus = realStatus;
    }
}

export interface HistoryModel extends BasicHistoryModel {
    _id: string;
    plantType: PlantModel;
}

export interface ResponseHistoryModel extends HistoryModel, BasicPlantModel {
}

class History {
    private _id: string;
    private trussId: string;
    private plantId: string;
    private startDate: Date;
    private realStatus: Status[];
    private plantType: Plant;
    constructor(history: HistoryModel) {
        this._id = history._id;
        this.trussId = history.trussId;
        this.plantId = history.plantId;
        this.startDate = new Date(history.startDate);
        this.realStatus = history.realStatus.map(sta => new Status(sta.date, sta.plantNumber, sta.plantGrowth));
        this.plantType = new Plant(history.plantType);
    }
}