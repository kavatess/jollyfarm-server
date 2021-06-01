import { InsertOneWriteOpResult } from "mongodb";
import { PLANT_COLLECTION } from "../../../configs/mongodb-collection.config";
import { PlantModel } from "../models/plant.model";

export async function insertOnePlant(newPlant: PlantModel): Promise<InsertOneWriteOpResult<any>> {
    return await PLANT_COLLECTION.insertOne(newPlant);
}