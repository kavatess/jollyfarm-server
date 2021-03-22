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

export class History extends PlantModel {
    plantId: string;
    startDate: string;
    statusReal: Status[];
    statusPredict: Status[];
    constructor(historyEl: History) {
        super(historyEl);
        this.plantId = historyEl.plantId;
        this.startDate = getDate(historyEl.startDate);
        this.statusReal = historyEl.statusReal.map(status => new Status(status.date, status.plantNumber, status.plantGrowth));
        this.statusPredict = historyEl.statusPredict.map(status => new Status(status.date, status.plantNumber, status.plantGrowth));
    }
}

export interface TrussBasicInfo {
    _id: string;
    block: string;
    index: number;
    maxHole: number;
    plantId: string;
    startDate: string;
}

export interface TrussModel extends TrussBasicInfo, History {
    history: History[];
}

export interface TrussModelForClientSide extends TrussBasicInfo {
    plantNumber: number;
    plantGrowth: number;
    predictHarvestDate: number;
    plantName: string;
    imgSrc: string;
    plantColor: string;
    numberPerKg: number;
}

export abstract class Truss extends History implements TrussModel {
    _id: string;
    block: string;
    index: number;
    maxHole: number;
    history: History[];
    constructor(truss: TrussModel) {
        super(truss);
        this._id = truss._id;
        this.block = truss.block;
        this.index = truss.index;
        this.maxHole = truss.maxHole;
        this.history = truss.history.map(his => new History(his));
    }
    abstract get clientTrussData(): any;
    abstract get recentHistoryData(): any;
    abstract initializeStatus(plantNumber: number, mediumGrowthTime: number, growUpTime: number): void;
}

export interface RecentHistory extends TrussBasicInfo {
    statusReal: Status[];
    plantName: string;
    imgSrc: string;
    plantColor: string;
    numberPerKg: number;
}

export class EmptyTruss extends Truss {
    constructor(emptyTruss: TrussModel) {
        super(emptyTruss);
    }

    initializeStatus(plantNumber: number = 0, mediumGrowthTime: number = 0, growUpTime: number = 0): void {
        this.createStatusReal(plantNumber);
        this.createStatusPredict(mediumGrowthTime, growUpTime);
    }

    private createStatusReal(plantNumber: number): void {
        const firstStatus = new Status(this.startDate, Number(plantNumber), 1);
        this.statusReal = [firstStatus];
        this.statusPredict = [firstStatus];
    }
    private createStatusPredict(mediumGrowthTime: number, growUpTime: number): void {
        this.predictMediumGrowthStatus(mediumGrowthTime);
        this.predictFinalGrowthStatus(growUpTime);
        this.predictAfterHarvestStatus();
    }
    private predictMediumGrowthStatus(mediumGrowthTime: number): void {
        const firstStatus = this.statusReal[0];
        const predictDate = this.calculateEndDate(firstStatus.date, mediumGrowthTime);
        this.statusPredict[1] = new Status(predictDate, firstStatus.plantNumber, 2);
    }
    private predictFinalGrowthStatus(growUpTime: number): void {
        const firstStatus = this.statusReal[0];
        const predictDate = this.calculateEndDate(firstStatus.date, growUpTime);
        this.statusPredict[2] = new Status(predictDate, firstStatus.plantNumber, 3);
    }
    private calculateEndDate(StartDate: string, days: number): string {
        const startDate = new Date(StartDate).getTime();
        const predictDate = new Date(startDate + days * 24 * 60 * 60 * 1000);
        return predictDate.toLocaleDateString('es-PA');
    }
    private predictAfterHarvestStatus(): void {
        const startNumber = this.statusPredict[2].plantNumber;
        for (var i = 1; i <= 4; i++) {
            let plantNumber = floor(startNumber * (4 - i) / 4);
            const predictDate = this.calculateEndDate(this.statusPredict[2].date, i);
            this.statusPredict[2 + i] = new Status(predictDate, plantNumber, 3);
        }
    }
    get clientTrussData(): TrussBasicInfo {
        return {
            _id: this._id,
            block: this.block,
            index: this.index,
            maxHole: this.maxHole,
            plantId: this.plantId,
            startDate: this.startDate,
        }
    }
    get recentHistoryData(): any {
        return {
            _id: this._id,
            block: this.block,
            index: this.index,
            maxHole: this.maxHole,
            plantId: this.plantId,
            startDate: this.startDate,
            statusReal: this.statusReal
        }
    }
}

export class PlantingTruss extends Truss {
    constructor(trussAndPlant: TrussModel) {
        super(trussAndPlant);
    }

    private get latestStatusReal(): Status {
        const statusReal = this.statusReal;
        return statusReal.length > 0 ? statusReal[statusReal.length - 1] : new Status();
    }
    get latestPlantNumber(): number {
        return this.latestStatusReal.plantNumber;
    }
    get latestPlantGrowth(): number {
        return this.latestStatusReal.plantGrowth;
    }
    get realPlantGrowth(): number {
        if (!this.plantId) return 0;
        if (this.statusReal.length > 2) return this.latestPlantGrowth;
        const growUpCond = this.statusReal.length == 2 && this.latestPlantGrowth < 3 && new Date() >= new Date(this.statusPredict[2].date);
        if (growUpCond) return this.statusPredict[2].plantGrowth;
        const mediumGrowthCond = this.statusReal.length == 1 && this.latestPlantGrowth == 1 && new Date() >= new Date(this.statusPredict[1].date);
        if (mediumGrowthCond) return this.statusPredict[1].plantGrowth;
        return this.latestPlantGrowth;
    }
    private get latestPercent(): number {
        return this.latestPlantNumber / this.maxHole * 100;
    }
    private get harvestDate(): number {
        const today = new Date().getTime();
        const harvestStatus = this.statusReal.find(status => status.plantGrowth == 3);
        if (harvestStatus) {
            const harvestDate = new Date(harvestStatus.date).getTime();
            return floor((today - harvestDate) / 86400000);
        }
        const startDate = new Date(this.startDate).getTime();
        return floor(this.growUpTime - (today - startDate) / 86400000);
    }
    private getplantNumberByDate(date: Date): number {
        const statusByDate = this.statusReal.find(status => new Date(status.date).toLocaleDateString() == new Date(date).toLocaleDateString());
        return statusByDate!.plantNumber;
    }
    private getPlantGrowthByDate(date: Date): number {
        const statusByDate = this.statusReal.find(status => new Date(status.date).toLocaleDateString() == new Date(date).toLocaleDateString());
        return statusByDate!.plantGrowth;
    }

    initializeStatus(_plantNumber: number, _mediumGrowthTime: number, _growUpTime: number): void {
    }

    get clientTrussData(): TrussModelForClientSide {
        return {
            _id: this._id,
            block: this.block,
            index: this.index,
            maxHole: this.maxHole,
            plantId: this.plantId,
            startDate: this.startDate,
            plantNumber: this.latestPlantNumber,
            plantGrowth: this.realPlantGrowth,
            predictHarvestDate: this.harvestDate,
            plantName: this.plantName,
            imgSrc: this.imgSrc,
            plantColor: this.plantColor,
            numberPerKg: this.numberPerKg
        }
    }
    get recentHistoryData(): RecentHistory {
        return {
            _id: this._id,
            block: this.block,
            index: this.index,
            maxHole: this.maxHole,
            plantId: this.plantId,
            plantName: this.plantName,
            imgSrc: this.imgSrc,
            plantColor: this.plantColor,
            numberPerKg: this.numberPerKg,
            startDate: this.startDate,
            statusReal: this.statusReal
        }
    }
}

interface initializeTruss {
    initializeTruss(truss: TrussModel): Truss;
}

export class TrussInitialization implements initializeTruss {
    initializeTruss(truss: TrussModel): Truss {
        if (truss.plantId) {
            return new PlantingTruss(truss);
        }
        return new EmptyTruss(truss);
    }
}

export interface HistoryForClient {
    _id: string;
    history: History[];
}