import { mongoDB_Collection } from "../../configs/collection-access.mongodb";
import { mongoDatabase } from "../../configs/connect.mongodb";
import { plantModel } from "./plant.model";

export class plantService extends mongoDB_Collection {
    protected constructor() {
        super(mongoDatabase.getDB(), "plant-data")
    }
    protected async updatePlant(updatedObj: plantModel): Promise<any> {
        const updateVal = {
            $set: {
                plantName: updatedObj.plantName,
                plantColor: updatedObj.plantColor,
                suPhatTrien: updatedObj.suPhatTrien,
                SoCay1Kg: updatedObj.SoCay1Kg,
                SauBenh: updatedObj.SauBenh
            }
        }
        return await this.updateOne(updatedObj._id, updateVal);
    }
}