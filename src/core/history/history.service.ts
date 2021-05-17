import { MongoDB_Collection } from "../../configs/collection-access.mongodb";
import { HISTORY_COLLECTION, MAIN_DATABASE, PLANT_LOOKUP_AGGREGATION } from "../../server-constants";
import { BasicHistoryModel, ResponseHistoryModel } from "./history.model";

const HistoryCollection = new MongoDB_Collection(MAIN_DATABASE, HISTORY_COLLECTION);

class HistoryService {
    private static historyData: ResponseHistoryModel[] = [];

    static async getHistoryData() {
        if (!HistoryService.historyData.length) {
            HistoryService.historyData = await HistoryCollection.aggregate(PLANT_LOOKUP_AGGREGATION);
        }
        return HistoryService.historyData;
    }

    static async resetHistoryData() {
        HistoryService.historyData = [];
        return await HistoryService.getHistoryData();
    }

    async insertOneHistory(newHistory: BasicHistoryModel) {
        await HistoryCollection.insertOne(newHistory);
        return await HistoryService.resetHistoryData();
    }
}

export default new HistoryService();