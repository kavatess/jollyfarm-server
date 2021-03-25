import { floor } from "mathjs";
import { getDate } from "../../server-constants";
import { PlantModel } from "../plant/plant.model";

export interface updateSeedRequest {
    _id: string;
    plantNumber: number;
}

export interface deletedSeedModel {
    idArr: string[]
}

export interface SeedModel extends PlantModel {
    _id: string;
    plantId: string;
    startDate: string;
    plantNumber: number;
}

export class Seed extends PlantModel {
    private _id: string;
    private plantId: string;
    private startDate: string;
    private plantNumber: number;
    constructor(seed: SeedModel) {
        super(seed);
        this._id = seed._id;
        this.plantId = seed.plantId;
        this.startDate = getDate(seed.startDate);
        this.plantNumber = Number(seed.plantNumber);
    }
    private get age(): number {
        const today = new Date(new Date().toDateString()).getTime();
        const startDate = new Date(this.startDate || today).getTime();
        return floor((today - startDate) / (86400000 * 7));
    }
    private get isReadySeed(): boolean {
        const today = new Date(new Date().toString()).getTime();
        const startDate = new Date(this.startDate || today).getTime();
        return (today - startDate) > 86400000 * this.seedUpTime;
    }

    get seedInfo(): any {
        return {
            _id: this._id,
            plantId: this.plantId,
            plantName: this.plantName,
            imgSrc: this.imgSrc,
            plantColor: this.plantColor,
            startDate: this.startDate,
            plantNumber: this.plantNumber,
            age: this.age,
            isReadySeed: this.isReadySeed
        }
    }
}