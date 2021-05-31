import { MongoDB_Collection } from "../../../configs/mongodb-collection.config";
import { UpdateWriteOpResult } from "mongodb";
import { COLLECTION, DATABASE } from "../../../server-constants";
import { Status } from "../models/truss.model";
import { NewStatusRequest } from "../models/truss.request.model";
import { getTrussById } from "./get-truss-arr.service";
import { clearTruss } from "./clear-truss.service";

const TRUSS_COLLECTION = new MongoDB_Collection(DATABASE.FARM, COLLECTION.TRUSS);

export async function updateTrussStatus({ _id, date, plantNumber, plantGrowth }: NewStatusRequest): Promise<UpdateWriteOpResult | Error> {
    const { latestPlantGrowth, latestPlantNumber } = await getTrussById(_id);
    // Check valid update status
    const newPlantGrowthCond = latestPlantGrowth <= plantGrowth;
    const newPlantNumberCond = latestPlantNumber >= plantNumber;
    const exceptCond = latestPlantGrowth == plantGrowth && latestPlantNumber == plantNumber;
    if (newPlantGrowthCond && newPlantNumberCond && !exceptCond) {
        const newStatus: Status = new Status(new Date(date), plantNumber, plantGrowth);
        const updateVal = { $push: { realStatus: newStatus } };
        // If update plant number is zero, we also clear the truss
        if (!plantNumber) {
            await TRUSS_COLLECTION.updateOneById(_id, updateVal);
            return await clearTruss(_id);
        }
        return await TRUSS_COLLECTION.updateOneById(_id, updateVal);
    }
    throw new Error("Invalid update status request!");
}