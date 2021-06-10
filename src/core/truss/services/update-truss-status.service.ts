import { UpdateWriteOpResult } from "mongodb";
import { Status } from "../models/status.model";
import { getTrussById } from "./get-truss-arr.service";
import { clearTruss } from "./clear-truss.service";
import { RECORD_COLLECTION, TRUSS_COLLECTION } from "../../../configs/mongodb-collection.config";
import { Truss } from "../models/truss.model";
import { NewRecord } from "../models/record.model";

export async function updateTrussStatus(trussId: string, plantNumber: number, plantGrowth: number): Promise<UpdateWriteOpResult | Error> {
    const updatedTruss = await getTrussById(trussId);
    if (checkValidUpdateStatus(updatedTruss, plantNumber, plantGrowth)) {
        const newStatus: Status = new Status({ plantNumber, plantGrowth });
        const updateVal = { $push: { realStatus: newStatus } };
        if (plantNumber < updatedTruss.latestPlantNumber) {
            await insertHarvestRecord(updatedTruss, plantNumber);
        }
        // If update plant number is zero, we must clear the truss
        if (!plantNumber) {
            await TRUSS_COLLECTION.updateOneById(trussId, updateVal);
            return await clearTruss(trussId);
        }
        return await TRUSS_COLLECTION.updateOneById(trussId, updateVal);
    }
    throw new Error("Invalid update status request!");
}

function checkValidUpdateStatus({ latestPlantGrowth, latestPlantNumber }: Truss, updateNumber: number, updateGrowth: number): boolean {
    // Update status conditions
    const newPlantGrowthCond = latestPlantGrowth <= updateGrowth;
    const newPlantNumberCond = latestPlantNumber >= updateNumber;
    const exceptCond = latestPlantGrowth == updateGrowth && latestPlantNumber == updateNumber;
    return newPlantGrowthCond && newPlantNumberCond && !exceptCond;
}

async function insertHarvestRecord({ id, plantId, latestPlantNumber }: Truss, updateNumber: number) {
    const record = new NewRecord(id, plantId, latestPlantNumber - updateNumber);
    return await RECORD_COLLECTION.insertOne(record);
}