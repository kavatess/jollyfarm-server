import { ObjectId } from "bson";
import { MongoDB_Collection } from "../../configs/mongodb-collection.config";
import { COLLECTION, DATABASE, PLANT_LOOKUP_AGGREGATION } from "../../server-constants";
import { BasicHistoryModel } from "./history.model";

export class HistoryService {
    private static historyCollection: MongoDB_Collection = new MongoDB_Collection(DATABASE.FARM, COLLECTION.HISTORY);

    public static async getHistoryData() {
        return await this.historyCollection.aggregate(PLANT_LOOKUP_AGGREGATION);
    }

    public static async insertOneHistory(newHistory: BasicHistoryModel) {
        return await this.historyCollection.insertOne(newHistory);
    }

    public static async getHistoryByTrussId(trussId: string) {
        const aggregateMethod = [{ $match: { trussId: new ObjectId(trussId) } }, ...PLANT_LOOKUP_AGGREGATION];
        return await this.historyCollection.aggregate(aggregateMethod);
    }
}