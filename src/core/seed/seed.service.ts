import { mongoDB_Collection } from "../../configs/collection-access.mongodb";
import { mongoDatabase } from "../../configs/connect.mongodb";
import { seedModel } from "./seed.model";

export class seedService extends mongoDB_Collection {
    protected constructor() {
        super(mongoDatabase.getDB(), "seed-nursery-data")
    }
    protected async aggregateSeedAndPlant() {
        const aggregateMethod = [{
            $lookup: {
                from: "plant-data",
                localField: "plantId",    // field in the orders collection
                foreignField: "plantId",  // field in the items collection
                as: "fromItems"
            }
        },
        {
            $replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ["$fromItems", 0] }, "$$ROOT"] } }
        },
        { $project: { fromItems: 0 } }]
        return await this.lookUpMultipleData(aggregateMethod);
    }
    protected async updateSeedNumber(updatedObj: seedModel): Promise<any> {
        const updateVal = { $set: { plantNumber: updatedObj.plantNumber } }
        return await this.updateOne(updatedObj._id, updateVal);
    }
}