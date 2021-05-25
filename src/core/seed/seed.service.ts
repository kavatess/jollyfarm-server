
import { ObjectId } from "bson";
import { MongoDB_Collection } from "../../configs/collection-access.mongodb";
import { COLLECTION, DATABASE, PLANT_LOOKUP_AGGREGATION } from "../../server-constants";
import { BasicSeedModel, Seed, SeedModel } from "./seed.model";

class SeedService {
    private seedStorageCollection = new MongoDB_Collection(DATABASE.STORAGE, COLLECTION.SEED_STORAGE);
    private seedCollection = new MongoDB_Collection(DATABASE.FARM, COLLECTION.SEED);

    private seedData: Seed[] = [];

    public async getSeedData(): Promise<Seed[]> {
        if (!this.seedData.length) {
            const seedRawData: SeedModel[] = await this.seedCollection.aggregate(PLANT_LOOKUP_AGGREGATION);
            this.seedData = seedRawData.map(seed => new Seed(seed)).sort((a, b) => a.getStartDate().getTime() - b.getStartDate().getTime());
        }
        return this.seedData.map(seed => seed.seedInfo);
    }

    private async resetSeedData() {
        this.seedData = [];
        return await this.getSeedData();
    }

    public async insertManySeed(newSeedArr: BasicSeedModel[]) {
        const newSeedList = newSeedArr.map(seed => {
            let seedObj = Object.assign(seed);
            seedObj.plantId = new ObjectId(seed.plantId);
            return seedObj;
        });
        await this.seedCollection.insertMany(newSeedList);
        await this.seedStorageCollection.insertMany(newSeedList);
        return await this.resetSeedData();
    }

    public async updateSeedNumber(updatedSeedId: string, newPlantNumber: number): Promise<any> {
        const updateVal = { $set: { plantNumber: newPlantNumber } };
        await this.seedCollection.updateOneById(updatedSeedId, updateVal);
        return await this.resetSeedData();
    }

    public async deleteManySeedById(seedIdArr: string[]) {
        await this.seedCollection.deleteManyByIdArr(seedIdArr);
        return await this.resetSeedData();
    }

    public async deleteOneSeedById(seedId: string) {
        await this.seedCollection.deleteOneById(seedId);
        return await this.resetSeedData();
    }

    public async getSeedInfo(seedId: string): Promise<SeedModel> {
        return await this.seedCollection.findOneById(seedId);
    }
}

export default new SeedService();