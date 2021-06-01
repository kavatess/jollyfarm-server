import { TRUSS_COLLECTION } from "../../../configs/mongodb-collection.config";
import { UpdateWriteOpResult } from "mongodb";

export async function updateTrussMaxHole(trussId: string, newMaxHole: number): Promise<UpdateWriteOpResult | Error> {
    const updateVal = { $set: { maxHole: Number(newMaxHole) } };
    return await TRUSS_COLLECTION.updateOneById(trussId, updateVal);
}