import { floor } from "mathjs";
import { Plant, PlantModel } from "../plant/plant.model";

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
    constructor(truss: Truss) {
        super(truss.plantId, truss.startDate, truss.statusReal, truss.statusPredict);
    }
}

export interface historyTimelineModel {
    dateTime: string;
    historyData: History[];
}

export class Truss implements History{
    _id: string;
    block: string;
    index: number;
    maxHole: number;
    plantId: number;
    startDate: string;
    statusReal: Status[];
    statusPredict: Status[];
    history: History[];
    constructor(_id: string = "", block: string = "", index: number = 0, maxHole: number = 300, plantId: number = 0, startDate: string = "", statusReal: Status[] = [], statusPredict: Status[] = [], history: History[] = []) {
        this._id = _id;
        this.block = block;
        this.index = Number(index);
        this.maxHole = maxHole;
        this.plantId = plantId;
        this.startDate = startDate;
        this.statusReal = statusReal.map(status => new Status(status.date, status.plantNumber, status.plantGrowth));
        this.statusPredict = statusPredict.map(status => new Status(status.date, status.plantNumber, status.plantGrowth));
        this.history = history;
    }
    get plantStartDate(): string {
        return new Date(this.startDate).toLocaleDateString('en-GB');
    }
    get latestStatusReal(): Status {
        const statusReal = this.statusReal;
        return statusReal.length > 0 ? statusReal[statusReal.length - 1] : new Status();
    }
    get latestPlantNumber(): number {
        return this.latestStatusReal.plantNumber;
    }
    get latestPlantGrowth(): number {
        return this.latestStatusReal.plantGrowth;
    }
    get latestPercent(): number {
        return this.latestPlantNumber / this.maxHole * 100;
    }
    get plantGrowthStr(): string {
        const plantGrowth = this.latestPlantGrowth;
        if (plantGrowth === 1) {
            return "Cây con";
        }
        if (plantGrowth === 2) {
            return "Cây trung";
        }
        return "Đang thu hoạch";
    }
    get plantGrowthIcon(): string {
        return this.latestPlantGrowth < 3 ? "fas fa-seedling" : "fas fa-tractor";
    }

    createProgressBarStyle(plantColor: string): any {
        const amountPercent = this.latestPercent;
        let widthColorStyle = {
            'width': `${amountPercent}%`,
            "background-color": plantColor
        }
        return widthColorStyle;
    }
    getPlantNumberByDate(date: Date): number {
        const statusByDate = this.statusReal.find(status => new Date(status.date).toLocaleDateString() == new Date(date).toLocaleDateString());
        return statusByDate!.plantNumber;
    }
    getPlantGrowthByDate(date: Date): number {
        const statusByDate = this.statusReal.find(status => new Date(status.date).toLocaleDateString() == new Date(date).toLocaleDateString());
        return statusByDate!.plantGrowth;
    }
}

export class TrussExtended extends Truss implements PlantModel {
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
    constructor(trussAndPlant: any = new Truss()) {
        super(trussAndPlant._id, trussAndPlant.block, trussAndPlant.index, trussAndPlant.maxHole, trussAndPlant.plantId, trussAndPlant.startDate, trussAndPlant.statusReal, trussAndPlant.statusPredict, trussAndPlant.history);
        this.setPlantProperties(trussAndPlant);
    }
    setPlantProperties(plantType: Plant) {
        this.plantName = plantType.plantName;
        this.imgSrc = plantType.imgSrc;
        this.plantColor = plantType.plantColor;
        this.growUpTime = plantType.growUpTime;
        this.mediumGrowthTime = plantType.mediumGrowthTime;
        this.seedUpTime = plantType.seedUpTime;
        this.alivePercent = plantType.alivePercent;
        this.worm = plantType.worm;
        this.wormMonth = plantType.wormMonth;
    }
}

export class EmptyTruss extends Truss {
    constructor(truss: Truss = new Truss()) {
        super(truss._id, truss.block, truss.index, truss.maxHole, 0, "", [], [], truss.history);
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
}

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
        this.date = new Date(date).toLocaleDateString('es-PA');
    }
    setPlantNumber(plantNumber: number) {
        this.plantNumber = plantNumber;
    }
    setPlantGrowth(plantGrowth: number) {
        this.plantGrowth = plantGrowth;
    }

    getPlantGrowthIcon(): string {
        return this.plantGrowth < 3 ? "fas fa-seedling" : "fas fa-tractor";
    }
    getPlantStatusIcon(): string {
        return this.plantNumber > 0 ? this.getPlantGrowthIcon() : 'fas fa-check';
    }
    getPlantGrowthStr(): string {
        if (this.plantNumber == 0) {
            return "Đã thu hết rau";
        }
        if (this.plantGrowth == 1) {
            return "Cây con";
        }
        if (this.plantGrowth == 2) {
            return "Cây trung";
        }
        return "Đang thu hoạch";
    }
    calculateStatusPercent(maxHole: number): number {
        return this.plantNumber / maxHole * 100;
    }
}