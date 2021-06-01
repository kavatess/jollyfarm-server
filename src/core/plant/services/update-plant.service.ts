import { UpdateWriteOpResult } from "mongodb";
import { PLANT_COLLECTION } from "../../../configs/mongodb-collection.config";
import { PlantModel } from "../models/plant.model";

export async function updatePlant(updatedObj: PlantModel): Promise<UpdateWriteOpResult> {
    const updateVal = {
        $set: {
            plantName: updatedObj.plantName,
            imgSrc: updatedObj.imgSrc,
            plantColor: updatedObj.plantColor,
            growUpTime: updatedObj.growUpTime,
            mediumGrowthTime: updatedObj.mediumGrowthTime,
            seedUpTime: updatedObj.seedUpTime,
            numberPerKg: updatedObj.numberPerKg,
            alivePercent: updatedObj.alivePercent,
            worm: updatedObj.worm,
            wormMonth: updatedObj.wormMonth
        }
    }
    return await PLANT_COLLECTION.updateOneById(updatedObj._id, updateVal);
}
