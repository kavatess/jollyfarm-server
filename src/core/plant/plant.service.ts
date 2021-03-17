import { mongoDB_Collection } from "../../configs/collection-access.mongodb";
import { Plant } from "./plant.model";

export class plantService extends mongoDB_Collection {
    private static plantData: Plant[] = [];

    protected constructor() {
        super("farm-database", "plant")
    }

    protected async getPlantData() {
        if (!plantService.plantData.length) {
            plantService.plantData = await this.getDocumentWithCond();
        }
        return plantService.plantData;
    }

    protected async resetPlantData() {
        plantService.plantData = [];
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

    protected async getPlantInfo(plantId: number) {
        const findCond = { plantId: plantId };
        return await this.findOneDocument(findCond);
    }
}