import { mongoDB_Collection } from "../../configs/collection-access.mongodb";
import { Plant } from "../plant/plant.model";
import { EmptyTruss, History, Status, PlantingTruss, TrussBasicInfo, TrussModel, TrussModelForClientSide, Truss, HistoryForClient } from "./truss.model";
import { createTrussRequest, newStatusRequest, revertTrussRequest, updateMaxHoleRequest } from "./truss.request.model";
import plantController from "../plant/plant.controller";

export class trussService extends mongoDB_Collection {
    private static trussExtendedData: Truss[] = [];
    private static processedTrussData: (TrussModelForClientSide | TrussBasicInfo)[] = [];
    private static trussHistoryArr: HistoryForClient[];

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
        trussService.trussExtendedData = [];
        trussService.processedTrussData = [];
        trussService.trussHistoryArr = [];
        await this.getTrussData();
        await this.getTrussDataForClient();
        await this.getOldHistoryData();
        console.log(trussService.trussHistoryArr);
    }

    protected async getTrussData() {
        if (!trussService.trussExtendedData.length) {
            const trussData: TrussModel[] = await this.joinWithPlantData();
            trussService.trussExtendedData = trussData.map(truss => {
                if (truss.plantId) {
                    const trussEl = new PlantingTruss(truss);
                    this.autoUpdateTrussStatus(trussEl);
                    return trussEl;
                }
                return new EmptyTruss(truss);
            });
        }
        return trussService.trussExtendedData;
    }

    protected async getTrussDataForClient(block: string = "all") {
        if (!trussService.processedTrussData.length) {
            await this.getTrussData();
            trussService.processedTrussData = trussService.trussExtendedData.map(truss => {
                return truss.clientTrussData;
            })
        }
        return block === "all" ? trussService.processedTrussData : trussService.processedTrussData.filter(truss => truss.block == block);
    }

    protected async getOldHistoryData(trussId: string = "all") {
        if (!trussService.trussHistoryArr.length) {
            await this.getOlderHistoryFromDB();
        }
        return trussId ? trussService.trussHistoryArr.find(his => his._id == trussId) : [];
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
        const truss: Truss = trussService.trussExtendedData.find(truss => truss._id == newTrussReq._id)!;
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
                    }
                },
                {
                    $project: { 'history.plantType': 0, 'history._id': 0, 'history.growUpTime': 0, 'history.mediumGrowthTime': 0, 'history.seedUpTime': 0, 'history.worm': 0, 'history.numberPerKg': 0, 'history.alivePercent': 0, 'history.wormMonth': 0 }
                }
            ]
            trussService.trussHistoryArr = await collection.aggregate(aggregateMethod).toArray();
        } catch (err) {
            console.log(err);
            return [];
        }
    }

    protected async getRecentHistoryData(trussId: string = "") {
        await this.getTrussData();
        return trussId ? trussService.trussExtendedData.find(recentHis => recentHis._id == trussId)?.recentHistoryData : "";
    }
}