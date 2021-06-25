import { ObjectId } from "bson";
import { InsertWriteOpResult } from "mongodb";
import { SEED_COLLECTION, SEED_STORAGE_COLLECTION } from "../../../configs/mongodb-collection.config";
import { BasicSeedModel } from "../models/seed.model";


export async function insertManySeed(newSeedArr: BasicSeedModel[]): Promise<InsertWriteOpResult<any>> {
    const newSeedList = newSeedArr.map(seed => {
        seed.plantId = new ObjectId(seed.plantId);
        return seed;
    });
    await SEED_STORAGE_COLLECTION.insertMany(newSeedList);
    return await SEED_COLLECTION.insertMany(newSeedList);
}