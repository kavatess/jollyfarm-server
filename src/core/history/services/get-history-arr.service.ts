import { ObjectId } from "bson";
import { HISTORY_COLLECTION } from "../../../configs/mongodb-collection.config";
import { PLANT_LOOKUP_AGGREGATION } from "../../../server-constants";
import { HistoryModel } from "../models/history.model";

export async function getHistoryArr(): Promise<HistoryModel[]> {
    return await HISTORY_COLLECTION.aggregate(PLANT_LOOKUP_AGGREGATION);
}

export async function getHistoryArrByTrussId(trussId: string): Promise<HistoryModel[]> {
    const aggregateMethod = [{ $match: { trussId: new ObjectId(trussId) } }, ...PLANT_LOOKUP_AGGREGATION];
    return await HISTORY_COLLECTION.aggregate(aggregateMethod);
}