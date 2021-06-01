import { SEED_COLLECTION } from "../../../configs/mongodb-collection.config";
import { PLANT_LOOKUP_AGGREGATION } from "../../../server-constants";
import { Seed, SeedModel } from "../models/seed.model";

export async function getSeedArr(): Promise<Seed[]> {
    const seedRawData: SeedModel[] = await SEED_COLLECTION.aggregate(PLANT_LOOKUP_AGGREGATION);
    const sortedSeedArr = seedRawData.map(seed => new Seed(seed)).sort((a, b) => a.getStartDate().getTime() - b.getStartDate().getTime());
    return sortedSeedArr.map(seed => seed.seedInfo);
}

export async function getSeedInfo(seedId: string): Promise<SeedModel> {
    return await SEED_COLLECTION.findOneById(seedId);
}