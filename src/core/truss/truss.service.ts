import { MongoDB_Collection } from "../../configs/collection-access.mongodb";
import { EmptyTruss, Status, PlantingTruss, Truss, Statistic } from "./truss.model";
import { CreateTrussRequest, NewStatusRequest, RevertTrussRequest, UpdateMaxHoleRequest } from "./truss.request.model";
import { MAIN_DATABASE, TRUSS_COLLECTION } from "../../server-constants";
import { HistoryModel } from "../history/history.model";
import HistoryService from '../history/history.service';
import SeedService from '../seed/seed.service';
import { SeedModel } from "../seed/seed.model";

const TrussCollection = new MongoDB_Collection(MAIN_DATABASE, TRUSS_COLLECTION);

class TrussService {
    private static trussData: Truss[] = [];

    constructor() {
        TrussService.initializeTrussData();
    }

    private static async initializeTrussData() {
        // get truss data when empty
        if (!TrussService.trussData.length) {
            const trussData: Truss[] = await TrussCollection.joinWithPlantData();
            // create 2 oop truss objs: empty-truss and planting-truss
            TrussService.trussData = trussData.map(truss => {
                if (truss.plantId) {
                    const trussEl = new PlantingTruss(truss);
                    return trussEl;
                }
                return new EmptyTruss(truss);
            });
        }
        return TrussService.trussData;
    }

    private static async resetTrussData() {
        TrussService.trussData = [];
        return await TrussService.initializeTrussData();
    }

    async getTrussArrByBlock(block: string = "all"): Promise<Truss[]> {
        await TrussService.initializeTrussData();
        const trussData = TrussService.trussData.map(truss => truss.getBasicTrussInfo());
        if (block == "all") {
            return trussData;
        }
        const trussArr = trussData.filter(truss => truss.block == block);
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

    async updateTrussStatus(newStatusRequest: NewStatusRequest) {
        await TrussService.initializeTrussData();
        const updatedTruss: Truss = TrussService.trussData.find(truss => truss._id == newStatusRequest._id)!;
        // Compare valid new plant growth and plant number
        const newPlantGrowthCond = updatedTruss.latestPlantGrowth <= newStatusRequest.plantGrowth;
        const newPlantNumberCond = updatedTruss.latestPlantNumber >= newStatusRequest.plantNumber;
        const exceptCond = updatedTruss.latestPlantGrowth == newStatusRequest.plantGrowth && updatedTruss.latestPlantNumber == newStatusRequest.plantNumber;
        if (newPlantGrowthCond && newPlantNumberCond && !exceptCond) {
            const newStatus: Status = new Status(newStatusRequest.date, newStatusRequest.plantNumber, newStatusRequest.plantGrowth);
            const updateVal = { $push: { realStatus: newStatus } };
            await TrussCollection.updateOne(newStatusRequest._id, updateVal);
            // If update plant number is zero, we also clear the truss
            if (!newStatus.plantNumber) {
                return await this.clearTruss(newStatusRequest._id);
            }
            return await TrussService.resetTrussData();
        }
        console.log("Invalid status request.");
    }

    async clearTruss(clearedTrussId: string) {
        await TrussService.initializeTrussData();
        const clearedTruss: Truss = TrussService.trussData.find(truss => truss._id == clearedTrussId)!;
        if (clearedTruss.plantId) {
            // Insert a new History
            const newHistory = new HistoryModel(clearedTruss._id, clearedTruss.plantId, clearedTruss.startDate, clearedTruss.realStatus);
            HistoryService.insertOneHistory(newHistory);
            // Reset truss
            const updateVal = {
                $set: {
                    plantId: '',
                    startDate: '',
                    realStatus: []
                }
            };
            await TrussCollection.updateOne(clearedTrussId, updateVal);
            return await TrussService.resetTrussData();
        }
        console.log(`Cannot clear truss with ID: "${clearedTrussId}" because it is now empty.`);
    }

    async createNewTruss(newTrussReq: CreateTrussRequest) {
        await TrussService.initializeTrussData();
        const truss: Truss = TrussService.trussData.find(truss => truss._id = newTrussReq._id)!;
        if (!truss.plantId) {
            const selectedSeed: SeedModel = await SeedService.getSeedInfo(newTrussReq.seedId);
            const firstStatus = new Status(newTrussReq.startDate, selectedSeed.plantNumber, 1);
            if (selectedSeed.plantNumber > truss.maxHole) {
                firstStatus.plantNumber = truss.maxHole;
                SeedService.updateSeedNumber(selectedSeed._id, selectedSeed.plantNumber - truss.maxHole);
            }
            const updateVal = {
                $set: {
                    plantId: newTrussReq.plantId,
                    startDate: newTrussReq.startDate,
                    realStatus: [firstStatus],
                }
            };
            await TrussCollection.updateOne(newTrussReq._id, updateVal);
            return await TrussService.resetTrussData();
        }
        console.log(`Cannot create truss with ID: "${newTrussReq._id}" because it is now being planted.`);
    }

    async updateTrussMaxHole(newMaxHole: UpdateMaxHoleRequest) {
        await TrussService.initializeTrussData();
        const updateVal = { $set: { maxHole: newMaxHole.maxHole } };
        await TrussCollection.updateOne(newMaxHole._id, updateVal);
        return await TrussService.resetTrussData();
    }

    async revertTrussStatus(revertReq: RevertTrussRequest) {
        await TrussService.initializeTrussData();
        const truss = TrussService.trussData.find(truss => truss._id == revertReq._id);
        if (!truss) {
            console.log(`There is no ID: "${revertReq._id}" to revert.`);
            return "Client Error";
        }

        if (revertReq.statusIndex > 0) {
            const updateVal = {
                $push: {
                    realStatus: {
                        $each: [],
                        $slice: revertReq.statusIndex + 1
                    }
                }
            };
            await TrussCollection.updateOne(revertReq._id, updateVal);
            return await TrussService.resetTrussData();
        }

        console.log("Invalid index status to revert.");
        return "Client Error";
    }

    async getStatistics() {
        await TrussService.initializeTrussData();
        var statistics: Statistic[] = [];
        TrussService.trussData.forEach((truss) => {
            if (truss.plantId) {
                const statIndex = statistics.findIndex(stat => stat.plantName == truss.plantName);
                if (statIndex >= 0) {
                    statistics[statIndex].plantNumber += truss.latestPlantNumber;
                } else {
                    const stat: Statistic = {
                        plantName: truss.plantName,
                        plantColor: truss.plantColor,
                        plantNumber: truss.latestPlantNumber
                    }
                    statistics.push(stat);
                }
            }
        });
        return statistics;
    }
}

export default new TrussService();