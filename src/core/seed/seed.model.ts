import { floor } from "mathjs";
import { PlantModel } from "../plant/plant.model";

export interface addedSeedModel {
    plantId: number;
    startDate: string;
    plantNumber: number;
}

export interface deletedSeedModel {
    idArr: string[]
}

export class Seed {
    _id: string;
    plantId!: number;
    startDate!: string;
    plantNumber!: number;
    constructor(id: string = "", plantId: number = 0, startDate: string = "", plantNumber: number = 0) {
        this._id = id;
        this.plantId = Number(plantId);
        this.startDate = new Date(startDate).toLocaleDateString('es-PA');
        this.plantNumber = Number(plantNumber);
    }
    get age(): number {
        const today = new Date(new Date().toDateString()).getTime();
        const startDate = new Date(this.startDate || today).getTime();
        return floor((today - startDate) / (86400000 * 7));
    }
    exportAddedSeedJSON(): addedSeedModel {
        return {
            startDate: this.startDate,
            plantId: this.plantId,
            plantNumber: this.plantNumber
        }
    }
}

export class SeedExtended extends Seed implements PlantModel {
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
    constructor(seedAndPlant: any = new Seed()) {
        super(seedAndPlant._id, seedAndPlant.plantId, seedAndPlant.startDate, seedAndPlant.plantNumber);
        this.setPlantProperties(seedAndPlant);
    }
    setPlantProperties(plantType: PlantModel) {
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
    get isReadySeed(): boolean {
        const today = new Date(new Date().toDateString()).getTime();
        const startDate = new Date(this.startDate || today).getTime();
        return (today - startDate) > 86400000 * this.seedUpTime;
    }
    get statusIcon(): string {
        return this.isReadySeed ? "fas fa-tractor" : "fas fa-seedling";
    }
}