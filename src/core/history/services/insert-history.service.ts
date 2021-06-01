import { InsertOneWriteOpResult } from "mongodb";
import { HISTORY_COLLECTION } from "../../../configs/mongodb-collection.config";
import { BasicHistory } from "../models/basic-history.model";

export async function insertOneHistory(newHistory: BasicHistory): Promise<InsertOneWriteOpResult<any>> {
    return await HISTORY_COLLECTION.insertOne(newHistory);
}