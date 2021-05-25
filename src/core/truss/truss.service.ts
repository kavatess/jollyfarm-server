import { MongoDB_Collection } from "../../configs/collection-access.mongodb";
import { Status, Truss, RawTrussModel, TrussBasicInfo, TrussFactory, Statistic, PlantingTrussInfo } from "./truss.model";
import { CreateTrussRequest, NewStatusRequest, RevertTrussRequest, UpdateMaxHoleRequest } from "./truss.request.model";
import { COLLECTION, DATABASE, PLANT_LOOKUP_AGGREGATION } from "../../server-constants";
import HistoryService from '../history/history.service';
import SeedService from '../seed/seed.service';
import { SeedModel } from "../seed/seed.model";
import { BasicHistoryModel } from "../history/history.model";

export class TrussService {
    private static trussCollection = new MongoDB_Collection(DATABASE.FARM, COLLECTION.TRUSS);
    private static rawTrussData: RawTrussModel[] = [];
    private static trussData: Truss[] = [];

    private static async trussDataInIt(): Promise<void> {
        // get truss data when empty
        if (!TrussService.trussData.length) {
            TrussService.rawTrussData = await TrussService.trussCollection.aggregate(PLANT_LOOKUP_AGGREGATION);
            TrussService.trussData = TrussService.rawTrussData.map(truss => new TrussFactory().createTruss(truss));
        }
    }

    private static async resetTrussData(): Promise<void> {
        TrussService.trussData = [];
        await TrussService.trussDataInIt();
    }

    private static findTruss(trussId: string): Truss {
        const truss = TrussService.trussData.find(truss => truss.getTrussId() == trussId);
        if (truss) {
            return truss;
        }
        throw new Error(`Truss with id: '${trussId}' does not exist!`);
    }

    private static sortTrussData(block: string, trussData: TrussBasicInfo[]): any[] {
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

    private static sortDataInBlockA_B_BN(trussArr: TrussBasicInfo[]): any[] {
        return trussArr.sort((a, b) => b.index - a.index);
    }

    private static sortDataInBlockBS(trussArr: any[]): any[] {
        trussArr.sort((a, b) => b.index - a.index);
        trussArr.splice(1, 0, null, null);
        return trussArr;
    }

    private static sortDataInBlockC(trussArr: TrussBasicInfo[]): TrussBasicInfo[] {
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

    private static sortDataInBlockCT(trussArr: TrussBasicInfo[]): TrussBasicInfo[] {
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

    private static sortDataInBlockD(trussArr: any[]): TrussBasicInfo[] {
        trussArr.sort((a, b) => a.index - b.index);
        trussArr.splice(1, 0, null, null);
        return trussArr;
    }

    public static async getTrussDataByBlock(block: string = "all"): Promise<(TrussBasicInfo | PlantingTrussInfo)[]> {
        try {
            await this.trussDataInIt();
            if (block == "all") {
                return this.trussData.map(truss => truss.getBasicTrussInfo());
            }
            const trussArr = this.trussData.filter(truss => truss.getBlock() == block).map(truss => truss.getBasicTrussInfo());
            return this.sortTrussData(block, trussArr);
        } catch (err) {
            console.log(err);
            return err;
        }
    }

    public static async getRawTrussDataByBlock(block: string): Promise<RawTrussModel[]> {
        try {
            await this.trussDataInIt();
            return this.rawTrussData.filter(truss => truss.block == block);
        } catch (err) {
            console.log(err);
            return err;
        }
    }

    public static async updateTrussStatus({ _id, date, plantNumber, plantGrowth }: NewStatusRequest) {
        try {
            await this.trussDataInIt();
            const updatedTruss: Truss = this.findTruss(_id);
            const newPlantGrowthCond = updatedTruss.getLatestPlantGrowth() <= plantGrowth;
            const newPlantNumberCond = updatedTruss.getLatestPlantNumber() >= plantNumber;
            const exceptCond = updatedTruss.getLatestPlantGrowth() == plantGrowth && updatedTruss.getLatestPlantNumber() == plantNumber;
            if (newPlantGrowthCond && newPlantNumberCond && !exceptCond) {
                const newStatus: Status = new Status(new Date(date), plantNumber, plantGrowth);
                const updateVal = { $push: { realStatus: newStatus } };
                await TrussService.trussCollection.updateOneById(_id, updateVal);
                // If update plant number is zero, we also clear the truss
                if (!newStatus.plantNumber) {
                    return await this.clearTruss(_id);
                }
                return await this.resetTrussData();
            }
            throw new Error("Invalid update status request!");
        } catch (err) {
            console.log(err);
            return err;
        }
    }

    public static async clearTruss(clearedTrussId: string) {
        try {
            await this.trussDataInIt();
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
                await this.trussCollection.updateOne(clearedTrussId, updateVal);
                return await this.resetTrussData();
            }
            throw new Error(`Cannot clear truss with ID: "${clearedTrussId}" because it is now empty.`);
        } catch (err) {
            console.log(err);
            return err;
        }
    }

    public static async createNewTruss({ _id, startDate, seedId }: CreateTrussRequest) {
        try {
            await this.trussDataInIt();
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
                await this.trussCollection.updateOne(_id, updateVal);
                return await this.resetTrussData();
            }
            throw new Error(`Cannot create truss with ID: "${_id}" because it is now being planted.`);
        } catch (err) {
            console.log(err);
            return err;
        }
    }

    public static async updateTrussMaxHole(newMaxHole: UpdateMaxHoleRequest) {
        try {
            await this.trussDataInIt();
            const updateVal = { $set: { maxHole: newMaxHole.maxHole } };
            await this.trussCollection.updateOne(newMaxHole._id, updateVal);
            return await this.resetTrussData();
        } catch (err) {
            console.log(err)
            return new err;
        }
    }

    public static async revertTrussStatus({ _id, statusIndex }: RevertTrussRequest) {
        try {
            await this.trussDataInIt();
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
                await this.trussCollection.updateOne(_id, updateVal);
                return await this.resetTrussData();
            }
            throw new Error("Invalid index status to revert.");
        } catch (err) {
            console.log(err)
            return err;
        }
    }

    public static async getStatistics({ block, plantGrowth, plantId }: any) {
        try {
            await this.trussDataInIt();
            const filterTrussArr = this.rawTrussData.filter(truss => {
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

    private static getDiscreteStats(trussArrByBlock: Truss[]): Statistic[] {
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
}