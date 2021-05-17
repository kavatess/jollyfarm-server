import { Plant, PlantModel } from "../plant/plant.model";

export class Status {
    date: Date;
    plantNumber: number;
    plantGrowth: number;
    constructor(date: Date = new Date(), plantNumber: number = 0, plantGrowth: number = 0) {
        this.date = new Date(date);
        this.plantNumber = Number(plantNumber);
        this.plantGrowth = Number(plantGrowth);
    }
}

export interface RawTrussModel {
    _id: string;
    block: string;
    index: number;
    maxHole: number;
    plantId: string;
    startDate: string;
    realStatus: Status[];
    plantType: PlantModel;
}

export class TrussFactory {
    createTruss(truss: RawTrussModel): Truss {
        if (!truss.plantId) {
            return new EmptyTruss(truss);
        }
        return new PlantingTruss(truss);
    }
}

export abstract class Truss {
    private _id: string;
    private block: string;
    private index: number;
    private maxHole: number;
    private plantId: string;
    private startDate: Date;
    private realStatus: Status[];
    private plantType!: Plant;
    constructor(truss: RawTrussModel) {
        this._id = truss._id;
        this.block = truss.block;
        this.index = Number(truss.index);
        this.maxHole = Number(truss.maxHole);
        this.plantId = truss.plantId;
        this.startDate = new Date(truss.startDate);
        this.realStatus = truss.realStatus.map(sta => new Status(sta.date, sta.plantNumber, sta.plantGrowth));
        if (this.plantId) {
            this.plantType = new Plant(truss.plantType);
        }
    }
    // GET
    getTrussId(): string {
        return this._id;
    }
    getBlock(): string {
        return this.block;
    }
    getIndex(): number {
        return this.index;
    }
    getMaxHole(): number {
        return this.maxHole;
    }
    getPlantId(): string {
        return this.plantId;
    }
    getStartDate(): Date {
        return this.startDate;
    }
    getRealStatus(): Status[] {
        return this.realStatus;
    }
    getPlantType(): Plant {
        return this.plantType || null;
    }
    // SET
    setTrussId(trussId: string): void {
        this._id = trussId;
    }
    setBlock(block: string): void {
        this.block = block;
    }
    setIndex(index: number): void {
        this.index = Number(index);
    }
    setMaxHole(maxHole: number): void {
        this.maxHole = Number(maxHole);
    }
    setPlantId(plantId: string): void {
        this.plantId = plantId;
    }
    setStartDate(startDate: Date): void {
        this.startDate = new Date(startDate);
    }
    setRealStatus(status: Status[]): void {
        this.realStatus = status.map(({ date, plantGrowth, plantNumber }) => new Status(date, plantNumber, plantGrowth));
    }
    setPlantType(plant: PlantModel): void {
        this.plantType = new Plant(plant);
    }
    // OTHER FUNCTION
    isEmptyTruss(): boolean {
        return !this.plantId && !this.startDate && !this.realStatus.length;
    }
    getLatestRealStatus(): Status {
        return this.realStatus[this.realStatus.length - 1];
    }
    getLatestPlantNumber(): number {
        return this.isEmptyTruss() ? 0 : this.getLatestRealStatus().plantNumber;
    }
    getLatestPlantGrowth(): number {
        return this.isEmptyTruss() ? 0 : this.getLatestRealStatus().plantGrowth;
    }
    abstract getBasicTrussInfo(): any;
}

export class PlantingTruss extends Truss {

    constructor(plantingTruss: RawTrussModel) {
        super(plantingTruss);
    }
    private addDate(beginDate: Date, days: number): Date {
        return new Date(beginDate.getTime() + days * 24 * 3600 * 1000);
    }
    getPredictHarvestDate(): Date {
        const isHarvestTruss = this.getRealStatus().find(sta => sta.plantGrowth == 3);
        return isHarvestTruss ? isHarvestTruss.date : this.addDate(this.getStartDate(), this.getPlantType().getGrowUpTime());
    }
    getMediumHarvestDate(): Date {
        const isMediumTruss = this.getRealStatus().find(sta => sta.plantGrowth == 2);
        return isMediumTruss ? isMediumTruss.date : this.addDate(this.getStartDate(), this.getPlantType().getMediumGrowthTime());
    }
    getBasicTrussInfo(): PlantingTrussInfo {
        return new PlantingTrussInfo(this);
    }
}

export class EmptyTruss extends Truss {

    constructor(emptyTruss: RawTrussModel) {
        super(emptyTruss);
    }

    getBasicTrussInfo(): TrussBasicInfo {
        return new TrussBasicInfo(this);
    }
}

export class TrussBasicInfo {
    _id: string;
    block: string;
    index: number;
    maxHole: number;
    plantId: string;
    constructor(truss: Truss) {
        this._id = truss.getTrussId();
        this.block = truss.getBlock();
        this.index = truss.getIndex();
        this.maxHole = truss.getMaxHole();
        this.plantId = truss.getPlantId();
    }
}

export class PlantingTrussInfo extends TrussBasicInfo {
    startDate: Date;
    plantNumber: number;
    plantGrowth: number;
    harvestDate: Date;
    mediumGrowthDate: Date;
    // Plant info
    plantName: string;
    imgSrc: string;
    plantColor: string;
    numberPerKg: number;
    constructor(truss: PlantingTruss) {
        super(truss);
        this.startDate = truss.getStartDate();
        this.plantNumber = truss.getLatestPlantNumber();
        this.plantGrowth = truss.getLatestPlantGrowth();
        this.harvestDate = truss.getPredictHarvestDate();
        this.mediumGrowthDate = truss.getMediumHarvestDate();
        this.plantName = truss.getPlantType().getPlantName();
        this.imgSrc = truss.getPlantType().getImgSrc();
        this.plantColor = truss.getPlantType().getPlantColor();
        this.numberPerKg = truss.getPlantType().getNumberPerKg();
    }
}

export class Statistic {
    plantName: string = '';
    plantColor: string = '';
    plantNumber: number = 0;
    createStatisticOfTruss(truss: Truss): Statistic {
        this.plantName = truss.getPlantType().getPlantName();
        this.plantColor = truss.getPlantType().getPlantColor();
        this.plantNumber = truss.getLatestPlantNumber();
        return this;
    }
}