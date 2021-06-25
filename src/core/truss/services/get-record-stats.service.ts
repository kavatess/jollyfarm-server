import { ObjectId } from "bson";
import { RECORD_COLLECTION } from "../../../configs/mongodb-collection.config";
import { Record } from "../models/record.model";

function getPlantIdQueryCondition(plantIdArr: string[]): object {
    return { plantId: { $in: plantIdArr.map(plantId => new ObjectId(plantId)) } };
}

async function getRecordArrWithinMonth(month: Date, plantIdArr: string[]): Promise<Record[]> {
    const dateQueryCond = { date: { $gte: month, $lte: new Date(`${month.getFullYear()}-${month.getMonth() + 2}`) } };
    return await RECORD_COLLECTION.findAll({ ...dateQueryCond, ...getPlantIdQueryCondition(plantIdArr) });
}

async function getRecordArrByMonth(date: Date, plantIdArr: string[]): Promise<Record[]> {
    const dateQueryCond = { date: { $gte: new Date(`${date.getFullYear()}`), $lte: new Date(`${date.getFullYear() + 1}`) } };
    return await RECORD_COLLECTION.findAll({ ...dateQueryCond, ...getPlantIdQueryCondition(plantIdArr) });
}

function initHarvestStatByDate(plantIdArr: string[]): object {
    let harvestStatsByDate = {};
    plantIdArr.forEach(plantId => harvestStatsByDate[plantId] = []);
    return harvestStatsByDate;
}

async function getHarvestStatsByDate(month: Date, plantIdArr: string[]): Promise<object> {
    const recordArr = await getRecordArrWithinMonth(month, plantIdArr);
    let harvestStatsByDate = initHarvestStatByDate(plantIdArr);
    recordArr.forEach(({ date, plantId, harvestNumber }) => {
        if (harvestStatsByDate[plantId][date.getDate() - 1]) {
            harvestStatsByDate[plantId][date.getDate() - 1] += harvestNumber;
            return;
        }
        harvestStatsByDate[plantId][date.getDate() - 1] = harvestNumber;
    });
    return harvestStatsByDate;
}

async function getHarvestStatsByMonth(date: Date, plantIdArr: string[]): Promise<object> {
    const recordArr = await getRecordArrByMonth(date, plantIdArr);
    let harvestStatsByMonth = initHarvestStatByDate(plantIdArr);
    recordArr.forEach(({ date, plantId, harvestNumber }) => {
        if (harvestStatsByMonth[plantId][date.getMonth()]) {
            harvestStatsByMonth[plantId][date.getMonth()] += harvestNumber;
            return;
        }
        harvestStatsByMonth[plantId][date.getMonth()] = harvestNumber;
    });
    return harvestStatsByMonth;
}

export async function getHarvestStats(date: Date, plantIdArr: string[]) {
    const harvestStatsByDate = await getHarvestStatsByDate(date, plantIdArr);
    const harvestStatsByMonth = await getHarvestStatsByMonth(date, plantIdArr);
    return { harvestStatsByDate, harvestStatsByMonth };
}