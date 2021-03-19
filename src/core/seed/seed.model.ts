import { floor } from "mathjs";
import { getDate } from "../../server-constants";
import { PlantModel } from "../plant/plant.model";

export interface addedSeedModel {
    plantId: number;
    startDate: string;
    plantNumber: number;
}

export interface deletedSeedModel {
    idArr: string[]
}

export interface SeedModel extends PlantModel {
    _id: string;
    plantId: number;
    startDate: string;
    plantNumber: number;
}

export class Seed extends PlantModel {
    _id: string;
    plantId: number;
    startDate: string;
    plantNumber: number;
    constructor(seed: Seed) {
        super(seed)
        this._id = seed._id;
        this.plantId = Number(seed.plantId);
        this.startDate = getDate(seed.startDate);
        this.plantNumber = Number(seed.plantNumber);
    }
    get age(): number {
        const today = new Date(new Date().toDateString()).getTime();
        const startDate = new Date(this.startDate || today).getTime();
        return floor((today - startDate) / (86400000 * 7));
    }
    get isReadySeed(): boolean {
        const today = new Date(new Date().toString()).getTime();
        const startDate = new Date(this.startDate || today).getTime();
        return (today - startDate) > 86400000 * this.seedUpTime;
    }
    get statusIcon(): string {
        return this.isReadySeed ? "fas fa-tractor" : "fas fa-seedling";
    }
    exportAddedSeedJSON(): addedSeedModel {
        return {
            startDate: this.startDate,
            plantId: this.plantId,
            plantNumber: this.plantNumber
        }
    }
}