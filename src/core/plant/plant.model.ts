export interface PlantModel extends BasicPlantModel {
    _id: string;
}

export interface BasicPlantModel {
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

export class Plant {
    private _id: string;
    private plantName: string;
    private imgSrc: string;
    private plantColor: string;
    private growUpTime: number;
    private mediumGrowthTime: number;
    private seedUpTime: number;
    private numberPerKg: number;
    private alivePercent: number;
    private worm: string;
    private wormMonth: string;
    constructor(plant: PlantModel) {
        this._id = plant._id;
        this.plantName = plant.plantName;
        this.imgSrc = plant.imgSrc;
        this.plantColor = plant.plantColor;
        this.growUpTime = Number(plant.growUpTime);
        this.mediumGrowthTime = Number(plant.mediumGrowthTime);
        this.seedUpTime = Number(plant.seedUpTime);
        this.numberPerKg = Number(plant.numberPerKg);
        this.alivePercent = Number(plant.alivePercent);
        this.worm = plant.worm;
        this.wormMonth = plant.wormMonth;
    }
    getPlantId(): string {
        return this._id;
    }
    getPlantName(): string {
        return this.plantName;
    }
    getPlantColor(): string {
        return this.plantColor;
    }
    getImgSrc(): string {
        return this.imgSrc;
    }
    getGrowUpTime(): number {
        return this.growUpTime;
    }
    getMediumGrowthTime(): number {
        return this.mediumGrowthTime;
    }
    getSeedUpTime(): number {
        return this.seedUpTime;
    }
    getNumberPerKg(): number {
        return this.numberPerKg;
    }
    getAlivePercent(): number {
        return this.alivePercent;
    }
    getWormInfo(): string {
        return this.worm;
    }
    getWormMonth(): string {
        return this.wormMonth;
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