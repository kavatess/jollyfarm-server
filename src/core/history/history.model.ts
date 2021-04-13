import { getDate } from "../../server-constants";
import { PlantInfo } from "../plant/plant.model";
import { Status } from "../truss/truss.model";

export class HistoryModel {
    trussId: string;
    plantId: string;
    startDate: string;
    realStatus: Status[];
    constructor(trussId: string = '', plantId: string = '', startDate: string = '', realStatus: Status[] = []) {
        this.trussId = trussId;
        this.plantId = plantId;
        this.startDate = getDate(startDate);
        this.realStatus = realStatus.map(sta => new Status(sta.date, sta.plantNumber, sta.plantGrowth));
    }
}

export class History extends HistoryModel implements PlantInfo {
    _id: string = '';
    // Plant Info
    plantName!: string;
    imgSrc!: string;
    plantColor!: string;
    growUpTime!: number;
    mediumGrowthTime!: number;
    seedUpTime!: number;
    numberPerKg!: number;
    alivePercent!: number;
    worm!: string;
    wormMonth!: string;
    constructor(history: History) {
        super(history.trussId, history.plantId, history.startDate, history.realStatus);
        this._id = history._id;
        this.trussId = history.trussId;
        this.plantId = history.plantId;
        this.startDate = getDate(history.startDate);
        this.realStatus = history.realStatus.map(sta => new Status(sta.date, sta.plantNumber, sta.plantGrowth));
        // Plant Info
        this.plantName = history.plantName;
        this.imgSrc = history.imgSrc;
        this.plantColor = history.plantColor;
        this.growUpTime = history.growUpTime;
        this.mediumGrowthTime = history.mediumGrowthTime;
        this.seedUpTime = history.seedUpTime;
        this.numberPerKg = history.numberPerKg;
        this.alivePercent = history.alivePercent;
        this.worm = history.worm;
        this.wormMonth = history.wormMonth;
    }
}