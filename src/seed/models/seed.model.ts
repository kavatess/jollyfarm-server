import { ObjectId } from "bson";
import { floor } from "mathjs";
import { Plant, PlantModel } from "../../plant/plant.model";

export interface UpdateSeedRequest {
    _id: string;
    plantNumber: number;
}

export interface DeletedSeedModel {
    idArr: string[]
}

export interface BasicSeedModel {
    _id: string;
    plantId: ObjectId;
    startDate: string;
    plantNumber: number;
}

export interface SeedModel extends BasicSeedModel {
    plantType: PlantModel;
}

export class Seed {
    private _id: string;
    private plantId: ObjectId;
    private startDate: Date;
    private plantNumber: number;
    private plantType: Plant;
    constructor(seed: SeedModel) {
        this._id = seed._id;
        this.plantId = seed.plantId;
        this.startDate = new Date(seed.startDate);
        this.plantNumber = Number(seed.plantNumber);
        this.plantType = new Plant(seed.plantType);
    }
    getSeedId(): string {
        return this._id;
    }
    getPlantId(): ObjectId {
        return this.plantId;
    }
    getStartDate(): Date {
        return this.startDate;
    }
    getPlantNumber(): number {
        return this.plantNumber;
    }
    setSeedId(seedId: string): void {
        this._id = seedId;
    }
    setPlantId(plantId: ObjectId): void {
        this.plantId = plantId;
    }
    setStartDate(startDate: string): void {
        this.startDate = new Date(startDate);
    }
    setPlantNumber(plantNumber: number): void {
        this.plantNumber = Number(plantNumber);
    }
    setPlantType(plant: PlantModel) {
        this.plantType = new Plant(plant);
    }
    private getAgeOfSeed(): number {
        const today = new Date().getTime();
        const startDate = new Date(this.startDate || today).getTime();
        return floor((today - startDate) / (86400000 * 7));
    }
    private isReadySeed(): boolean {
        const today = new Date().getTime();
        const startDate = new Date(this.startDate || today).getTime();
        return (today - startDate) > 86400000 * this.plantType.getSeedUpTime();
    }
    public get seedInfo(): any {
        return {
            _id: this._id,
            plantId: this.plantId,
            plantName: this.plantType.getPlantName(),
            imgSrc: this.plantType.getImgSrc(),
            plantColor: this.plantType.getPlantColor(),
            startDate: this.startDate,
            plantNumber: this.plantNumber,
            age: this.getAgeOfSeed(),
            isReadySeed: this.isReadySeed()
        }
    }
}