import { UpdateWriteOpResult } from "mongodb";
import { MongoDB_Collection } from "../../../configs/mongodb-collection.config";
import { COLLECTION, DATABASE } from "../../../server-constants";
import { RevertTrussRequest } from "../models/truss.request.model";
import { getTrussById } from "./get-truss-arr.service";

const TRUSS_COLLECTION = new MongoDB_Collection(DATABASE.FARM, COLLECTION.TRUSS);

export async function revertTrussStatus({ _id, statusIndex }: RevertTrussRequest): Promise<UpdateWriteOpResult | Error> {
    const revertedTruss = await getTrussById(_id);
    if (statusIndex >= 0 && revertedTruss.realStatus.length > 1) {
        const updateVal = {
            $push: {
                realStatus: {
                    $each: [],
                    $slice: statusIndex + 1
                }
            }
        };
        return await TRUSS_COLLECTION.updateOneById(_id, updateVal);
    }
    throw new Error("Invalid index status to revert.");
}