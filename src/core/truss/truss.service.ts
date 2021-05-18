import { MongoDB_Collection } from "../../configs/collection-access.mongodb";
import { Status, Truss, RawTrussModel, TrussBasicInfo, TrussFactory, Statistic } from "./truss.model";
import { CreateTrussRequest, NewStatusRequest, RevertTrussRequest, UpdateMaxHoleRequest } from "./truss.request.model";
import { HISTORY_COLLECTION, MAIN_DATABASE, PLANT_LOOKUP_AGGREGATION, PLANT_MERGE_LOOKUP_AGGREGATION, TRUSS_COLLECTION } from "../../server-constants";
import HistoryService from '../history/history.service';
import SeedService from '../seed/seed.service';
import { SeedModel } from "../seed/seed.model";
import { ObjectId } from "bson";
import { BasicHistoryModel } from "../history/history.model";

const TrussCollection = new MongoDB_Collection(MAIN_DATABASE, TRUSS_COLLECTION);
const HistoryCollection = new MongoDB_Collection(MAIN_DATABASE, HISTORY_COLLECTION);

class TrussService {
    private static rawTrussData: RawTrussModel[] = [];
    private static trussData: Truss[] = [];

    constructor() {
        TrussService.trussDataInIt();
    }

    private static async trussDataInIt(): Promise<void> {
        // get truss data when empty
        if (!TrussService.trussData.length) {
            TrussService.rawTrussData = await TrussCollection.aggregate(PLANT_LOOKUP_AGGREGATION);
            TrussService.trussData = TrussService.rawTrussData.map(truss => new TrussFactory().createTruss(truss));
        }
    }

    private static async resetTrussData(): Promise<void> {
        TrussService.trussData = [];
        return await TrussService.trussDataInIt();
    }

    private findTruss(trussId: string): Truss {
        const truss = TrussService.trussData.find(truss => truss.getTrussId() == trussId);
        if (truss) {
            return truss;
        }
        throw new Error(`Truss with id: '${trussId}' does not exist!`);
    }

    private sortTrussData(block: string, trussData: TrussBasicInfo[]): any[] {
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

    private sortDataInBlockA_B_BN(trussArr: TrussBasicInfo[]): any[] {
        return trussArr.sort((a, b) => b.index - a.index);
    }

    private sortDataInBlockBS(trussArr: any[]): any[] {
        trussArr.sort((a, b) => b.index - a.index);
        trussArr.splice(1, 0, null, null);
        return trussArr;
    }

    private sortDataInBlockC(trussArr: TrussBasicInfo[]): TrussBasicInfo[] {
        trussArr.sort((a, b) => a.index - b.index);
        for (var index = 0; index < trussArr.length; index++) {
            if (index < 4) {
                const temp1 = trussArr[index];
                trussArr[index] = trussArr[12 + index];
                trussArr[12 + index] = temp1;
            }
            if (index > 3 && index < 8) {
                const temp2 = trussArr[index];
                trussArr[index] = trussArr[4 + index];
                trussArr[4 + index] = temp2;
            }
        }
        return trussArr;
    }

    private sortDataInBlockCT(trussArr: TrussBasicInfo[]): TrussBasicInfo[] {
        trussArr.sort((a, b) => a.index - b.index);
        for (var index = 0; index < 4; index++) {
            if (index < 4) {
                const temp1 = trussArr[index];
                trussArr[index] = trussArr[8 + index];
                trussArr[8 + index] = temp1;
            }
        }
        return trussArr;
    }

    private sortDataInBlockD(trussArr: any[]): TrussBasicInfo[] {
        trussArr.sort((a, b) => a.index - b.index);
        trussArr.splice(1, 0, null, null);
        return trussArr;
    }

    async getTrussDataByBlock(block: string = "all"): Promise<Truss[]> {
        try {
            await TrussService.trussDataInIt();
            if (block == "all") {
                return TrussService.trussData.map(truss => truss.getBasicTrussInfo());
            }
            const trussArr = TrussService.trussData.filter(truss => truss.getBlock() == block).map(truss => truss.getBasicTrussInfo());
            return this.sortTrussData(block, trussArr);
        } catch (err) {
            console.log(err);
            return err;
        }
    }

    async getRawTrussDataByBlock(block: string): Promise<RawTrussModel[]> {
        try {
            await TrussService.trussDataInIt();
            return TrussService.rawTrussData.filter(truss => truss.block == block);
        } catch (err) {
            console.log(err);
            return err;
        }
    }

    async updateTrussStatus({ _id, date, plantNumber, plantGrowth }: NewStatusRequest) {
        try {
            await TrussService.trussDataInIt();
            const updatedTruss: Truss = this.findTruss(_id);
            const newPlantGrowthCond = updatedTruss.getLatestPlantGrowth() <= plantGrowth;
            const newPlantNumberCond = updatedTruss.getLatestPlantNumber() >= plantNumber;
            const exceptCond = updatedTruss.getLatestPlantGrowth() == plantGrowth && updatedTruss.getLatestPlantNumber() == plantNumber;
            if (newPlantGrowthCond && newPlantNumberCond && !exceptCond) {
                const newStatus: Status = new Status(new Date(date), plantNumber, plantGrowth);
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
            return err;
        }
    }

    async clearTruss(clearedTrussId: string) {
        try {
            await TrussService.trussDataInIt();
            const clearedTruss: Truss = this.findTruss(clearedTrussId);
            if (clearedTruss.getPlantId()) {
                // Insert a new History
                const newHistory = new BasicHistoryModel().createHistoryOfTruss(clearedTruss);
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
            return err;
        }
    }

    async createNewTruss({ _id, startDate, seedId }: CreateTrussRequest) {
        try {
            await TrussService.trussDataInIt();
            const createdTruss: Truss = this.findTruss(_id);
            if (!createdTruss.getPlantId()) {
                const selectedSeed: SeedModel = await SeedService.getSeedInfo(seedId);
                const firstStatus = new Status(new Date(startDate), selectedSeed.plantNumber, 1);
                if (selectedSeed.plantNumber > createdTruss.getMaxHole()) {
                    firstStatus.plantNumber = createdTruss.getMaxHole();
                    SeedService.updateSeedNumber(selectedSeed._id, Number(selectedSeed.plantNumber - createdTruss.getMaxHole()));
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
            return err;
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
            return new err;
        }
    }

    async revertTrussStatus({ _id, statusIndex }: RevertTrussRequest) {
        try {
            await TrussService.trussDataInIt();
            const revertedTruss: Truss = this.findTruss(_id);
            if (statusIndex >= 0 && revertedTruss.getRealStatus().length > 1) {
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
            return err;
        }
    }

    async getStatistics({ block, plantGrowth, plantId }: any) {
        try {
            await TrussService.trussDataInIt();
            const filterTrussArr = TrussService.rawTrussData.filter(truss => {
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
            const trussArr = filterTrussArr.map(truss => new TrussFactory().createTruss(truss));
            return this.getDiscreteStats(trussArr);
        } catch (err) {
            console.log(err)
            return err;
        }
    }

    private getDiscreteStats(trussArrByBlock: Truss[]): Statistic[] {
        var statistics: Statistic[] = [];
        trussArrByBlock.forEach(truss => {
            if (truss.getPlantType()) {
                const statIndex = statistics.findIndex(stat => stat.plantName == truss.getPlantType().getPlantName());
                if (statIndex > -1) {
                    statistics[statIndex].plantNumber += truss.getLatestPlantNumber();
                }
                else {
                    const stat: Statistic = new Statistic().createStatisticOfTruss(truss);
                    statistics.push(stat);
                }
            }
        });
        return statistics;
    }

    async getTrussHistory(trussId: string) {
        const aggregateMethod = [{ $match: { trussId: new ObjectId(trussId) } }, ...PLANT_MERGE_LOOKUP_AGGREGATION]
        return await HistoryCollection.aggregate(aggregateMethod);
    }
}

export default new TrussService();