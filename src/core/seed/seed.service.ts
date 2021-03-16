import { mongoDB_Collection } from "../../configs/collection-access.mongodb";
import { mongoDatabase } from "../../configs/connect.mongodb";
import { Seed, SeedExtended } from "./seed.model";

export class seedService extends mongoDB_Collection {
    private static seedData: SeedExtended[] = [];

    protected constructor() {
        super(mongoDatabase.getDB(), "seed-nursery-data")
    }

    protected async getSeedData(): Promise<Seed[]> {
        if (!seedService.seedData.length) {
            seedService.seedData = await this.joinWithPlantData();
        }
        return seedService.seedData;
    }

    protected async resetSeedData() {
        seedService.seedData = [];
        await this.getSeedData();
    }

    protected async updateSeedNumber(updatedObj: Seed): Promise<any> {
        const updateVal = { $set: { plantNumber: updatedObj.plantNumber } };
        return await this.updateOne(updatedObj._id, updateVal);
    }
}