import { MongoDB_Collection } from "../../configs/mongodb-collection.config";
import { COLLECTION, DATABASE } from "../../server-constants";
import { PlantModel } from "./plant.model";

export class PlantService {
    private static plantCollection: MongoDB_Collection = new MongoDB_Collection(DATABASE.FARM, COLLECTION.PLANT);

    public static async getPlantData() {
        return await this.plantCollection.findAll();
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
        return await this.plantCollection.updateOneById(updatedObj._id, updateVal);
    }

    public static async getPlantInfo(plantId: string) {
        return await this.plantCollection.findOneById(plantId);
    }

    public static async insertOnePlant(newPlant: PlantModel) {
        return await this.plantCollection.insertOne(newPlant);
    }

    public static async deleteOnePlantById(plantId: string) {
        return await this.plantCollection.deleteOneById(plantId);
    }
}