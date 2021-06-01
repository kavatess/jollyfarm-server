import { UpdateWriteOpResult } from "mongodb";
import { Status } from "../models/truss.model";
import { NewStatusRequest } from "../models/truss.request.model";
import { getTrussById } from "./get-truss-arr.service";
import { clearTruss } from "./clear-truss.service";
import { TRUSS_COLLECTION } from "../../configs/mongodb-collection.config";

export async function updateTrussStatus({ _id, plantNumber, plantGrowth }: NewStatusRequest): Promise<UpdateWriteOpResult | Error> {
    const { latestPlantGrowth, latestPlantNumber } = await getTrussById(_id);
    // Check valid update status
    const newPlantGrowthCond = latestPlantGrowth <= plantGrowth;
    const newPlantNumberCond = latestPlantNumber >= plantNumber;
    const exceptCond = latestPlantGrowth == plantGrowth && latestPlantNumber == plantNumber;
    if (newPlantGrowthCond && newPlantNumberCond && !exceptCond) {
        const newStatus: Status = new Status({ plantNumber, plantGrowth });
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