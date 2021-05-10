import { MongoDB_Collection } from "../../configs/collection-access.mongodb";
import { MAIN_DATABASE, PLANT_COLLECTION } from "../../server-constants";
import { Plant, PlantModel } from "./plant.model";

const PlantCollection = new MongoDB_Collection(MAIN_DATABASE, PLANT_COLLECTION);

class PlantService {
    private static plantData: Plant[] = [];

    constructor() {
        this.getPlantData();
    }

    async getPlantData() {
        if (!PlantService.plantData.length) {
            PlantService.plantData = await PlantCollection.findAllWithCond();
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
        await PlantCollection.updateOne(updatedObj._id, updateVal);
        return await this.resetPlantData();
    }

    async getPlantInfo(plantId: string) {
        return await PlantCollection.findOneById(plantId);
    }

    async insertOnePlant(newPlant: PlantModel) {
        await PlantCollection.insertOne(newPlant);
        return await this.resetPlantData();
    }

    async deleteOnePlantById(plantId: string) {
        await PlantCollection.deleteOneById(plantId);
        return await this.resetPlantData();
    }
}

export default new PlantService();