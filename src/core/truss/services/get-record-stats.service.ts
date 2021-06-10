import { ObjectId } from "bson";
import { RECORD_COLLECTION } from "../../../configs/mongodb-collection.config";
import { HarvestStatByDate, Record } from "../models/record.model";

async function getRecordArrByPlantId(plantId: string): Promise<Record[]> {
    const queryMethod = plantId == 'all' ? {} : { plantId: new ObjectId(plantId) };
    return await RECORD_COLLECTION.findAll(queryMethod);
}

export async function getHarvestStatsByDate(month: number, plantId: string): Promise<HarvestStatByDate[]> {
    const recordArr = await getRecordArrByPlantId(plantId);
    let harvestStatsByDate: HarvestStatByDate[] = [];
    recordArr.filter(({ date }) => date.getMonth() == Number(month)).forEach(record => {
        const dateOfStat = record.date.toLocaleDateString('es-PA');
        const statIndex = harvestStatsByDate.findIndex(({ date }) => date == dateOfStat);
        if (statIndex > -1) {
            harvestStatsByDate[statIndex].harvestNumber += record.harvestNumber;
        } else {
            harvestStatsByDate.push({ date: dateOfStat, harvestNumber: record.harvestNumber });
        }
    });
    return harvestStatsByDate;
}

export async function getHarvestStatsByMonth(plantId: string): Promise<number[]> {
    const recordArr = await getRecordArrByPlantId(plantId);
    let harvestStatsByMonth = [];
    recordArr.forEach(({ date, harvestNumber }) => {
        const recordMonth = date.getMonth();
        if (harvestStatsByMonth[recordMonth]) {
            harvestStatsByMonth[recordMonth] += harvestNumber;
            return;
        }
        harvestStatsByMonth[recordMonth] = harvestNumber;
    });
    return harvestStatsByMonth;
}