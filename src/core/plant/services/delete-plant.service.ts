import { DeleteWriteOpResultObject } from "mongodb";
import { PLANT_COLLECTION } from "../../../configs/mongodb-collection.config";

export async function deleteOnePlantById(plantId: string): Promise<DeleteWriteOpResultObject> {
    return await PLANT_COLLECTION.deleteOneById(plantId);
}