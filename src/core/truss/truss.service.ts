import { mongoDB_Collection } from "../../configs/collection-access.mongodb";
import { Plant } from "../plant/plant.model";
import { createTrussRequest, EmptyTruss, newStatusRequest, Status, Truss, TrussBasicInfo, TrussDataStruct, TrussModel, TrussModelForClientSide } from "./truss.model";
import plantController from "../plant/plant.controller";

export class trussService extends mongoDB_Collection {
    private trussExtendedData: EmptyTruss[] = [];
    private processedTrussData: (TrussModelForClientSide | TrussBasicInfo)[] = [];

    protected constructor() {
        super("farm-database", "truss")
    }

    private async autoUpdateTrussStatus(trussEl: Truss) {
        if (trussEl.realPlantGrowth > trussEl.latestPlantGrowth) {
            const today = new Date().toString();
            const updateReq = new newStatusRequest(trussEl._id, today, trussEl.latestPlantNumber, trussEl.realPlantGrowth)
            return await this.updateTrussStatus(updateReq);
        }
    }
    private async resetTrussData() {
        this.trussExtendedData = [];
        await this.getTrussData();
        this.processedTrussData = [];
        await this.getTrussDataForClient();
    }

    protected async getTrussData() {
        if (!this.trussExtendedData.length) {
            const trussData: TrussDataStruct[] = await this.joinWithPlantData();
            this.trussExtendedData = trussData.map(truss => {
                if (truss.plantId) {
                    const trussEl = new Truss(truss);
                    this.autoUpdateTrussStatus(trussEl);
                    return trussEl;
                }
                return new EmptyTruss(truss);
            });
        }
        return this.trussExtendedData;
    }

    protected async getTrussDataForClient() {
        if (!this.processedTrussData.length) {
            await this.getTrussData();
            this.processedTrussData = this.trussExtendedData.map(truss => {
                return truss.clientTrussData;
            })
        }
        return this.processedTrussData;
    }

    protected async updateTrussStatus(newStatusRequest: newStatusRequest) {
        const newStatus: Status = new Status(newStatusRequest.date, newStatusRequest.plantNumber, newStatusRequest.plantGrowth);
        const updateVal = { $push: { statusReal: newStatus } };
        await this.updateOne(newStatusRequest._id, updateVal);
        if (!newStatus.plantNumber) {
            return await this.clearTruss(newStatusRequest._id);
        }
        return await this.resetTrussData();
    }

    protected async clearTruss(clearedTrussId: string) {
        const clearedTruss = this.trussExtendedData.find(truss => truss._id == clearedTrussId);
        if (clearedTruss?.plantId) {
            clearedTruss?.clearTruss();
            const updateVal = {
                $set: {
                    plantId: 0,
                    startDate: "",
                    statusReal: [],
                    statusPredict: [],
                    history: clearedTruss.history
                }
            }
            await this.updateOne(clearedTrussId, updateVal);
            return await this.resetTrussData();
        }
    }

    protected async createNewTruss(newTrussReq: createTrussRequest) {
        const emptyTruss = this.trussExtendedData.find(truss => truss._id == newTrussReq._id);
        if (!(emptyTruss?.plantId)) {
            emptyTruss?.createStatusReal(newTrussReq.plantNumber);
            const plantType: Plant = await plantController.getPlantType(newTrussReq.plantId);
            emptyTruss?.createStatusPredict(plantType.mediumGrowthTime, plantType.growUpTime);
            const updateVal = {
                $set: {
                    plantId: newTrussReq.plantId,
                    startDate: newTrussReq.startDate,
                    statusReal: emptyTruss?.statusReal,
                    statusPredict: emptyTruss?.statusPredict
                }
            }
            await this.updateOne(newTrussReq._id, updateVal);
            return await this.resetTrussData();
        }
    }

    protected async updateTrussMaxHole(newMaxHole: any) {
        const updateVal = { $set: { maxHole: newMaxHole.maxHole } };
        await this.updateOne(newMaxHole._id, updateVal);
        return await this.resetTrussData();
    }

    protected async getOlderHistory() {
        try {
            const collection = await this.getCollection();
            const aggregateMethod = [
                {
                    $unwind: "$history"
                },
                {
                    $lookup: {
                        from: 'plant',
                        localField: 'history.plantId',
                        foreignField: 'plantId',
                        as: 'plantType'
                    }
                },
                {
                    $group: {
                        _id: "$_id",
                        root: { $mergeObjects: "$$ROOT" },
                        history: { $push: { $mergeObjects: [{ $arrayElemAt: ["$plantType", 0] }, "$history"] } }
                    }
                },
                {
                    $replaceRoot: {
                        newRoot: {
                            $mergeObjects: ['$root', '$$ROOT']
                        }
                    }
                },
                {
                    $project: { root: 0, plantType: 0, plantInfo: 0 }
                }
            ]
            return await collection.aggregate(aggregateMethod).toArray();
        } catch (err) {
            console.log(err);
            return [];
        }
    }
}