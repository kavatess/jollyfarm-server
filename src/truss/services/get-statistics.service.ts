import { Truss, TrussFactory } from "../models/truss.model";
import { Statistic } from "../models/statistic.model";
import { getRawTrussArr } from "./get-truss-arr.service";

export async function getStatistics({ block, plantGrowth, plantId }: any) {
    const rawTrussArr = await getRawTrussArr(block || 'all');
    const filteredTrussArr = rawTrussArr.filter(truss => {
        let filterCond = true;
        if (Number(plantGrowth) > 0) {
            const latestPlantGrowth = truss.realStatus[truss.realStatus.length - 1].plantGrowth;
            filterCond &&= (latestPlantGrowth == plantGrowth);
        }
        if (plantId) {
            filterCond &&= (truss.plantId == plantId);
        }
        return filterCond;
    }).map(truss => new TrussFactory().createTruss(truss));;
    return getDiscreteStats(filteredTrussArr);
}

function getDiscreteStats(trussArrByBlock: Truss[]): Statistic[] {
    let statistics: Statistic[] = [];
    trussArrByBlock.forEach(({ plantType, latestPlantNumber }) => {
        if (plantType) {
            const statIndex = statistics.findIndex(stat => stat.plantName == plantType.getPlantName());
            if (statIndex > -1) {
                statistics[statIndex].plantNumber += latestPlantNumber;
            }
            else {
                const stat: Statistic = {
                    plantName: plantType.getPlantName(),
                    plantColor: plantType.getPlantColor(),
                    plantNumber: latestPlantNumber
                };
                statistics.push(stat);
            }
        }
    });
    return statistics;
}