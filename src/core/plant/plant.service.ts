import { MongoDB_Collection } from "../../configs/collection-access.mongodb";
import { MAIN_DATABASE, PLANT_COLLECTION } from "../../server-constants";
import { Plant, PlantModel } from "./plant.model";

class PlantService {
    plantCollection: MongoDB_Collection = new MongoDB_Collection(MAIN_DATABASE, PLANT_COLLECTION);
    private static plantData: Plant[] = [];

    constructor() {
        this.getPlantData();
    }

    async getPlantData() {
        if (!PlantService.plantData.length) {
            PlantService.plantData = await this.plantCollection.findAll();
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
        await this.plantCollection.updateOne(updatedObj._id, updateVal);
        return await this.resetPlantData();
    }

    async getPlantInfo(plantId: string) {
        return await this.plantCollection.findOneById(plantId);
    }

    async insertOnePlant(newPlant: PlantModel) {
        await this.plantCollection.insertOne(newPlant);
        return await this.resetPlantData();
    }

    async deleteOnePlantById(plantId: string) {
        await this.plantCollection.deleteOneById(plantId);
        return await this.resetPlantData();
    }
}

export default new PlantService();