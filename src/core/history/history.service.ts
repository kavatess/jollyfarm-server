import { ObjectId } from "bson";
import { MongoDB_Collection } from "../../configs/collection-access.mongodb";
import { COLLECTION, DATABASE, PLANT_LOOKUP_AGGREGATION } from "../../server-constants";
import { BasicHistoryModel, ResponseHistoryModel } from "./history.model";

class HistoryService {
    private historyCollection: MongoDB_Collection = new MongoDB_Collection(DATABASE.FARM, COLLECTION.HISTORY);
    private historyData: ResponseHistoryModel[] = [];

    public async getHistoryData() {
        if (!this.historyData.length) {
            this.historyData = await this.historyCollection.aggregate(PLANT_LOOKUP_AGGREGATION);
        }
        return this.historyData;
    }

    private async resetHistoryData() {
        this.historyData = [];
        return await this.getHistoryData();
    }

    public async insertOneHistory(newHistory: BasicHistoryModel) {
        try {
            await this.historyCollection.insertOne(newHistory);
            return await this.resetHistoryData();
        } catch (err) {
            console.log(err);
            return err;
        }
    }

    public async getHistoryByTrussId(trussId: string) {
        const aggregateMethod = [{ $match: { trussId: new ObjectId(trussId) } }, ...PLANT_LOOKUP_AGGREGATION];
        return await this.historyCollection.aggregate(aggregateMethod);
    }
}

export default new HistoryService();