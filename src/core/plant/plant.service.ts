import { mongoDB_Collection } from "../../configs/collection-access.mongodb";
import { mongoDatabase } from "../../configs/connect.mongodb";
import { Plant } from "./plant.model";

export class plantService extends mongoDB_Collection {
    private plantData: Plant[] = [];

    protected constructor() {
        super(mongoDatabase.getDB(), "plant")
    }

    protected async getPlantData() {
        if (!this.plantData.length) {
            this.plantData = await this.getDataFromCollection();
        }
        return this.plantData;
    }

    protected async resetPlantData() {
        this.plantData = [];
        await this.getPlantData();
    }

    protected async updatePlant(updatedObj: Plant): Promise<any> {
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
        return await this.updateOne(updatedObj._id, updateVal);
    }
}