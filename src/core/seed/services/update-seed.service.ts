import { UpdateWriteOpResult } from "mongodb";
import { SEED_COLLECTION } from "../../../configs/mongodb-collection.config";

export async function updateSeedNumber(updatedSeedId: string, newPlantNumber: number): Promise<UpdateWriteOpResult> {
    const updateVal = { $set: { plantNumber: newPlantNumber } };
    return await SEED_COLLECTION.updateOneById(updatedSeedId, updateVal);
}