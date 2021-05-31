
import { ObjectId } from "bson";
import { MongoDB_Collection } from "../../configs/mongodb-collection.config";
import { COLLECTION, DATABASE, PLANT_LOOKUP_AGGREGATION } from "../../server-constants";
import { BasicSeedModel, Seed, SeedModel } from "./seed.model";

export class SeedService {
    private static seedStorageCollection = new MongoDB_Collection(DATABASE.STORAGE, COLLECTION.SEED_STORAGE);
    private static seedCollection = new MongoDB_Collection(DATABASE.FARM, COLLECTION.SEED);

    public static async getSeedData(): Promise<Seed[]> {
        const seedRawData: SeedModel[] = await this.seedCollection.aggregate(PLANT_LOOKUP_AGGREGATION);
        const sortedSeedArr = seedRawData.map(seed => new Seed(seed)).sort((a, b) => a.getStartDate().getTime() - b.getStartDate().getTime());
        return sortedSeedArr.map(seed => seed.seedInfo);
    }

    public static async insertManySeed(newSeedArr: BasicSeedModel[]) {
        const newSeedList = newSeedArr.map(seed => {
            seed.plantId = new ObjectId(seed.plantId);
            return seed;
        });
        await this.seedStorageCollection.insertMany(newSeedList);
        return await this.seedCollection.insertMany(newSeedList);
    }

    public static async updateSeedNumber(updatedSeedId: string, newPlantNumber: number): Promise<any> {
        const updateVal = { $set: { plantNumber: newPlantNumber } };
        return await this.seedCollection.updateOneById(updatedSeedId, updateVal);
    }

    public static async deleteManySeedById(seedIdArr: string[]) {
        return await this.seedCollection.deleteManyByIdArr(seedIdArr);
    }

    public static async deleteOneSeedById(seedId: string) {
        return await this.seedCollection.deleteOneById(seedId);
    }

    public static async getSeedInfo(seedId: string): Promise<SeedModel> {
        return await this.seedCollection.findOneById(seedId);
    }
}