import { mongoDB_Collection } from "../../configs/collection-access.mongodb";
import { MAIN_DATABASE, SEED_COLLECTION } from "../../server-constants";
import { Seed, SeedModel, updateSeedRequest } from "./seed.model";

export class seedService extends mongoDB_Collection {
    private static seedData: Seed[] = [];

    protected constructor() {
        super(MAIN_DATABASE, SEED_COLLECTION);
        this.resetSeedData();
    }

    protected async getSeedData(): Promise<Seed[]> {
        if (!seedService.seedData.length) {
            const seedRawData: SeedModel[] = await this.joinWithPlantData();
            seedService.seedData = seedRawData.map(seed => new Seed(seed));
        }
        return seedService.seedData.map(seed => seed.seedInfo);
    }

    protected async resetSeedData() {
        seedService.seedData = [];
        await this.getSeedData();
    }

    protected async updateSeedNumber(updatedObj: updateSeedRequest): Promise<any> {
        const updateVal = { $set: { plantNumber: updatedObj.plantNumber } };
        return await this.updateOne(updatedObj._id, updateVal);
    }
}