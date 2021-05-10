import { ObjectId } from "bson";
import { MongoDB_Collection } from "../../configs/collection-access.mongodb";
import { MAIN_DATABASE, SEED_COLLECTION, SEED_STORAGE_COLLECTION, STORAGE_DATABASE } from "../../server-constants";
import { Seed, SeedModel } from "./seed.model";

const SeedStorageCollection = new MongoDB_Collection(STORAGE_DATABASE, SEED_STORAGE_COLLECTION);
const SeedCollection = new MongoDB_Collection(MAIN_DATABASE, SEED_COLLECTION);

class SeedService {
    private static seedData: Seed[] = [];

    constructor() {
        this.resetSeedData();
    }

    async getSeedData(): Promise<Seed[]> {
        if (!SeedService.seedData.length) {
            const seedRawData: SeedModel[] = await SeedCollection.joinWithPlantData();
            SeedService.seedData = seedRawData.map(seed => new Seed(seed)).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
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
        await SeedCollection.insertMany(newSeedList);
        await SeedStorageCollection.insertMany(newSeedList);
        return await this.resetSeedData();
    }

    async updateSeedNumber(updatedSeedId: string, newPlantNumber: number): Promise<any> {
        const updateVal = { $set: { plantNumber: newPlantNumber } };
        await SeedCollection.updateOne(updatedSeedId, updateVal);
        return await this.resetSeedData();
    }

    async deleteManySeedById(seedIdArr: string[]) {
        await SeedCollection.deleteManyByIdArr(seedIdArr);
        return await this.resetSeedData();
    }

    async deleteOneSeedById(seedId: string) {
        await SeedCollection.deleteOneById(seedId);
        return await this.resetSeedData();
    }

    async getSeedInfo(seedId: string): Promise<SeedModel> {
        return await SeedCollection.findOneById(seedId);
    }
}

export default new SeedService();