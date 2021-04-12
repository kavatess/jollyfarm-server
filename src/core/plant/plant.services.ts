import { MongoDB_Collection } from "../../configs/collection-access.mongodb";
import { MAIN_DATABASE, PLANT_COLLECTION } from "../../server-constants";
import { Plant, PlantModel } from "./plant.model";

const plantCollection = new MongoDB_Collection(MAIN_DATABASE, PLANT_COLLECTION);

class PlantService {
    private static plantData: Plant[] = [];

    constructor() {
    }

    async getPlantData() {
        if (!PlantService.plantData.length) {
            PlantService.plantData = await plantCollection.getDocumentWithCond();
        }
        return PlantService.plantData;
    }

    private async resetPlantData() {
        PlantService.plantData = [];
        return await this.getPlantData();
    }

    async updatePlant(updatedObj: PlantModel): Promise<any> {
        const updateVal = {
            $set: {
                plantName: updatedObj.plantName,
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
        await plantCollection.updateOne(updatedObj._id, updateVal);
        return await this.resetPlantData();
    }

    async getPlantInfo(plantId: number) {
        const findCond = { plantId: plantId };
        return await plantCollection.findOneById(findCond);
    }

    async insertOnePlant(newPlant: PlantModel) {
        await plantCollection.insertOne(newPlant);
        return await this.resetPlantData();
    }

    async deleteOnePlantById(plantId: string) {
        await plantCollection.deleteOneById(plantId);
        return await this.resetPlantData();
    }
}

export default new PlantService();