import { getDate, addDate } from "../../server-constants";
import { Plant, PlantModel } from "../plant/plant.model";

export class Status {
    date: string;
    plantNumber: number;
    plantGrowth: number;
    constructor(date: string = "", plantNumber: number = 0, plantGrowth: number = 0) {
        this.date = getDate(date);
        this.plantNumber = Number(plantNumber);
        this.plantGrowth = Number(plantGrowth);
    }
}

export interface TrussModel {
    _id: string;
    block: string;
    index: number;
    maxHole: number;
    plantId: string;
    startDate: string;
    realStatus: Status[];
    plantType: PlantModel;
}

export abstract class Truss {
    _id: string = '';
    block: string = '';
    index: number = 0;
    maxHole: number = 0;
    plantId: string = '';
    startDate: string = '';
    realStatus: Status[] = [];
    plantType!: Plant;
    constructor(truss: TrussModel) {
        this._id = truss._id;
        this.block = truss.block;
        this.index = Number(truss.index);
        this.maxHole = Number(truss.maxHole);
        this.plantId = truss.plantId;
        this.startDate = getDate(truss.startDate);
        this.realStatus = truss.realStatus.map(sta => new Status(sta.date, sta.plantNumber, sta.plantGrowth));
        this.plantType = new Plant(truss.plantType);
    }
    get isEmptyTruss(): boolean {
        return !this.plantId && !this.startDate && !this.realStatus.length;
    }
    get latestRealStatus(): Status {
        return this.realStatus[this.realStatus.length - 1];
    }
    get latestPlantNumber(): number {
        return this.isEmptyTruss ? 0 : this.latestRealStatus.plantNumber;
    }
    get latestPlantGrowth(): number {
        return this.isEmptyTruss ? 0 : this.latestRealStatus.plantGrowth;
    }
    abstract getBasicTrussInfo(): any;
}

export class PlantingTruss extends Truss {

    constructor(plantingTruss: TrussModel) {
        super(plantingTruss);
    }
    getPredictHarvestDate(): string {
        const isHarvestTruss = this.realStatus.find(sta => sta.plantGrowth == 3);
        return isHarvestTruss ? isHarvestTruss.date : addDate(this.startDate, this.plantType.getGrowUpTime());
    }
    getMediumHarvestDate(): string {
        const isMediumTruss = this.realStatus.find(sta => sta.plantGrowth == 2);
        return isMediumTruss ? isMediumTruss.date : addDate(this.startDate, this.plantType.getMediumGrowthTime());
    }
    getBasicTrussInfo(): PlantingTrussInfo {
        return new PlantingTrussInfo(this);
    }
}

export class EmptyTruss extends Truss {

    constructor(emptyTruss: TrussModel) {
        super(emptyTruss);
    }

    getBasicTrussInfo(): TrussBasicInfo {
        return new TrussBasicInfo(this);
    }
}

class TrussBasicInfo {
    _id: string;
    block: string;
    index: number;
    maxHole: number;
    plantId: string;
    constructor(truss: Truss) {
        this._id = truss._id;
        this.block = truss.block;
        this.index = truss.index;
        this.maxHole = truss.maxHole;
        this.plantId = truss.plantId;
    }
}

class PlantingTrussInfo extends TrussBasicInfo {
    startDate: string;
    plantNumber: number;
    plantGrowth: number;
    harvestDate: string;
    mediumGrowthDate: string;
    // Plant info
    plantName: string;
    imgSrc: string;
    plantColor: string;
    numberPerKg: number;
    constructor(truss: PlantingTruss) {
        super(truss);
        this.startDate = truss.startDate;
        this.plantNumber = truss.latestPlantNumber;
        this.plantGrowth = truss.latestPlantGrowth;
        this.harvestDate = truss.getPredictHarvestDate();
        this.mediumGrowthDate = truss.getMediumHarvestDate();
        this.plantName = truss.plantType.getPlantName();
        this.imgSrc = truss.plantType.getImgSrc();
        this.plantColor = truss.plantType.getPlantColor();
        this.numberPerKg = truss.plantType.getNumberPerKg();
    }
}

export interface Statistics {
    plantName: string;
    plantColor: string;
    plantNumber: number;
}