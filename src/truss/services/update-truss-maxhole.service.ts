import { TRUSS_COLLECTION } from "../../configs/mongodb-collection.config";
import { UpdateWriteOpResult } from "mongodb";
import { UpdateMaxHoleRequest } from "../models/truss.request.model";

export async function updateTrussMaxHole({ _id, maxHole }: UpdateMaxHoleRequest): Promise<UpdateWriteOpResult | Error> {
    const updateVal = { $set: { maxHole } };
    return await TRUSS_COLLECTION.updateOneById(_id, updateVal);
}