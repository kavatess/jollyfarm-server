import { TRUSS_COLLECTION } from "../../../configs/mongodb-collection.config";
import { UpdateWriteOpResult } from "mongodb";
import { getTrussById } from "./get-truss-arr.service";

export async function revertTrussStatus(revertedTrussId: string, revertStatusIndex: number): Promise<UpdateWriteOpResult | Error> {
    const { realStatus } = await getTrussById(revertedTrussId);
    if (revertStatusIndex >= 0 && realStatus.length > 1) {
        const updateVal = {
            $push: {
                realStatus: {
                    $each: [],
                    $slice: revertStatusIndex + 1
                }
            }
        };
        return await TRUSS_COLLECTION.updateOneById(revertedTrussId, updateVal);
    }
    throw new Error("Invalid index status to revert.");
}