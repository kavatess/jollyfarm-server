import { MongoDB_Collection } from "../../../configs/mongodb-collection.config";
import { UpdateWriteOpResult } from "mongodb";
import { COLLECTION, DATABASE } from "../../../server-constants";
import { Status } from "../models/truss.model";
import { CreateTrussRequest } from "../models/truss.request.model";
import { getTrussById } from "./get-truss-arr.service";
import { SeedModel } from "../../seed/seed.model";
import { SeedService } from "../../seed/seed.service";

const TRUSS_COLLECTION = new MongoDB_Collection(DATABASE.FARM, COLLECTION.TRUSS);

export async function createSeason({ _id, startDate, seedId }: CreateTrussRequest): Promise<UpdateWriteOpResult | Error> {
    const createdTruss = await getTrussById(_id);
    // Check empty truss to create new season
    if (createdTruss.isEmptyTruss) {
        // Get seed to plant
        const selectedSeed: SeedModel = await SeedService.getSeedInfo(seedId);
        const firstStatus = new Status(new Date(startDate), selectedSeed.plantNumber, 1);
        if (selectedSeed.plantNumber > createdTruss.maxHole) {
            firstStatus.plantNumber = createdTruss.maxHole;
            SeedService.updateSeedNumber(selectedSeed._id, Number(selectedSeed.plantNumber - createdTruss.maxHole));
        } else {
            SeedService.deleteOneSeedById(selectedSeed._id);
        }
        const updateVal = {
            $set: {
                plantId: selectedSeed.plantId,
                startDate: startDate,
                realStatus: [firstStatus]
            }
        };
        return await TRUSS_COLLECTION.updateOneById(_id, updateVal);
    }
    throw new Error(`Cannot create truss with ID: "${_id}" because it is now being planted.`);
}