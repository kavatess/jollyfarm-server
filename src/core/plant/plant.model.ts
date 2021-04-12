export interface PlantModel {
    _id: string;
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

export class PlantInfo {
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
    constructor(plant: PlantInfo) {
        this.plantName = plant.plantName;
        this.imgSrc = plant.imgSrc;
        this.plantColor = plant.plantColor;
        this.growUpTime = plant.growUpTime;
        this.mediumGrowthTime = plant.mediumGrowthTime;
        this.seedUpTime = plant.seedUpTime;
        this.numberPerKg = plant.numberPerKg;
        this.alivePercent = plant.alivePercent;
        this.worm = plant.worm;
        this.wormMonth = plant.wormMonth;
    }
}

export interface PlantBuilder {
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

export class Plant extends PlantInfo implements PlantBuilder {
    private _id: string;
    constructor(plant: Plant) {
        super(plant);
        this._id = plant._id;
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