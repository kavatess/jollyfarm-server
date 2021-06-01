import { DeleteWriteOpResultObject } from "mongodb";
import { SEED_COLLECTION } from "../../../configs/mongodb-collection.config";

export async function deleteManySeedById(seedIdArr: string[]): Promise<DeleteWriteOpResultObject> {
    return await SEED_COLLECTION.deleteManyByIdArr(seedIdArr);
}

export async function deleteOneSeedById(seedId: string): Promise<DeleteWriteOpResultObject> {
    return await SEED_COLLECTION.deleteOneById(seedId);
}