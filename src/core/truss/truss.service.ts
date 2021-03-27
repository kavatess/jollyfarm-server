import { mongoDB_Collection } from "../../configs/collection-access.mongodb";
import { Plant } from "../plant/plant.model";
import { EmptyTruss, Status, PlantingTruss, TrussModel, Truss, MileStoneModel, Statistic } from "./truss.model";
import { createTrussRequest, newStatusRequest, revertTrussRequest, updateMaxHoleRequest } from "./truss.request.model";
import plantController from "../plant/plant.controller";
import { ObjectId } from "bson";

export class TrussService extends mongoDB_Collection {
    private static trussData: Truss[] = [];
    private static statistics: Statistic[] = [];

    protected constructor() {
        super("farm-database", "truss-final");
        this.resetTrussData();
    }

    private async getTrussDataFromDB() {
        try {
            const collection = await this.getCollection();
            const aggregateMethod = [
                {
                    $unwind: "$timeline"
                },
                {
                    $lookup: {
                        from: "plant",
                        localField: "timeline.plantId",
                        foreignField: "_id",
                        as: "timeline.plantType"
                    }
                },
                {
                    $group: {
                        _id: "$_id",
                        root: { $mergeObjects: "$$ROOT" },
                        timeline: { $push: { $mergeObjects: [{ $arrayElemAt: ["$timeline.plantType", 0] }, "$timeline"] } },
                    }
                },
                {
                    $replaceRoot: { newRoot: { $mergeObjects: ["$root", "$$ROOT"] } }
                },
                {
                    $project: { root: 0 }
                }
            ];
            return await collection.aggregate(aggregateMethod).toArray();
        } catch (err) {
            console.log(err);
            return [];
        }
    }

    protected async initializeTrussData() {
        // get truss data when empty
        if (!TrussService.trussData.length) {
            const trussData: Truss[] = await this.getTrussDataFromDB();
            // create 2 oop truss objs: empty-truss and planting-truss
            TrussService.trussData = trussData.map(truss => {
                if (truss.timeline[truss.timeline.length - 1].plantId) {
                    const trussEl = new PlantingTruss(truss);
                    this.autoUpdateTrussStatus(trussEl);
                    return trussEl;
                }
                return new EmptyTruss(truss);
            });
        }
        return TrussService.trussData;
    }

    private async resetTrussData() {
        TrussService.trussData = [];
        TrussService.statistics = [];
        await this.initializeTrussData();
        await this.getStatistics();
    }

    private async autoUpdateTrussStatus(trussEl: PlantingTruss) {
        // if plant grow up on time
        if (trussEl.realPlantGrowth > trussEl.latestRealPlantGrowth) {
            const today = new Date().toString();
            const updateReq = new newStatusRequest(trussEl._id, trussEl.timeline.length - 1, today, trussEl.latestRealPlantNumber, trussEl.realPlantGrowth);
            return await this.updateTrussStatus(updateReq);
        }
    }

    protected async getTrussDataForClient(block: string = "all") {
        await this.initializeTrussData();
        return block == "all" ? TrussService.trussData.map(truss => truss.dataForClient) : TrussService.trussData.filter(truss => truss.block == block).map(truss => truss.dataForClient);
    }

    protected async getTimeLineData(trussId: string = "") {
        await this.initializeTrussData();
        return trussId ? TrussService.trussData.find(truss => truss._id == trussId)!.timelineData : TrussService.trussData.map(truss => truss.timelineData);
    }

    protected async updateTrussStatus(newStatusRequest: newStatusRequest) {
        await this.initializeTrussData();
        const newStatus: Status = new Status(newStatusRequest.date, newStatusRequest.plantNumber, newStatusRequest.plantGrowth);
        const findCond = { _id: new ObjectId(newStatusRequest._id), "timeline._index": newStatusRequest._index };
        const updateVal = { $push: { "timeline.$.statusReal": newStatus } };
        await this.updateOneWithHardCond(findCond, updateVal);
        if (!newStatus.plantNumber) {
            return await this.clearTruss(newStatusRequest._id);
        }
        return await this.resetTrussData();
    }

    protected async clearTruss(clearedTrussId: string) {
        await this.initializeTrussData();
        const truss: TrussModel = await this.getDocumentById(clearedTrussId);
        if (truss.timeline[truss.timeline.length - 1].plantId) {
            const newMileStone = new MileStoneModel(truss.timeline.length);
            truss.timeline.push(newMileStone);
            const updateVal = { $set: { timeline: truss.timeline } };
            await this.updateOne(clearedTrussId, updateVal);
            return await this.resetTrussData();
        }
        return "OK";
    }

    protected async createNewTruss(newTrussReq: createTrussRequest) {
        await this.initializeTrussData();
        const truss: Truss = TrussService.trussData.find(truss => truss._id = newTrussReq._id)!;
        if (!truss.timeline[truss.timeline.length - 1].plantId) {
            const plantType: Plant = await plantController.getPlantType(newTrussReq.plantId);
            truss.initializeStatus(newTrussReq.startDate, newTrussReq.plantNumber, plantType.mediumGrowthTime, plantType.growUpTime);
            const updateVal = {
                $set: {
                    plantId: newTrussReq.plantId,
                    startDate: newTrussReq.startDate,
                    statusReal: truss.recentRealStatusArr,
                    statusPredict: truss.recentPredictStatusArr
                }
            };
            await this.updateOne(newTrussReq._id, updateVal);
            return await this.resetTrussData();
        }
        return "OK";
    }

    protected async updateTrussMaxHole(newMaxHole: updateMaxHoleRequest) {
        await this.initializeTrussData();
        const updateVal = { $set: { maxHole: newMaxHole.maxHole } };
        await this.updateOne(newMaxHole._id, updateVal);
        return await this.resetTrussData();
    }

    protected async revertTrussStatus(revertReq: revertTrussRequest) {
        await this.initializeTrussData();
        const truss: Truss = TrussService.trussData.find(truss => truss._id == revertReq._id)!;
        const findCond = { _id: new ObjectId(revertReq._id), "timeline._index": truss.latestMileStone._index };
        if (revertReq.statusIndex > 0) {
            const updateVal = {
                $push: {
                    "timeline.$.statusReal": {
                        $each: [],
                        $slice: revertReq.statusIndex + 1
                    }
                }
            };
            await this.updateOneWithHardCond(findCond, updateVal);
            return await this.resetTrussData();
        }
        return "OK";
    }

    protected async getStatistics(): Promise<Statistic[]> {
        if (!TrussService.statistics.length) {
            await this.initializeTrussData();
            TrussService.trussData.forEach(truss => {
                const plantName = truss.latestMileStone.plantName;
                if (plantName) {
                    const statIndex = TrussService.statistics.findIndex(stat => stat.plantName == plantName);
                    if (statIndex >= 0) {
                        TrussService.statistics[statIndex].plantNumber += truss.latestRealPlantNumber;
                    } else {
                        const stat: Statistic = {
                            plantName: truss.latestMileStone.plantName,
                            plantColor: truss.latestMileStone.plantColor,
                            plantNumber: truss.latestRealPlantNumber
                        }
                        TrussService.statistics.push(stat);
                    }
                }
            });
        }
        return TrussService.statistics;
    }
}