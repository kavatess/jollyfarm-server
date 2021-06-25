import { RawTrussModel } from "./raw-truss.model";
import { EmptyTruss, PlantingTruss, Truss } from "./truss.model";

export class TrussFactory {
    createTruss(truss: RawTrussModel): Truss {
        if (!truss.plantId) {
            return new EmptyTruss(truss);
        }
        return new PlantingTruss(truss);
    }
}