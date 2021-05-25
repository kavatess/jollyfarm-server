import { MongoDB_Collection } from "../../configs/collection-access.mongodb";
import { COLLECTION, DATABASE } from "../../server-constants";
import { PlantModel } from "./plant.model";

class PlantService {
    private plantCollection: MongoDB_Collection = new MongoDB_Collection(DATABASE.FARM, COLLECTION.PLANT);
    private plantData: PlantModel[] = [];

    public async getPlantData() {
        if (!this.plantData.length) {
            this.plantData = await this.plantCollection.findAll();
        }
        return this.plantData;
    }

    private async resetPlantData() {
        this.plantData = [];
        return await this.getPlantData();
    }

    public async updatePlant(updatedObj: PlantModel): Promise<any> {
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
        await this.plantCollection.updateOneById(updatedObj._id, updateVal);
        return await this.resetPlantData();
    }

    public async getPlantInfo(plantId: string) {
        return await this.plantCollection.findOneById(plantId);
    }

    public async insertOnePlant(newPlant: PlantModel) {
        await this.plantCollection.insertOne(newPlant);
        return await this.resetPlantData();
    }

    public async deleteOnePlantById(plantId: string) {
        await this.plantCollection.deleteOneById(plantId);
        return await this.resetPlantData();
    }
}

export default new PlantService();