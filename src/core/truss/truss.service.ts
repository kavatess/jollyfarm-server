import { mongoDB_Collection } from "../../configs/collection-access.mongodb";
import { mongoDatabase } from "../../configs/connect.mongodb";
import { Truss } from "./truss.model";

export class trussService extends mongoDB_Collection {
    constructor() {
        super(mongoDatabase.getDB(), "truss-data")
    }
    async updateTrussStatus(newStatus: any) {
        const updateVal = { $set: { statusReal: newStatus.statusReal } };
        return await this.updateOne(newStatus._id, updateVal);
    }
    async clearTruss(emptyTruss: Truss) {
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
    async createNewTruss(newTruss: Truss) {
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
    async updateTrussMaxHole(newMaxHole: any) {
        const updateVal = { $set: { maxHole: newMaxHole.maxHole } };
        return await this.updateOne(newMaxHole._id, updateVal);
    }
}