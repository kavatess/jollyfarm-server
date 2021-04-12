import { MongoDB_Collection } from "../../configs/collection-access.mongodb";
import { Plant } from "../plant/plant.model";
import { EmptyTruss, Status, PlantingTruss, TrussModel, Truss, MileStoneModel, Statistic } from "./truss.model";
import { createTrussRequest, newStatusRequest, revertTrussRequest, updateMaxHoleRequest } from "./truss.request.model";
import { ObjectId } from "bson";
import { MAIN_DATABASE, TRUSS_COLLECTION } from "../../server-constants";
import { getPlantType } from "../plant/plant.routes";

const trussCollection = new MongoDB_Collection(MAIN_DATABASE, TRUSS_COLLECTION);

class TrussService {
    private static trussData: Truss[] = [];

    constructor() {
        this.resetTrussData();
    }

    private async getTrussDataFromDB() {
        try {
            const collection = await trussCollection.getCollection();
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

    private async initializeTrussData() {
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
        await this.initializeTrussData();
    }

    private async autoUpdateTrussStatus(trussEl: PlantingTruss) {
        // if plant grow up on time
        if (trussEl.realPlantGrowth > trussEl.latestRealPlantGrowth) {
            const today = new Date().toString();
            const updateReq = new newStatusRequest(trussEl._id, today, trussEl.latestRealPlantNumber, trussEl.realPlantGrowth);
            return await this.updateTrussStatus(updateReq);
        }
    }

    async getTrussArrByBlock(block: string = "all"): Promise<Truss[]> {
        await this.initializeTrussData();
        if (block == "all") {
            return TrussService.trussData.map(truss => truss.dataForClient);
        }
        const trussArr = TrussService.trussData.filter(truss => truss.block == block).map(truss => truss.dataForClient);
        if (block == "BS") {
            return this.sortDataInBlockBS(trussArr);
        }
        if (block == "C") {
            return this.sortDataInBlockC(trussArr);
        }
        if (block == "CT") {
            return this.sortDataInBlockCT(trussArr);
        }
        if (block == "D") {
            return this.sortDataInBlockD(trussArr);
        }
        return this.sortDataInBlockA_B_BN(trussArr);
    }

    private sortDataInBlockA_B_BN(trussArr: Truss[]): Truss[] {
        return trussArr.sort((a, b) => b.index - a.index);
    }

    private sortDataInBlockBS(trussArr: any[]): Truss[] {
        trussArr.sort((a, b) => b.index - a.index);
        trussArr.splice(1, 0, null, null);
        return trussArr;
    }

    private sortDataInBlockC(trussArr: Truss[]): Truss[] {
        trussArr.sort((a, b) => a.index - b.index);
        for (var index = 0; index < trussArr.length; index++) {
            if (index < 4) {
                const temp1: Truss = trussArr[index];
                trussArr[index] = trussArr[12 + index];
                trussArr[12 + index] = temp1;
            }
            if (index > 3 && index < 8) {
                const temp2: Truss = trussArr[index];
                trussArr[index] = trussArr[4 + index];
                trussArr[4 + index] = temp2;
            }
        }
        return trussArr;
    }

    private sortDataInBlockCT(trussArr: Truss[]): Truss[] {
        trussArr.sort((a, b) => a.index - b.index);
        for (var index = 0; index < 4; index++) {
            if (index < 4) {
                const temp1: Truss = trussArr[index];
                trussArr[index] = trussArr[8 + index];
                trussArr[8 + index] = temp1;
            }
        }
        return trussArr;
    }

    private sortDataInBlockD(trussArr: any[]): Truss[] {
        trussArr.sort((a, b) => a.index - b.index);
        trussArr.splice(1, 0, null, null);
        return trussArr;
    }

    async getTimeLineData(trussId: string = "") {
        await this.initializeTrussData();
        return trussId ? TrussService.trussData.find(truss => truss._id == trussId)!.timelineData : TrussService.trussData.map(truss => truss.timelineData);
    }

    async updateTrussStatus(newStatusRequest: newStatusRequest) {
        await this.initializeTrussData();
        const updatedTruss: Truss = TrussService.trussData.find(truss => truss._id == newStatusRequest._id)!;
        const newPlantGrowthCond = updatedTruss.latestRealPlantGrowth <= newStatusRequest.plantGrowth;
        const newPlantNumberCond = updatedTruss.latestRealPlantNumber >= newStatusRequest.plantNumber;
        const exceptCond = updatedTruss.latestRealPlantGrowth == newStatusRequest.plantGrowth && updatedTruss.latestRealPlantNumber == newStatusRequest.plantNumber;
        if (newPlantGrowthCond && newPlantNumberCond && !exceptCond) {
            const newStatus: Status = new Status(newStatusRequest.date, newStatusRequest.plantNumber, newStatusRequest.plantGrowth);
            const findCond = { _id: new ObjectId(newStatusRequest._id), "timeline._index": updatedTruss.latestMileStone._index };
            const updateVal = { $push: { "timeline.$.statusReal": newStatus } };
            await trussCollection.updateOneWithHardCond(findCond, updateVal);
            if (!newStatus.plantNumber) {
                return await this.clearTruss(newStatusRequest._id);
            }
            return await this.resetTrussData();
        }
        console.log("Invalid status request.");
    }

    async clearTruss(clearedTrussId: string) {
        await this.initializeTrussData();
        const truss: TrussModel = await trussCollection.getDocumentById(clearedTrussId);
        if (truss.timeline[truss.timeline.length - 1].plantId) {
            const newMileStone = new MileStoneModel(truss.timeline.length);
            truss.timeline.push(newMileStone);
            const updateVal = { $set: { timeline: truss.timeline } };
            await trussCollection.updateOne(clearedTrussId, updateVal);
            return await this.resetTrussData();
        }
        console.log(`Cannot clear truss with ID: "${clearedTrussId}" because it is now empty.`);
    }

    async createNewTruss(newTrussReq: createTrussRequest) {
        await this.initializeTrussData();
        const truss: Truss = TrussService.trussData.find(truss => truss._id = newTrussReq._id)!;
        if (!truss.timeline[truss.timeline.length - 1].plantId) {
            const plantType: Plant = await getPlantType(newTrussReq.plantId);
            truss.initializeStatus(newTrussReq.startDate, newTrussReq.plantNumber, plantType.mediumGrowthTime, plantType.growUpTime);
            const updateVal = {
                $set: {
                    plantId: newTrussReq.plantId,
                    startDate: newTrussReq.startDate,
                    statusReal: truss.recentRealStatusArr,
                    statusPredict: truss.recentPredictStatusArr
                }
            };
            await trussCollection.updateOne(newTrussReq._id, updateVal);
            return await this.resetTrussData();
        }
        console.log(`Cannot create truss with ID: "${newTrussReq._id}" because it is now being planted.`);
    }

    async updateTrussMaxHole(newMaxHole: updateMaxHoleRequest) {
        await this.initializeTrussData();
        const updateVal = { $set: { maxHole: newMaxHole.maxHole } };
        await trussCollection.updateOne(newMaxHole._id, updateVal);
        return await this.resetTrussData();
    }

    async revertTrussStatus(revertReq: revertTrussRequest) {
        await this.initializeTrussData();
        const truss = TrussService.trussData.find(truss => truss._id == revertReq._id);
        if (!truss) {
            console.log(`There is no ID: "${revertReq._id}" to revert.`);
            return "Client Error";
        }

        if (revertReq.statusIndex > 0) {
            const findCond = { _id: new ObjectId(revertReq._id), "timeline._index": truss.latestMileStone._index };
            const updateVal = {
                $push: {
                    "timeline.$.statusReal": {
                        $each: [],
                        $slice: revertReq.statusIndex + 1
                    }
                }
            };
            await trussCollection.updateOneWithHardCond(findCond, updateVal);
            return await this.resetTrussData();
        }

        console.log("Invalid index status to revert.");
        return "Client Error";
    }

    async getStatistics() {
        await this.initializeTrussData();
        const statistics: Statistic[] = [];
        TrussService.trussData.forEach(truss => {
            const plantName = truss.latestMileStone.plantName;
            if (plantName) {
                const statIndex = statistics.findIndex(stat => stat.plantName == plantName);
                if (statIndex >= 0) {
                    statistics[statIndex].plantNumber += truss.latestRealPlantNumber;
                } else {
                    const stat: Statistic = {
                        plantName: truss.latestMileStone.plantName,
                        plantColor: truss.latestMileStone.plantColor,
                        plantNumber: truss.latestRealPlantNumber
                    }
                    statistics.push(stat);
                }
            }
        });
        return statistics;
    }
}

export default new TrussService();