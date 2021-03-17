export interface PlantModel {
    plantId: number;
    plantName: string;
    imgSrc: string;
    plantColor: string;
    growUpTime: number;
    mediumGrowthTime: number;
    seedUpTime: number;
    numberPerKg: number;
    alivePercent: number;
    worm: string;
    wormMonth: string;
}

export interface PlantBuilder {
    setPlantId(plantId: number): void;
    setPlantName(plantName: string): void;
    setImgSrc(imgSrc: string): void;
    setPlantColor(plantColor: string): void;
    setGrowUpTime(growUpTime: number): void;
    setMediumGrowthTime(mediumGrowthTime: number): void;
    setSeedUpTime(seedUpTime: number): void;
    setNumberPerKg(numberPerKg: number): void;
    setWorm(worm: string): void;
    setWormMonths(months: string): void;
}

export class Plant implements PlantModel, PlantBuilder {
    _id: string;
    plantId: number;
    plantName: string;
    imgSrc: string;
    plantColor: string;
    growUpTime: number;
    mediumGrowthTime: number;
    seedUpTime: number;
    numberPerKg: number;
    alivePercent: number;
    worm: string;
    wormMonth: string;
    constructor(_id: string, plantId: number = 0, plantName: string = "", imgSrc: string = "", plantColor: string = "", growUpTime: number = 0, mediumGrowthTime: number = 0, seedUpTime: number = 0, numberPerKg: number = 0, alivePercent: number = 0, worm: string = "", wormMonth: string = "") {
        this._id = _id;
        this.plantId = plantId;
        this.plantName = plantName;
        this.imgSrc = imgSrc;
        this.plantColor = plantColor;
        this.growUpTime = growUpTime;
        this.mediumGrowthTime = mediumGrowthTime;
        this.seedUpTime = seedUpTime;
        this.numberPerKg = numberPerKg;
        this.alivePercent = alivePercent;
        this.worm = worm;
        this.wormMonth = wormMonth;
    }
    set id(id: string) {
        this._id = id;
    }
    setPlantId(plantId: number): void {
        this.plantId = Number(plantId);
    }
    setPlantName(plantName: string): void {
        this.plantName = plantName;
    }
    setImgSrc(imgSrc: string): void {
        this.imgSrc = imgSrc;
    }
    setPlantColor(plantColor: string): void {
        this.plantColor = plantColor;
    }
    setGrowUpTime(growUpTime: number): void {
        this.growUpTime = Number(growUpTime);
    }
    setMediumGrowthTime(mediumGrowthTime: number): void {
        this.mediumGrowthTime = Number(mediumGrowthTime);
    }
    setSeedUpTime(seedUpTime: number): void {
        this.seedUpTime = Number(seedUpTime);
    }
    setNumberPerKg(numberPerKg: number): void {
        this.numberPerKg = Number(numberPerKg);
    }
    setWorm(worm: string): void {
        this.worm = worm;
    }
    setWormMonths(months: string): void {
        this.wormMonth = months;
    }
}