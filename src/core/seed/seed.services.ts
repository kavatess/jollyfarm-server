import { ObjectId } from "bson";
import { MongoDB_Collection } from "../../configs/collection-access.mongodb";
import { MAIN_DATABASE, SEED_COLLECTION } from "../../server-constants";
import { Seed, SeedModel, updateSeedRequest } from "./seed.model";

const seedCollection = new MongoDB_Collection(MAIN_DATABASE, SEED_COLLECTION);

class SeedService {
    private static seedData: Seed[] = [];

    constructor() {
        this.resetSeedData();
    }

    async getSeedData(): Promise<Seed[]> {
        if (!SeedService.seedData.length) {
            const seedRawData: SeedModel[] = await seedCollection.joinWithPlantData();
            SeedService.seedData = seedRawData.map(seed => new Seed(seed));
        }
        return SeedService.seedData.map(seed => seed.seedInfo);
    }

    private async resetSeedData() {
        SeedService.seedData = [];
        return await this.getSeedData();
    }

    async insertManySeed(newSeedArr: SeedModel[]) {
        const newSeedList = newSeedArr.map(seed => {
            seed.plantId = new ObjectId(seed.plantId);
            return seed;
        });
        await seedCollection.insertMany(newSeedList);
        return await this.resetSeedData();
    }

    async updateSeedNumber(updatedObj: updateSeedRequest): Promise<any> {
        const updateVal = { $set: { plantNumber: updatedObj.plantNumber } };
        await seedCollection.updateOne(updatedObj._id, updateVal);
        return await this.resetSeedData();
    }

    async deleteManySeedById(seedIdArr: string[]) {
        await seedCollection.deleteManyByIdArr(seedIdArr);
        return await this.resetSeedData();
    }

    async deleteOneSeedById(seedId: string) {
        await seedCollection.deleteOneById(seedId);
        return await this.resetSeedData();
    }
}

export default new SeedService();