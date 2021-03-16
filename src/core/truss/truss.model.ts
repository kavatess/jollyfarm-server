import { floor } from "mathjs";
import { PlantBasicInfo, PlantModel } from "../plant/plant.model";

export class Status {
    date!: string;
    plantNumber!: number;
    plantGrowth!: number;
    constructor(date: string = "", plantNumber: number = 0, plantGrowth: number = 0) {
        this.setStatusDate(date);
        this.setPlantNumber(plantNumber);
        this.setPlantGrowth(plantGrowth);
    }
    setStatusDate(date: string) {
        this.date = new Date(date).toDateString();
    }
    setPlantNumber(plantNumber: number) {
        this.plantNumber = plantNumber;
    }
    setPlantGrowth(plantGrowth: number) {
        this.plantGrowth = plantGrowth;
    }
    calculateStatusPercent(maxHole: number): number {
        return this.plantNumber / maxHole * 100;
    }
}

export class HistoryModel {
    plantId: number;
    startDate: string;
    statusReal: Status[];
    statusPredict: Status[];
    constructor(plantId: number = 0, ngayTrong: string = "", statusReal: Status[] = [], statusPredict: Status[] = []) {
        this.plantId = plantId;
        this.startDate = ngayTrong;
        this.statusReal = statusReal;
        this.statusPredict = statusPredict;
    }
}

export class History extends HistoryModel {
    constructor(truss: TrussModel) {
        super(truss.plantId, truss.startDate, truss.statusReal, truss.statusPredict);
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

export interface TrussModelForClientSide extends TrussBasicInfo, PlantBasicInfo {
    plantNumber: number;
    plantGrowth: number;
    predictHarvestDate: number;
}

export class EmptyTruss {
    _id: string;
    protected block: string;
    protected index: number;
    protected maxHole: number;
    plantId: number;
    protected startDate: string;
    statusReal: Status[];
    statusPredict: Status[];
    history: History[];
    constructor(emptyTruss: TrussModel) {
        this._id = emptyTruss._id;
        this.block = emptyTruss.block;
        this.index = Number(emptyTruss.index);
        this.maxHole = emptyTruss.maxHole;
        this.plantId = emptyTruss.plantId;
        this.startDate = emptyTruss.startDate;
        this.statusReal = emptyTruss.statusReal.map(status => new Status(status.date, status.plantNumber, status.plantGrowth));
        this.statusPredict = emptyTruss.statusPredict.map(status => new Status(status.date, status.plantNumber, status.plantGrowth));
        this.history = emptyTruss.history;
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
}

export class Truss extends EmptyTruss {
    private plantName!: string;
    private imgSrc!: string;
    private plantColor!: string;
    private growUpTime!: number;
    private mediumGrowthTime!: number;
    private seedUpTime!: number;
    private numberPerKg!: number;
    private alivePercent!: number;
    private worm!: string;
    private wormMonth!: string;
    constructor(trussAndPlant: TrussDataStruct) {
        super(trussAndPlant);
        if (this.plantId) {
            this.plantName = trussAndPlant.plantName;
            this.imgSrc = trussAndPlant.imgSrc;
            this.plantColor = trussAndPlant.plantColor;
            this.growUpTime = trussAndPlant.growUpTime;
            this.mediumGrowthTime = trussAndPlant.mediumGrowthTime;
            this.seedUpTime = trussAndPlant.seedUpTime;
            this.numberPerKg = trussAndPlant.numberPerKg;
            this.alivePercent = trussAndPlant.alivePercent;
            this.worm = trussAndPlant.worm;
            this.wormMonth = trussAndPlant.wormMonth;
        }
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
        this.date = date;
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