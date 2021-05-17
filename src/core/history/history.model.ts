import { BasicPlantModel, Plant, PlantModel } from "../plant/plant.model";
import { Status, Truss } from "../truss/truss.model";

export class BasicHistoryModel {
    trussId: string = '';
    plantId: string = '';
    startDate: Date = new Date();
    realStatus: Status[] = [];
    createHistoryOfTruss(truss: Truss): BasicHistoryModel {
        this.trussId = truss.getTrussId();
        this.plantId = truss.getPlantId();
        this.startDate = truss.getStartDate();
        this.realStatus = truss.getRealStatus();
        return this;
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