import { PLANT_COLLECTION } from "../../../configs/mongodb-collection.config";
import { PlantModel } from "../models/plant.model";

export async function getPlantArr(): Promise<PlantModel[]> {
    return await PLANT_COLLECTION.findAll();
}

export async function getPlantInfo(plantId: string): Promise<PlantModel> {
    return await PLANT_COLLECTION.findOneById(plantId);
}