import { ObjectId } from "bson";
import { MongoDB_Collection } from "../../configs/collection-access.mongodb";
import { HISTORY_COLLECTION, MAIN_DATABASE, PLANT_LOOKUP_AGGREGATION, PLANT_MERGE_LOOKUP_AGGREGATION } from "../../server-constants";
import { BasicHistoryModel, ResponseHistoryModel } from "./history.model";

export class HistoryService {
    private static historyCollection: MongoDB_Collection = new MongoDB_Collection(MAIN_DATABASE, HISTORY_COLLECTION);
    private static historyData: ResponseHistoryModel[] = [];

    public static async getHistoryData() {
        if (!HistoryService.historyData.length) {
            HistoryService.historyData = await HistoryService.historyCollection.aggregate(PLANT_LOOKUP_AGGREGATION);
        }
        return HistoryService.historyData;
    }

    private static async resetHistoryData() {
        HistoryService.historyData = [];
        return await HistoryService.getHistoryData();
    }

    public static async insertOneHistory(newHistory: BasicHistoryModel) {
        try {
            await HistoryService.historyCollection.insertOne(newHistory);
            return await HistoryService.resetHistoryData();
        } catch (err) {
            console.log(err);
            return err;
        }
    }

    public static async getHistoryByTrussId(trussId: string) {
        const aggregateMethod = [{ $match: { trussId: new ObjectId(trussId) } }, ...PLANT_LOOKUP_AGGREGATION];
        return await HistoryService.historyCollection.aggregate(aggregateMethod);
    }
}