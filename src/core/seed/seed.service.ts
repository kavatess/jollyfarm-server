import { mongoDB_Collection } from "../../configs/collection-access.mongodb";
import { mongoDatabase } from "../../configs/connect.mongodb";
import { Seed, SeedExtended } from "./seed.model";

export class seedService extends mongoDB_Collection {
    private seedData: SeedExtended[] = [];

    protected constructor() {
        super(mongoDatabase.getDB(), "seed-nursery-data")
    }

    protected async getSeedData(): Promise<Seed[]> {
        if (!this.seedData.length) {
            this.seedData = await this.joinWithPlantData();
        }
        return this.seedData;
    }

    protected async resetSeedData() {
        this.seedData = [];
        await this.getSeedData();
    }

    protected async updateSeedNumber(updatedObj: Seed): Promise<any> {
        const updateVal = { $set: { plantNumber: updatedObj.plantNumber } };
        return await this.updateOne(updatedObj._id, updateVal);
    }
}