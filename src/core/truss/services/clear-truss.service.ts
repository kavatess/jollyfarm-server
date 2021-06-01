import { TRUSS_COLLECTION } from "../../../configs/mongodb-collection.config";
import { UpdateWriteOpResult } from "mongodb";
import { getTrussById } from "./get-truss-arr.service";
import { BasicHistory } from "../../history/models/basic-history.model";
import { insertOneHistory } from "../../history/services/insert-history.service";

export async function clearTruss(clearedTrussId: string): Promise<UpdateWriteOpResult | Error> {
    const clearedTruss = await getTrussById(clearedTrussId);
    if (!clearedTruss.isEmptyTruss) {
        // Insert a new History
        const newHistory = new BasicHistory().createHistoryOfTruss(clearedTruss);
        insertOneHistory(newHistory);
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