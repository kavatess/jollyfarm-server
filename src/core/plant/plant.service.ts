import { MongoDB_Collection } from "../../configs/collection-access.mongodb";
import { MAIN_DATABASE, PLANT_COLLECTION } from "../../server-constants";
import { PlantModel } from "./plant.model";

export class PlantService {
    private static plantCollection: MongoDB_Collection = new MongoDB_Collection(MAIN_DATABASE, PLANT_COLLECTION);
    private static plantData: PlantModel[] = [];

    public static async getPlantData() {
        if (!PlantService.plantData.length) {
            PlantService.plantData = await PlantService.plantCollection.findAll();
        }
        return PlantService.plantData;
    }

    private static async resetPlantData() {
        PlantService.plantData = [];
        return await PlantService.getPlantData();
    }

    public static async updatePlant(updatedObj: PlantModel): Promise<any> {
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
        await PlantService.plantCollection.updateOneById(updatedObj._id, updateVal);
        return await PlantService.resetPlantData();
    }

    public static async getPlantInfo(plantId: string) {
        return await PlantService.plantCollection.findOneById(plantId);
    }

    public static async insertOnePlant(newPlant: PlantModel) {
        await PlantService.plantCollection.insertOne(newPlant);
        return await PlantService.resetPlantData();
    }

    public static async deleteOnePlantById(plantId: string) {
        await PlantService.plantCollection.deleteOneById(plantId);
        return await PlantService.resetPlantData();
    }
}