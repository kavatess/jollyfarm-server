import { TRUSS_COLLECTION } from "../../../configs/mongodb-collection.config";
import { UpdateWriteOpResult } from "mongodb";
import { Status } from "../models/status.model";
import { getTrussById } from "./get-truss-arr.service";
import { SeedModel } from "../../seed/models/seed.model";
import { getSeedInfo } from "../../seed/services/get-seed-data.service";
import { updateSeedNumber } from "../../seed/services/update-seed.service";
import { deleteOneSeedById } from "../../seed/services/delete-seed.service";

export async function createSeason(trussId: string, seedId: string): Promise<UpdateWriteOpResult | Error> {
    const createdTruss = await getTrussById(trussId);
    // Check empty truss to create new season
    if (createdTruss.isEmptyTruss) {
        // Get seed to plant
        const selectedSeed: SeedModel = await getSeedInfo(seedId);
        const firstStatus = new Status({ plantNumber: selectedSeed.plantNumber, plantGrowth: 1 });
        if (selectedSeed.plantNumber > createdTruss.maxHole) {
            firstStatus.plantNumber = createdTruss.maxHole;
            updateSeedNumber(selectedSeed._id, Number(selectedSeed.plantNumber - createdTruss.maxHole));
        } else {
            deleteOneSeedById(selectedSeed._id);
        }
        const updateVal = {
            $set: {
                plantId: selectedSeed.plantId,
                startDate: firstStatus.date,
                realStatus: [firstStatus]
            }
        };
        return await TRUSS_COLLECTION.updateOneById(trussId, updateVal);
    }
    throw new Error(`Cannot create truss with ID: "${trussId}" because it is now being planted.`);
}