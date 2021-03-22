import { mongoDB_Collection } from "../../configs/collection-access.mongodb";
import { Plant } from "../plant/plant.model";
import { EmptyTruss, History, Status, PlantingTruss, TrussBasicInfo, TrussModel, TrussModelForClientSide, Truss } from "./truss.model";
import { createTrussRequest, newStatusRequest, revertTrussRequest, updateMaxHoleRequest } from "./truss.request.model";
import plantController from "../plant/plant.controller";

export class trussService extends mongoDB_Collection {
    private trussExtendedData: Truss[] = [];
    private processedTrussData: (TrussModelForClientSide | TrussBasicInfo)[] = [];
    private trussHistoryArr: any[] = [];

    protected constructor() {
        super("farm-database", "truss");
        this.resetTrussData();
    }

    private async autoUpdateTrussStatus(trussEl: PlantingTruss) {
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
    }

    protected async getTrussData() {
        if (!this.trussExtendedData.length) {
            const trussData: TrussModel[] = await this.joinWithPlantData();
            this.trussExtendedData = trussData.map(truss => {
                if (truss.plantId) {
                    const trussEl = new PlantingTruss(truss);
                    this.autoUpdateTrussStatus(trussEl);
                    return trussEl;
                }
                return new EmptyTruss(truss);
            });
        }
        return this.trussExtendedData;
    }

    protected async getTrussDataForClient(block: string = "all") {
        if (!this.processedTrussData.length) {
            await this.getTrussData();
            this.processedTrussData = this.trussExtendedData.map(truss => {
                return truss.clientTrussData;
            })
        }
        return block === "all" ? this.processedTrussData : this.processedTrussData.filter(truss => truss.block == block);
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
            const newHistory: History = new History(truss);
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
        const truss: Truss = this.trussExtendedData.find(truss => truss._id == newTrussReq._id)!;
        if (!truss.plantId) {
            const plantType: Plant = await plantController.getPlantType(newTrussReq.plantId);
            truss.initializeStatus(newTrussReq.plantNumber, plantType.mediumGrowthTime, plantType.growUpTime);
            const updateVal = {
                $set: {
                    plantId: newTrussReq.plantId,
                    startDate: newTrussReq.startDate,
                    statusReal: truss.statusReal,
                    statusPredict: truss.statusPredict
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
                        foreignField: "_id",
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
        await this.getTrussData();
        return trussId ? this.trussExtendedData.find(recentHis => recentHis._id == trussId)?.recentHistoryData : "";
    }
}