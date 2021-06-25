import { Truss } from "../models/truss.model";
import { Statistic } from "../models/statistic.model";
import { getRawTrussArr } from "./get-truss-arr.service";
import { TrussFactory } from "../models/truss-factory.model";

export async function getTotalStatistics(block: string, plantGrowth: number, plantId: string): Promise<Statistic[]> {
    const rawTrussArr = await getRawTrussArr(block || 'all');
    const filteredTrussArr = rawTrussArr.filter(truss => {
        if (truss.plantId) {
            let filterCond = true;
            if (plantGrowth) {
                const latestPlantGrowth = truss.realStatus[truss.realStatus.length - 1].plantGrowth;
                filterCond &&= (latestPlantGrowth == plantGrowth);
            }
            if (plantId) {
                filterCond &&= (truss.plantId == plantId);
            }
            return filterCond;
        }
        return false;
    }).map(truss => new TrussFactory().createTruss(truss));;
    return getDiscreteStats(filteredTrussArr);
}

function getDiscreteStats(trussArrByBlock: Truss[]): Statistic[] {
    let statistics: Statistic[] = [];
    trussArrByBlock.forEach(({ plantType, latestPlantNumber }) => {
        const statIndex = statistics.findIndex(stat => stat.plantName == plantType.getPlantName());
        if (statIndex > -1) {
            statistics[statIndex].plantNumber += latestPlantNumber;
        }
        else {
            const stat: Statistic = new Statistic(plantType, latestPlantNumber);
            statistics.push(stat);
        }
    });
    return statistics;
}