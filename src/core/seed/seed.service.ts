import { ObjectId } from "bson";
import { MongoDB_Collection } from "../../configs/collection-access.mongodb";
import { MAIN_DATABASE, PLANT_LOOKUP_AGGREGATION, SEED_COLLECTION, SEED_STORAGE_COLLECTION, STORAGE_DATABASE } from "../../server-constants";
import { BasicSeedModel, Seed, SeedModel } from "./seed.model";

export class SeedService {
    private static seedStorageCollection = new MongoDB_Collection(STORAGE_DATABASE, SEED_STORAGE_COLLECTION);
    private static seedCollection = new MongoDB_Collection(MAIN_DATABASE, SEED_COLLECTION);

    private static seedData: Seed[] = [];

    public static async getSeedData(): Promise<Seed[]> {
        if (!SeedService.seedData.length) {
            const seedRawData: SeedModel[] = await SeedService.seedCollection.aggregate(PLANT_LOOKUP_AGGREGATION);
            SeedService.seedData = seedRawData.map(seed => new Seed(seed)).sort((a, b) => a.getStartDate().getTime() - b.getStartDate().getTime());
        }
        return SeedService.seedData.map(seed => seed.seedInfo);
    }

    private static async resetSeedData() {
        SeedService.seedData = [];
        return await this.getSeedData();
    }

    public static async insertManySeed(newSeedArr: BasicSeedModel[]) {
        const newSeedList = newSeedArr.map(seed => {
            let seedObj = Object.assign(seed);
            seedObj._id = new ObjectId(seed.plantId);
            return seedObj;
        });
        await SeedService.seedCollection.insertMany(newSeedList);
        await SeedService.seedStorageCollection.insertMany(newSeedList);
        return await this.resetSeedData();
    }

    public static async updateSeedNumber(updatedSeedId: string, newPlantNumber: number): Promise<any> {
        const updateVal = { $set: { plantNumber: newPlantNumber } };
        await SeedService.seedCollection.updateOne(updatedSeedId, updateVal);
        return await this.resetSeedData();
    }

    public static async deleteManySeedById(seedIdArr: string[]) {
        await SeedService.seedCollection.deleteManyByIdArr(seedIdArr);
        return await this.resetSeedData();
    }

    public static async deleteOneSeedById(seedId: string) {
        await SeedService.seedCollection.deleteOneById(seedId);
        return await this.resetSeedData();
    }

    public static async getSeedInfo(seedId: string): Promise<SeedModel> {
        return await SeedService.seedCollection.findOneById(seedId);
    }
}