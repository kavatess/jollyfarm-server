import { mongoDB_Collection } from "../../configs/collection-access.mongodb";
import { mongoDatabase } from "../../configs/connect.mongodb";
import { seedModel } from "./seed.model";

export class seedService extends mongoDB_Collection {
    protected constructor() {
        super(mongoDatabase.getDB(), "seed-nursery-data")
    }
    protected async updateSeedNumber(updatedObj: seedModel): Promise<any> {
        const updateVal = { $set: { plantNumber: updatedObj.plantNumber } }
        return await this.updateOne(updatedObj._id, updateVal);
    }
}