import { MongoDB_Collection } from "../../configs/collection-access.mongodb";
import { HISTORY_COLLECTION, MAIN_DATABASE } from "../../server-constants";
import { HistoryModel } from "./history.model";

const HistoryCollection = new MongoDB_Collection(MAIN_DATABASE, HISTORY_COLLECTION);

class HistoryService {
    private static historyData: History[] = [];

    static async getHistoryData() {
        if (!HistoryService.historyData.length) {
            HistoryService.historyData = await HistoryCollection.joinWithPlantData();
        }
        return HistoryService.historyData;
    }

    static async resetHistoryData() {
        HistoryService.historyData = [];
        return await HistoryService.getHistoryData();
    }

    async insertOneHistory(newHistory: HistoryModel) {
        await HistoryCollection.insertOne(newHistory);
        return await HistoryService.resetHistoryData();
    }
}

export default new HistoryService();