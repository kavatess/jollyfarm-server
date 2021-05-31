import { UpdateWriteOpResult } from "mongodb";
import { MongoDB_Collection } from "../../../configs/mongodb-collection.config";
import { COLLECTION, DATABASE } from "../../../server-constants";
import { UpdateMaxHoleRequest } from "../models/truss.request.model";

const TRUSS_COLLECTION = new MongoDB_Collection(DATABASE.FARM, COLLECTION.TRUSS);

export async function updateTrussMaxHole({ _id, maxHole }: UpdateMaxHoleRequest): Promise<UpdateWriteOpResult | Error> {
    const updateVal = { $set: { maxHole } };
    return await TRUSS_COLLECTION.updateOneById(_id, updateVal);
}