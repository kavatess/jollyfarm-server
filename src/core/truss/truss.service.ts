import { mongoDB_Collection } from "../../configs/collection-access.mongodb";
import { Plant } from "../plant/plant.model";
import { EmptyTruss, Status, PlantingTruss, TrussModel, Truss, MileStoneModel } from "./truss.model";
import { createTrussRequest, newStatusRequest, revertTrussRequest, updateMaxHoleRequest } from "./truss.request.model";
import plantController from "../plant/plant.controller";
import { ObjectId } from "bson";

export class trussService extends mongoDB_Collection {
    private static trussExtendedData: Truss[] = [];

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
            ]
            console.log(await collection.aggregate(aggregateMethod).toArray());
            return await collection.aggregate(aggregateMethod).toArray();
        } catch (err) {
            console.log(err);
            return [err];
        }
    }

    protected async initializeTrussData() {
        if (!trussService.trussExtendedData.length) {
            const trussData: Truss[] = await this.getTrussDataFromDB();
            trussService.trussExtendedData = trussData.map(truss => {
                if (truss.timeline[truss.timeline.length - 1].plantId) {
                    const trussEl = new PlantingTruss(truss);
                    this.autoUpdateTrussStatus(trussEl);
                    return trussEl;
                }
                return new EmptyTruss(truss);
            });
        }
        return trussService.trussExtendedData;
    }

    private async resetTrussData() {
        trussService.trussExtendedData = [];
        return await this.initializeTrussData();
    }

    private async autoUpdateTrussStatus(trussEl: PlantingTruss) {
        if (trussEl.realPlantGrowth > trussEl.latestRealPlantGrowth) {
            const today = new Date().toString();
            const updateReq = new newStatusRequest(trussEl._id, trussEl.timeline.length - 1, today, trussEl.latestRealPlantNumber, trussEl.realPlantGrowth);
            return await this.updateTrussStatus(updateReq);
        }
    }

    protected async getTrussDataForClient(block: string = "all") {
        await this.initializeTrussData();
        return block == "all" ? trussService.trussExtendedData.map(truss => truss.dataForClient) : trussService.trussExtendedData.filter(truss => truss.block == block).map(truss => truss.dataForClient);
    }

    protected async getTimeLineData(trussId: string = "") {
        await this.initializeTrussData();
        return trussId ? trussService.trussExtendedData.find(truss => truss._id == trussId)!.timelineData : trussService.trussExtendedData.map(truss => truss.timelineData);
    }

    protected async updateTrussStatus(newStatusRequest: newStatusRequest) {
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
        const truss: Truss = trussService.trussExtendedData.find(truss => truss._id = newTrussReq._id)!;
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
        const updateVal = { $set: { maxHole: newMaxHole.maxHole } };
        await this.updateOne(newMaxHole._id, updateVal);
        return await this.resetTrussData();
    }

    protected async revertTrussStatus(revertReq: revertTrussRequest) {
        const truss: Truss = trussService.trussExtendedData.find(truss => truss._id == revertReq._id)!;
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
}