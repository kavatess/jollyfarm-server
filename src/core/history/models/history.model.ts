import { Plant, PlantModel } from "../../plant/models/plant.model";
import { Status } from "../../truss/models/status.model";
import { BasicHistory } from "./basic-history.model";

export interface HistoryModel extends BasicHistory {
    _id: string;
    plantType: PlantModel;
}

export class History {
    private __id: string;
    private _trussId: string;
    private _plantId: string;
    private _startDate: Date;
    private _realStatus: Status[];
    private _plantType: Plant;
    constructor(history: HistoryModel) {
        this.__id = history._id;
        this._trussId = history.trussId;
        this._plantId = history.plantId;
        this._startDate = new Date(history.startDate);
        this._realStatus = history.realStatus.map(sta => new Status(sta));
        this._plantType = new Plant(history.plantType);
    }
    get _id(): string {
        return this.__id;
    }
    get trussId(): string {
        return this._trussId;
    }
    get plantId(): string {
        return this._plantId;
    }
    get startDate(): Date {
        return this._startDate;
    }
    get realStatus(): Status[] {
        return this._realStatus;
    }
    get plantType(): Plant {
        return this._plantType
    }
}