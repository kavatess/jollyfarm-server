import { mongoDB_Collection } from "../../configs/collection-access.mongodb";
import { mongoDatabase } from "../../configs/connect.mongodb";
import { Truss, TrussExtended } from "./truss.model";

export class trussService extends mongoDB_Collection {
    private trussExtendedData: TrussExtended[] = [];

    protected constructor() {
        super(mongoDatabase.getDB(), "truss-data")
    }

    protected async getTrussData(): Promise<TrussExtended[]> {
        if (!this.trussExtendedData.length) {
            const trussData = await this.joinWithPlantData();
            this.trussExtendedData = trussData.map(truss => {
                return new TrussExtended(truss);
            });
        }
        return this.trussExtendedData;
    }

    protected async resetTrussData() {
        this.trussExtendedData = [];
        await this.getTrussData();
    }

    protected async exportTrussData() {
        await this.getTrussData();
        this.trussExtendedData.map(truss => {
            truss
        })
    }

    protected async updateTrussStatus(newStatus: any) {
        const updateVal = { $set: { statusReal: newStatus.statusReal } };
        return await this.updateOne(newStatus._id, updateVal);
    }

    protected async clearTruss(emptyTruss: Truss) {
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

    protected async createNewTruss(newTruss: Truss) {
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

    protected async updateTrussMaxHole(newMaxHole: any) {
        const updateVal = { $set: { maxHole: newMaxHole.maxHole } };
        return await this.updateOne(newMaxHole._id, updateVal);
    }
}