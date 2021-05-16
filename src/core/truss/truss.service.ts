import { MongoDB_Collection } from "../../configs/collection-access.mongodb";
import { Status, Truss, Statistics, TrussModel } from "./truss.model";
import { CreateTrussRequest, NewStatusRequest, RevertTrussRequest, UpdateMaxHoleRequest } from "./truss.request.model";
import { HISTORY_COLLECTION, MAIN_DATABASE, PLANT_LOOKUP_AGGREGATION, TRUSS_COLLECTION } from "../../server-constants";
import HistoryService from '../history/history.service';
import SeedService from '../seed/seed.service';
import { SeedModel } from "../seed/seed.model";
import { ObjectId } from "bson";
import { BasicTrussFactory } from "./models/basic-truss.factory.model";
import { BasicHistoryModel } from "../history/history.model";

const TrussCollection = new MongoDB_Collection(MAIN_DATABASE, TRUSS_COLLECTION);
const HistoryCollection = new MongoDB_Collection(MAIN_DATABASE, HISTORY_COLLECTION);

class TrussService {
    private static trussData: TrussModel[] = [];

    constructor() {
        TrussService.trussDataInIt();
    }

    private static async trussDataInIt(): Promise<void> {
        // get truss data when empty
        if (!TrussService.trussData.length) {
            this.trussData = await TrussCollection.aggregate(PLANT_LOOKUP_AGGREGATION);
        }
    }

    private static async resetTrussData(): Promise<void> {
        TrussService.trussData = [];
        await TrussService.trussDataInIt();
    }

    private createTrussById(trussId: string): Truss {
        const truss = TrussService.trussData.find(({ _id }) => _id == trussId);
        if (truss) {
            return new BasicTrussFactory().createTruss(truss);
        }
        throw new Error(`Truss with id: '${trussId}' does not exist!`);
    }

    private createTrussArr(trussData: TrussModel[]): Truss[] {
        return trussData.map(truss => {
            return new BasicTrussFactory().createTruss(truss);
        });
    }

    private sortTrussData(block: string, trussData: Truss[]): any[] {
        if (block == "BS") {
            return this.sortDataInBlockBS(trussData);
        }
        if (block == "C") {
            return this.sortDataInBlockC(trussData);
        }
        if (block == "CT") {
            return this.sortDataInBlockCT(trussData);
        }
        if (block == "D") {
            return this.sortDataInBlockD(trussData);
        }
        return this.sortDataInBlockA_B_BN(trussData);
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

    async getTrussDataByBlock(block: string = "all"): Promise<Truss[]> {
        await TrussService.trussDataInIt();
        if (block == "all") {
            return this.createTrussArr(TrussService.trussData).map(truss => truss.getBasicTrussInfo());
        }
        const trussArr = TrussService.trussData.filter(truss => truss.block == block).map(truss => new BasicTrussFactory().createTruss(truss).getBasicTrussInfo());
        return this.sortTrussData(block, trussArr).map(truss => truss.getBasicTrussInfo());
    }

    async getRawTrussDataByBlock(block: string): Promise<TrussModel[]> {
        const aggregateMethod = [{ $match: { block: block } }, ...PLANT_LOOKUP_AGGREGATION];
        return await TrussCollection.aggregate(aggregateMethod);
    }

    async updateTrussStatus({ _id, date, plantNumber, plantGrowth }: NewStatusRequest) {
        try {
            await TrussService.trussDataInIt();
            const updatedTruss: Truss = this.createTrussById(_id);
            const newPlantGrowthCond = updatedTruss.latestPlantGrowth <= plantGrowth;
            const newPlantNumberCond = updatedTruss.latestPlantNumber >= plantNumber;
            const exceptCond = updatedTruss.latestPlantGrowth == plantGrowth && updatedTruss.latestPlantNumber == plantNumber;
            if (newPlantGrowthCond && newPlantNumberCond && !exceptCond) {
                const newStatus: Status = new Status(date, plantNumber, plantGrowth);
                const updateVal = { $push: { realStatus: newStatus } };
                await TrussCollection.updateOne(_id, updateVal);
                // If update plant number is zero, we also clear the truss
                if (!newStatus.plantNumber) {
                    return await this.clearTruss(_id);
                }
                return await TrussService.resetTrussData();
            }
            throw new Error("Invalid update status request!");
        } catch (err) {
            console.log(err);
            return new Error(err);
        }
    }

    async clearTruss(clearedTrussId: string) {
        try {
            await TrussService.trussDataInIt();
            const clearedTruss: Truss = this.createTrussById(clearedTrussId);
            if (clearedTruss.plantId) {
                // Insert a new History
                const newHistory = new BasicHistoryModel(clearedTrussId, clearedTruss.plantId, clearedTruss.startDate, clearedTruss.realStatus);
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
            throw new Error(`Cannot clear truss with ID: "${clearedTrussId}" because it is now empty.`);
        } catch (err) {
            console.log(err);
            return new Error(err);
        }
    }

    async createNewTruss({ _id, startDate, seedId }: CreateTrussRequest) {
        try {
            await TrussService.trussDataInIt();
            const createdTruss: Truss = this.createTrussById(_id);
            if (!createdTruss.plantId) {
                const selectedSeed: SeedModel = await SeedService.getSeedInfo(seedId);
                const firstStatus = new Status(startDate, selectedSeed.plantNumber, 1);
                if (selectedSeed.plantNumber > createdTruss.maxHole) {
                    firstStatus.plantNumber = createdTruss.maxHole;
                    SeedService.updateSeedNumber(selectedSeed._id, Number(selectedSeed.plantNumber - createdTruss.maxHole));
                } else {
                    SeedService.deleteOneSeedById(selectedSeed._id);
                }
                const updateVal = {
                    $set: {
                        plantId: selectedSeed.plantId,
                        startDate: startDate,
                        realStatus: [firstStatus],
                    }
                };
                await TrussCollection.updateOne(_id, updateVal);
                return await TrussService.resetTrussData();
            }
            throw new Error(`Cannot create truss with ID: "${_id}" because it is now being planted.`);
        } catch (err) {
            console.log(err);
            return new Error(err);
        }
    }

    async updateTrussMaxHole(newMaxHole: UpdateMaxHoleRequest) {
        try {
            await TrussService.trussDataInIt();
            const updateVal = { $set: { maxHole: newMaxHole.maxHole } };
            await TrussCollection.updateOne(newMaxHole._id, updateVal);
            return await TrussService.resetTrussData();
        } catch (err) {
            console.log(err)
            return new Error(err);
        }
    }

    async revertTrussStatus({ _id, statusIndex }: RevertTrussRequest) {
        try {
            await TrussService.trussDataInIt();
            const revertedTruss: Truss = this.createTrussById(_id);
            if (statusIndex >= 0 && revertedTruss.realStatus.length > 1) {
                const updateVal = {
                    $push: {
                        realStatus: {
                            $each: [],
                            $slice: statusIndex + 1
                        }
                    }
                };
                await TrussCollection.updateOne(_id, updateVal);
                return await TrussService.resetTrussData();
            }
            throw new Error("Invalid index status to revert.");
        } catch (err) {
            console.log(err)
            return new Error(err);
        }
    }

    async getStatistics({ block, plantGrowth, plantId }: any) {
        try {
            await TrussService.trussDataInIt();
            const trussArr = TrussService.trussData.filter(truss => {
                let filterCond = true;
                if (block) {
                    filterCond &&= (truss.block[0] == block);
                }
                if (Number(plantGrowth) > 0) {
                    const latestPlantGrowth = truss.realStatus[truss.realStatus.length - 1].plantGrowth;
                    filterCond &&= (latestPlantGrowth == plantGrowth);
                }
                if (plantId) {
                    filterCond &&= (truss.plantId == plantId);
                }
                return filterCond;
            });
            const resultStats = this.getDiscreteStats(this.createTrussArr(trussArr));
            return resultStats;
        } catch (err) {
            console.log(err)
            return new Error(err);
        }
    }

    private getDiscreteStats(trussArrByBlock: Truss[]): Statistics[] {
        var statistics: Statistics[] = [];
        trussArrByBlock.forEach(({ plantId, plantType, latestPlantNumber }) => {
            if (plantId) {
                const statIndex = statistics.findIndex(stat => stat.plantName == plantType.getPlantName());
                if (statIndex > -1) {
                    statistics[statIndex].plantNumber += latestPlantNumber;
                }
                else {
                    const stat: Statistics = {
                        plantName: plantType.getPlantName(),
                        plantColor: plantType.getPlantColor(),
                        plantNumber: latestPlantNumber
                    }
                    statistics.push(stat);
                }
            }
        });
        return statistics;
    }

    async getTrussHistory(trussId: string) {
        const aggregateMethod = [{ $match: { trussId: new ObjectId(trussId) } }, ...PLANT_LOOKUP_AGGREGATION]
        return await HistoryCollection.aggregate(aggregateMethod);
    }
}

export default new TrussService();