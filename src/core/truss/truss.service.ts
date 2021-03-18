import { mongoDB_Collection } from "../../configs/collection-access.mongodb";
import { Plant } from "../plant/plant.model";
import { createTrussRequest, EmptyTruss, HistoryModel, newStatusRequest, revertTrussRequest, Status, Truss, TrussBasicInfo, TrussDataStruct, TrussModel, TrussModelForClientSide, updateMaxHoleRequest } from "./truss.model";
import plantController from "../plant/plant.controller";

export class trussService extends mongoDB_Collection {
    private trussExtendedData: EmptyTruss[] = [];
    private processedTrussData: (TrussModelForClientSide | TrussBasicInfo)[] = [];
    private trussHistoryArr: any[] = [];
    private recentHistoryArr: any[] = [];

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
        this.trussHistoryArr = [];
        await this.getOldHistoryData();
        this.recentHistoryArr = [];
        await this.getRecentHistoryData();
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
        const truss: TrussModel = await this.getDocumentById(clearedTrussId);
        if (truss.plantId) {
            const newHistory: HistoryModel = new HistoryModel(truss.plantId, truss.startDate, truss.statusReal, truss.statusPredict);
            truss.history.push(newHistory);
            const updateVal = {
                $set: {
                    plantId: 0,
                    startDate: "",
                    statusReal: [],
                    statusPredict: [],
                    history: truss.history
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

    protected async updateTrussMaxHole(newMaxHole: updateMaxHoleRequest) {
        const updateVal = { $set: { maxHole: newMaxHole.maxHole } };
        await this.updateOne(newMaxHole._id, updateVal);
        return await this.resetTrussData();
    }

    protected async revertTrussStatus(revertReq: revertTrussRequest) {
        if (revertReq.statusIndex > 0) {
            const updateVal = {
                $push: {
                    statusReal: {
                        $each: [],
                        $slice: revertReq.statusIndex + 1
                    }
                }
            };
            await this.updateOne(revertReq._id, updateVal);
            return await this.resetTrussData();
        }
    }

    protected async getOldHistoryData(trussId: string = "") {
        if (!this.trussHistoryArr.length) {
            this.trussHistoryArr = await this.getOlderHistoryFromDB();
        }
        return trussId ? this.trussHistoryArr.find(his => his._id == trussId) : "";
    }

    private async getOlderHistoryFromDB() {
        try {
            const collection = await this.getCollection();
            const aggregateMethod = [
                {
                    $unwind: "$history"
                },
                {
                    $lookup: {
                        from: "plant",
                        localField: "history.plantId",
                        foreignField: "plantId",
                        as: "history.plantType"
                    }
                },
                {
                    $group: {
                        _id: "$_id",
                        history: { $push: { $mergeObjects: [{ $arrayElemAt: ["$history.plantType", 0] }, "$history"] } },
                        root: { $mergeObjects: "$$ROOT" },
                    }
                },
                {
                    $replaceRoot: { newRoot: { $mergeObjects: ["$root", "$$ROOT"] } }
                },
                {
                    $project: { root: 0, 'history.plantType': 0, plantId: 0, startDate: 0, statusReal: 0, statusPredict: 0, 'history._id': 0, 'history.growUpTime': 0, 'history.mediumGrowthTime': 0, 'history.seedUpTime': 0, 'history.worm': 0, 'history.numberPerKg': 0, 'history.alivePercent': 0, 'history.wormMonth': 0 }
                }
            ]
            return await collection.aggregate(aggregateMethod).toArray();
        } catch (err) {
            console.log(err);
            return [];
        }
    }

    protected async getRecentHistoryData(trussId: string = "") {
        if (!this.recentHistoryArr.length) {
            this.recentHistoryArr = await this.getRecentHistoryFromDB();
        }
        return trussId ? this.recentHistoryArr.find(recentHis => recentHis._id == trussId) : "";
    }

    private async getRecentHistoryFromDB() {
        try {
            const collection = await this.getCollection();
            const aggregateMethod = [
                {
                    $lookup: {
                        from: "plant",
                        localField: "plantId",
                        foreignField: "plantId",
                        as: "plantType"
                    }
                },
                {
                    $replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ["$plantType", 0] }, "$$ROOT"] } }
                },
                {
                    $project: { plantType: 0, statusPredict: 0, history: 0, growUpTime: 0, mediumGrowthTime: 0, seedUpTime: 0, worm: 0, numberPerKg: 0, alivePercent: 0, wormMonth: 0 }
                }
            ]
            return await collection.aggregate(aggregateMethod).toArray();
        } catch (err) {
            console.log(err);
            return [];
        }
    }
}