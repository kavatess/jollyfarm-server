import { ObjectId } from "bson";
import { MongoDB_Collection } from "../../../configs/mongodb-collection.config";
import { COLLECTION, DATABASE, PLANT_LOOKUP_AGGREGATION } from "../../../server-constants";
import { PlantingTrussInfo, RawTrussModel, Truss, TrussBasicInfo, TrussFactory } from "../models/truss.model";

const TRUSS_COLLECTION = new MongoDB_Collection(DATABASE.FARM, COLLECTION.TRUSS);

export async function getTrussById(trussId: string): Promise<Truss> {
    const findTrussArr: RawTrussModel[] = await TRUSS_COLLECTION.aggregate([{ $match: { _id: new ObjectId(trussId) } }, ...PLANT_LOOKUP_AGGREGATION]);
    return new TrussFactory().createTruss(findTrussArr[0]);
}

export async function getRawTrussArr(block: string = 'all'): Promise<RawTrussModel[]> {
    if (block == 'all') {
        return await TRUSS_COLLECTION.aggregate(PLANT_LOOKUP_AGGREGATION);
    }
    return await TRUSS_COLLECTION.aggregate([{ $match: { block } }, ...PLANT_LOOKUP_AGGREGATION]);
}

export async function getTrussArrByBlock(block: string = 'all'): Promise<(TrussBasicInfo | PlantingTrussInfo)[]> {
    const rawTrussArr = await getRawTrussArr(block);
    const trussArr = rawTrussArr.map(truss => new TrussFactory().createTruss(truss).getBasicTrussInfo());
    return sortTrussData(block, trussArr);
}

function sortTrussData(block: string, trussData: TrussBasicInfo[]): any[] {
    if (block == "all") {
        return trussData;
    }
    if (block == "BS") {
        return sortDataInBlockBS(trussData);
    }
    if (block == "C") {
        return sortDataInBlockC(trussData);
    }
    if (block == "CT") {
        return sortDataInBlockCT(trussData);
    }
    if (block == "D") {
        return sortDataInBlockD(trussData);
    }
    return sortDataInBlockA_B_BN(trussData);
}

function sortDataInBlockA_B_BN(trussArr: TrussBasicInfo[]): any[] {
    return trussArr.sort((a, b) => b.index - a.index);
}

function sortDataInBlockBS(trussArr: any[]): any[] {
    trussArr.sort((a, b) => b.index - a.index);
    trussArr.splice(1, 0, null, null);
    return trussArr;
}

function sortDataInBlockC(trussArr: TrussBasicInfo[]): TrussBasicInfo[] {
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

function sortDataInBlockCT(trussArr: TrussBasicInfo[]): TrussBasicInfo[] {
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

function sortDataInBlockD(trussArr: any[]): TrussBasicInfo[] {
    trussArr.sort((a, b) => a.index - b.index);
    trussArr.splice(1, 0, null, null);
    return trussArr;
}