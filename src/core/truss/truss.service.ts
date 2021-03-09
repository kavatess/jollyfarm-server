import { mongoDB_Collection } from "../../configs/collection-access.mongodb";
import { mongoDatabase } from "../../configs/connect.mongodb";
import { newMaxHoleRequestModel, newStatusRequestModel, trussModel } from "./truss.model";

export class trussService extends mongoDB_Collection {
    protected constructor() {
        super(mongoDatabase.getDB(), "truss-data")
    }
    protected async updateTrussStatus(newStatus: newStatusRequestModel) {
        const updateVal = { $set: { statusReal: newStatus.statusReal } };
        return await this.updateOne(newStatus._id, updateVal);
    }
    protected async clearTruss(emptyTruss: trussModel) {
        const updateVal = {
            $set: {
                plantId: 0,
                startDate: '',
                statusReal: [],
                statusPredict: [],
                history: emptyTruss.history
            }
        }
        return await this.updateOne(emptyTruss._id, updateVal);
    }
    protected async createNewTruss(newTruss: trussModel) {
        const updateVal = {
            $set: {
                plantId: newTruss.plantId,
                startDate: newTruss.startDate,
                statusReal: newTruss.statusReal,
                statusPredict: newTruss.statusPredict
            }
        }
        return await this.updateOne(newTruss._id, updateVal);
    }
    protected async updateTrussMaxHole(newMaxHole: newMaxHoleRequestModel) {
        const updateVal = { $set: { maxHole: newMaxHole.maxHole } };
        return await this.updateOne(newMaxHole._id, updateVal);
    }
}

