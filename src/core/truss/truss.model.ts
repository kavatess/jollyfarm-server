import { floor } from "mathjs";
import { getDate } from "../../server-constants";
import { PlantModel } from "../plant/plant.model";

export class Status {
    date: string;
    plantNumber: number;
    plantGrowth: number;
    constructor(date: string = "", plantNumber: number = 0, plantGrowth: number = 0) {
        this.date = getDate(date);
        this.plantNumber = Number(plantNumber);
        this.plantGrowth = Number(plantGrowth);
    }
    calculateStatusPercent(maxHole: number): number {
        return this.plantNumber / maxHole * 100;
    }
}

export class MileStoneModel {
    _index: number;
    plantId: string;
    startDate: string;
    statusReal: Status[];
    statusPredict: Status[];
    constructor(index: number, plantId: string = "", startDate: string = "", statusReal: Status[] = [], statusPredict: Status[] = []) {
        this._index = index;
        this.plantId = plantId;
        this.startDate = startDate;
        this.statusReal = statusReal;
        this.statusPredict = statusPredict;
    }
}

export class MileStone extends PlantModel implements MileStoneModel {
    _index: number;
    plantId: string;
    startDate: string;
    statusReal: Status[];
    statusPredict: Status[];
    constructor(ms: MileStone) {
        super(ms);
        this._index = ms._index;
        this.plantId = ms.plantId;
        this.startDate = getDate(ms.startDate);
        this.statusReal = ms.statusReal.map(status => new Status(status.date, status.plantNumber, status.plantGrowth));
        this.statusPredict = ms.statusPredict.map(status => new Status(status.date, status.plantNumber, status.plantGrowth));
    }
}

export interface TrussModel {
    _id: string;
    block: string;
    index: number;
    maxHole: number;
    timeline: MileStoneModel[];
}

export interface TrussBasicInfo {
    _id: string;
    block: string;
    index: number;
    maxHole: number;
    plantId: string;
}

export interface TrussModelForClientSide extends TrussBasicInfo {
    startDate: string;
    plantId: string;
    plantName: string;
    imgSrc: string;
    plantColor: string;
    numberPerKg: number;
    plantNumber: number;
    plantGrowth: number;
    predictHarvestDate: number;
}

export abstract class Truss {
    _id: string;
    block: string;
    index: number;
    maxHole: number;
    timeline: MileStone[];
    constructor(truss: Truss) {
        this._id = truss._id;
        this.block = truss.block;
        this.index = truss.index;
        this.maxHole = truss.maxHole;
        this.timeline = truss.timeline.map(ms => new MileStone(ms));
    }
    public get latestMileStone(): MileStone {
        return this.timeline[this.timeline.length - 1];
    }
    public get recentRealStatusArr(): Status[] {
        return this.latestMileStone.statusReal;
    }
    public get recentPredictStatusArr(): Status[] {
        return this.latestMileStone.statusPredict;
    }
    protected get latestPredictStatus(): Status {
        return this.recentPredictStatusArr[this.recentPredictStatusArr.length - 1];
    }
    protected get latestPredictStatusDate(): string {
        return this.latestPredictStatus.date;
    }
    protected set setRecentRealStatus(status: Status[]) {
        this.timeline[this.timeline.length - 1].statusReal = status;
    }
    protected set setRecentPredictStatus(status: Status[]) {
        this.timeline[this.timeline.length - 1].statusPredict = status;
    }
    protected get latestRealStatus(): Status {
        return this.recentRealStatusArr[this.recentRealStatusArr.length - 1];
    }
    public get latestRealPlantNumber(): number {
        return this.latestRealStatus.plantNumber;
    }
    public get latestRealPlantGrowth(): number {
        return this.latestRealStatus.plantGrowth;
    }
    public get latestRealStatusDate(): string {
        return this.latestRealStatus.date;
    }
    public get timelineData() {
        return {
            _id: this._id,
            block: this.block,
            index: this.index,
            maxHole: this.maxHole,
            timeline: this.timeline
        }
    }
    public abstract get dataForClient(): any;
    public abstract initializeStatus(startDate: string, plantNumber: number, mediumGrowthTime: number, growUpTime: number): void;
}

export interface RecentHistory extends TrussBasicInfo {
    statusReal: Status[];
    plantName: string;
    imgSrc: string;
    plantColor: string;
    numberPerKg: number;
}

export class EmptyTruss extends Truss {
    constructor(emptyTruss: Truss) {
        super(emptyTruss);
    }

    initializeStatus(startDate: string, plantNumber: number = 0, mediumGrowthTime: number = 0, growUpTime: number = 0): void {
        this.createStatusReal(startDate, plantNumber);
        this.createStatusPredict(mediumGrowthTime, growUpTime);
    }
    private set pushPredictStatus(predictStatus: Status) {
        this.timeline[this.timeline.length - 1].statusReal.push(predictStatus);
    }
    private createStatusReal(startDate: string, plantNumber: number): void {
        const firstStatus = new Status(startDate, Number(plantNumber), 1);
        this.setRecentRealStatus = [firstStatus];
    }
    private createStatusPredict(mediumGrowthTime: number, growUpTime: number): void {
        this.setRecentPredictStatus = this.recentRealStatusArr;
        this.pushPredictStatus = new Status(this.predictDate(this.latestRealStatusDate, mediumGrowthTime), this.latestRealPlantNumber, 2);
        this.pushPredictStatus = new Status(this.predictDate(this.latestRealStatusDate, growUpTime), this.latestRealPlantNumber, 3);
        this.predictAfterHarvestStatus();
    }
    private predictDate(startDate: string, days: number): string {
        const startTime = new Date(startDate).getTime();
        const predictDate = new Date(startTime + days * 24 * 60 * 60 * 1000);
        return predictDate.toDateString();
    }
    private predictAfterHarvestStatus(): void {
        const startNumber = this.latestRealPlantNumber;
        for (var i = 1; i <= 4; i++) {
            let plantNumber = floor(startNumber * (4 - i) / 4);
            const predictDate = this.predictDate(this.latestPredictStatusDate, i);
            this.pushPredictStatus = new Status(predictDate, plantNumber, 3);
        }
    }
    get dataForClient(): TrussBasicInfo {
        return {
            _id: this._id,
            block: this.block,
            index: this.index,
            maxHole: this.maxHole,
            plantId: ""
        }
    }
}

export class PlantingTruss extends Truss {
    constructor(trussAndPlant: Truss) {
        super(trussAndPlant);
    }

    private get latestRealStatusLength(): number {
        return this.recentRealStatusArr.length;
    }
    get realStatus(): Status {
        if (!this.latestRealStatusLength) return new Status();
        const growUpCond = this.latestRealStatusLength == 2 && this.latestRealPlantGrowth < 3 && new Date() >= new Date(this.recentPredictStatusArr[2].date);
        if (growUpCond) return this.recentPredictStatusArr[2];
        const mediumGrowthCond = this.latestRealStatusLength == 1 && new Date() >= new Date(this.recentPredictStatusArr[1].date);
        if (mediumGrowthCond) return this.recentPredictStatusArr[1];
        return this.latestRealStatus;
    }
    get realPlantGrowth(): number {
        if (!this.latestRealStatusLength) 0;
        const growUpCond = this.latestRealStatusLength == 2 && this.latestRealPlantGrowth < 3 && new Date() >= new Date(this.recentPredictStatusArr[2].date);
        if (growUpCond) 3;
        const mediumGrowthCond = this.latestRealStatusLength == 1 && new Date() >= new Date(this.recentPredictStatusArr[1].date);
        if (mediumGrowthCond) 2;
        return this.latestRealPlantGrowth;
    }
    private get harvestDate(): number {
        const today = new Date().getTime();
        const harvestStatus = this.recentRealStatusArr.find(status => status.plantGrowth == 3);
        if (harvestStatus) {
            const harvestDate = new Date(harvestStatus.date).getTime();
            return floor((today - harvestDate) / 86400000);
        }
        const startDate = new Date(this.latestMileStone.startDate).getTime();
        return floor(this.latestMileStone.growUpTime - (today - startDate) / 86400000);
    }
    get dataForClient() {
        return {
            _id: this._id,
            block: this.block,
            index: this.index,
            maxHole: this.maxHole,
            plantId: this.latestMileStone.plantId,
            startDate: this.latestMileStone.startDate,
            plantNumber: this.latestRealPlantNumber,
            plantGrowth: this.realPlantGrowth,
            predictHarvestDate: this.harvestDate,
            plantName: this.latestMileStone.plantName,
            imgSrc: this.latestMileStone.imgSrc,
            plantColor: this.latestMileStone.plantColor,
            numberPerKg: this.latestMileStone.numberPerKg
        }
    }
    initializeStatus(_startDate: string, _plantNumber: number, _mediumGrowthTime: number, _growUpTime: number): void {
    }
}