import { floor } from "mathjs";
import { PlantModel } from "../plant/plant.model";

export class Status {
    date!: string;
    plantNumber!: number;
    plantGrowth!: number;
    constructor(date: string = "", plantNumber: number = 0, plantGrowth: number = 0) {
        const dateStr = new Date(date).toString();
        this.date = (dateStr === "Invalid Date") ? "" : dateStr;
        this.plantNumber = Number(plantNumber);
        this.plantGrowth = Number(plantGrowth);
    }
    calculateStatusPercent(maxHole: number): number {
        return this.plantNumber / maxHole * 100;
    }
}

export class HistoryModel implements PlantModel {
    startDate: string;
    statusReal: Status[];
    statusPredict: Status[];
    plantId: number;
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
    constructor(plantId: number, startDate: string, statusReal: Status[], statusPredict: Status[], plantName: string = "", imgSrc: string = "", plantColor: string = "", growUpTime: number = 0, mediumGrowthTime: number = 0, seedUpTime: number = 0, numberPerKg: number = 0, alivePercent: number = 0, worm: string = "", wormMonth: string = "") {
        this.plantId = Number(plantId);
        const dateStr = new Date(startDate).toString();
        this.startDate = (dateStr === "Invalid Date") ? "" : dateStr;
        this.statusReal = statusReal.map(status => new Status(status.date, status.plantNumber, status.plantGrowth));
        this.statusPredict = statusPredict.map(status => new Status(status.date, status.plantNumber, status.plantGrowth));
        if (plantName) {
            this.plantName = plantName;
            this.imgSrc = imgSrc;
            this.plantColor = plantColor;
            this.growUpTime = Number(growUpTime);
            this.mediumGrowthTime = Number(mediumGrowthTime);
            this.seedUpTime = Number(seedUpTime);
            this.numberPerKg = Number(numberPerKg);
            this.alivePercent = Number(alivePercent);
            this.worm = worm;
            this.wormMonth = wormMonth;
        }
    }
}

export class History extends HistoryModel {
    constructor(historyEl: History) {
        super(historyEl.plantId, historyEl.startDate, historyEl.statusReal, historyEl.statusPredict, historyEl.plantName, historyEl.imgSrc, historyEl.plantColor, historyEl.growUpTime, historyEl.mediumGrowthTime, historyEl.seedUpTime, historyEl.numberPerKg, historyEl.alivePercent, historyEl.worm, historyEl.wormMonth);
    }
}

export interface TrussBasicInfo {
    _id: string;
    block: string;
    index: number;
    maxHole: number;
    plantId: number;
    startDate: string;
}

export interface TrussModel extends TrussBasicInfo {
    statusReal: Status[];
    statusPredict: Status[];
    history: History[];
}

export interface TrussDataStruct extends TrussModel, PlantModel {
}

export interface TrussModelForClientSide extends TrussBasicInfo, PlantModel {
    plantNumber: number;
    plantGrowth: number;
    predictHarvestDate: number;
}

export class EmptyTruss extends History implements TrussBasicInfo {
    _id: string;
    block: string;
    index: number;
    maxHole: number;
    history: History[];
    constructor(emptyTruss: TrussDataStruct) {
        super(emptyTruss);
        this._id = emptyTruss._id;
        this.block = emptyTruss.block;
        this.index = emptyTruss.index;
        this.maxHole = emptyTruss.maxHole;
        this.history = emptyTruss.history.map(his => new History(his));
    }

    clearTruss(): void {
        if (this.plantId) {
            const newHistory: History = new HistoryModel(this.plantId, this.startDate, this.statusReal, this.statusPredict);
            this.history.push(newHistory);
            this.plantId = 0;
            this.startDate = "";
            this.statusReal = [];
            this.statusPredict = [];
        }
    }
    createStatusReal(plantNumber: number): void {
        const firstStatus = new Status(this.startDate, Number(plantNumber), 1);
        this.statusReal = [firstStatus];
        this.statusPredict = [firstStatus];
    }
    createStatusPredict(mediumGrowthTime: number, growUpTime: number): void {
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
    // get recentHistory(): HistoryElement {
    //     const
    //     return {
    //         plantId: this.plantId,
    //         maxHole: this.
    //     }
    // }
}

export class Truss extends EmptyTruss {
    constructor(trussAndPlant: TrussDataStruct) {
        super(trussAndPlant);
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
        const growUpCond = this.statusReal.length == 2 && this.latestPlantGrowth == 2 && new Date() >= new Date(this.statusPredict[2].date);
        if (growUpCond) return this.statusPredict[2].plantGrowth;
        const mediumGrowthCond = this.statusReal.length == 1 && this.latestPlantGrowth == 1 && new Date() >= new Date(this.statusPredict[1].date);
        if (mediumGrowthCond) return this.statusPredict[1].plantGrowth;
        return this.latestPlantGrowth;
    }

    private get latestStatusReal(): Status {
        const statusReal = this.statusReal;
        return statusReal.length > 0 ? statusReal[statusReal.length - 1] : new Status();
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
            growUpTime: this.growUpTime,
            mediumGrowthTime: this.mediumGrowthTime,
            seedUpTime: this.seedUpTime,
            numberPerKg: this.numberPerKg,
            alivePercent: this.alivePercent,
            worm: this.worm,
            wormMonth: this.wormMonth
        }
    }
}

export class newStatusRequest {
    _id: string;
    date: string;
    plantNumber: number;
    plantGrowth: number;
    constructor(id: string, date: string, plantNumber: number, plantGrowth: number) {
        this._id = id;
        const dateStr = new Date(date).toString();
        this.date = (dateStr === "Invalid Date") ? "" : dateStr;
        this.plantNumber = plantNumber;
        this.plantGrowth = plantGrowth;
    }
}

export interface createTrussRequest {
    _id: string;
    plantId: number;
    startDate: string;
    plantNumber: number;
}