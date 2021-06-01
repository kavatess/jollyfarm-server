import { UpdateWriteOpResult } from "mongodb";
import { Status } from "../models/status.model";
import { getTrussById } from "./get-truss-arr.service";
import { clearTruss } from "./clear-truss.service";
import { TRUSS_COLLECTION } from "../../../configs/mongodb-collection.config";

export async function updateTrussStatus(trussId: string, plantNumber: number, plantGrowth: number): Promise<UpdateWriteOpResult | Error> {
    const { latestPlantGrowth, latestPlantNumber } = await getTrussById(trussId);
    // Check valid update status
    const newPlantGrowthCond = latestPlantGrowth <= plantGrowth;
    const newPlantNumberCond = latestPlantNumber >= plantNumber;
    const exceptCond = latestPlantGrowth == plantGrowth && latestPlantNumber == plantNumber;
    if (newPlantGrowthCond && newPlantNumberCond && !exceptCond) {
        const newStatus: Status = new Status({ plantNumber, plantGrowth });
        const updateVal = { $push: { realStatus: newStatus } };
        // If update plant number is zero, we also clear the truss
        if (!plantNumber) {
            await TRUSS_COLLECTION.updateOneById(trussId, updateVal);
            return await clearTruss(trussId);
        }
        return await TRUSS_COLLECTION.updateOneById(trussId, updateVal);
    }
    throw new Error("Invalid update status request!");
}