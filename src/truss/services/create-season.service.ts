import { TRUSS_COLLECTION } from "../../configs/mongodb-collection.config";
import { UpdateWriteOpResult } from "mongodb";
import { Status } from "../models/truss.model";
import { CreateTrussRequest } from "../models/truss.request.model";
import { getTrussById } from "./get-truss-arr.service";
import { SeedModel } from "../../seed/models/seed.model";
import { SeedService } from "../../seed/services/seed.service";

export async function createSeason({ _id, seedId }: CreateTrussRequest): Promise<UpdateWriteOpResult | Error> {
    const createdTruss = await getTrussById(_id);
    // Check empty truss to create new season
    if (createdTruss.isEmptyTruss) {
        // Get seed to plant
        const selectedSeed: SeedModel = await SeedService.getSeedInfo(seedId);
        const firstStatus = new Status({ plantNumber: selectedSeed.plantNumber, plantGrowth: 1 });
        if (selectedSeed.plantNumber > createdTruss.maxHole) {
            firstStatus.plantNumber = createdTruss.maxHole;
            SeedService.updateSeedNumber(selectedSeed._id, Number(selectedSeed.plantNumber - createdTruss.maxHole));
        } else {
            SeedService.deleteOneSeedById(selectedSeed._id);
        }
        const updateVal = {
            $set: {
                plantId: selectedSeed.plantId,
                startDate: firstStatus.date,
                realStatus: [firstStatus]
            }
        };
        return await TRUSS_COLLECTION.updateOneById(_id, updateVal);
    }
    throw new Error(`Cannot create truss with ID: "${_id}" because it is now being planted.`);
}