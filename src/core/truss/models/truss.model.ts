import { Plant, PlantModel } from "../../plant/models/plant.model";
import { RawTrussModel } from "./raw-truss.model";
import { Status } from "./status.model";

export abstract class Truss {
    private _id: string;
    private _block: string;
    private _index: number;
    private _maxHole: number;
    private _plantId: string;
    private _startDate: Date;
    private _realStatus: Status[];
    private _plantType!: Plant;
    constructor(truss: RawTrussModel) {
        this._id = truss._id;
        this._block = truss.block;
        this._index = Number(truss.index);
        this._maxHole = Number(truss.maxHole);
        this._plantId = truss.plantId;
        this._startDate = new Date(truss.startDate);
        this._realStatus = truss.realStatus.map(status => new Status(status));
        this._plantType = truss.plantId ? new Plant(truss.plantType) : undefined;
    }
    // GET
    get id(): string {
        return this._id;
    }
    get block(): string {
        return this._block;
    }
    get index(): number {
        return this._index;
    }
    get maxHole(): number {
        return this._maxHole;
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
        return this._plantType || null;
    }
    // SET
    setTrussId(trussId: string): void {
        this._id = trussId;
    }
    setBlock(block: string): void {
        this._block = block;
    }
    setIndex(index: number): void {
        this._index = Number(index);
    }
    setMaxHole(maxHole: number): void {
        this._maxHole = Number(maxHole);
    }
    setPlantId(plantId: string): void {
        this._plantId = plantId;
    }
    setStartDate(startDate: Date): void {
        this._startDate = new Date(startDate);
    }
    setRealStatus(statusArr: Status[]): void {
        this._realStatus = statusArr.map(status => new Status(status));
    }
    setPlantType(plant: PlantModel): void {
        this._plantType = new Plant(plant);
    }
    // OTHER FUNCTION
    get isEmptyTruss(): boolean {
        return !this.plantId && this.startDate.toString() == 'Invalid Date' && !this.realStatus.length;
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

    constructor(plantingTruss: RawTrussModel) {
        super(plantingTruss);
    }
    private addDate(beginDate: Date, days: number): Date {
        return new Date(beginDate.getTime() + days * 24 * 3600 * 1000);
    }
    getPredictHarvestDate(): Date {
        const isHarvestTruss = this.realStatus.find(sta => sta.plantGrowth == 3);
        return isHarvestTruss ? isHarvestTruss.date : this.addDate(this.startDate, this.plantType.getGrowUpTime());
    }
    getMediumHarvestDate(): Date {
        const isMediumTruss = this.realStatus.find(sta => sta.plantGrowth == 2);
        return isMediumTruss ? isMediumTruss.date : this.addDate(this.startDate, this.plantType.getMediumGrowthTime());
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
        this._id = truss.id;
        this.block = truss.block;
        this.index = truss.index;
        this.maxHole = truss.maxHole;
        this.plantId = truss.plantId;
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