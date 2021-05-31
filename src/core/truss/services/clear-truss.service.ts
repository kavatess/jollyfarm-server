import { MongoDB_Collection } from "../../../configs/mongodb-collection.config";
import { UpdateWriteOpResult } from "mongodb";
import { COLLECTION, DATABASE } from "../../../server-constants";
import { getTrussById } from "./get-truss-arr.service";
import { HistoryService } from "../../history/history.service";
import { BasicHistoryModel } from "../../history/history.model";

const TRUSS_COLLECTION = new MongoDB_Collection(DATABASE.FARM, COLLECTION.TRUSS);

export async function clearTruss(clearedTrussId: string): Promise<UpdateWriteOpResult | Error> {
    const clearedTruss = await getTrussById(clearedTrussId);
    if (!clearedTruss.isEmptyTruss) {
        // Insert a new History
        const newHistory = new BasicHistoryModel().createHistoryOfTruss(clearedTruss);
        HistoryService.insertOneHistory(newHistory);
        // Reset truss
        const updateVal = {
            $set: {
                plantId: '',
                startDate: '',
                realStatus: []
            }
        };
        return await TRUSS_COLLECTION.updateOneById(clearedTrussId, updateVal);
    }
    throw new Error(`Cannot clear truss with ID: "${clearedTrussId}" because it is now empty.`);
}